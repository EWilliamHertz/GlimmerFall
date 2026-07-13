// Spell effect resolver, built against the actual GlimmerFall card text export.
//
// Coverage in this version:
//   - Direct damage: fixed number, "any target" (entity or enemy Nexus), AOE
//     ("all opposing Entities", "all Entities with Power N or greater")
//   - Destroy: single target, AOE by power threshold, "sacrifice lowest Power"
//     (Soul Tithe-style, auto-picked — no manual choice needed)
//   - Buff/debuff: "+X/+Y" and "-X/-Y", single target (duration is NOT tracked —
//     see note below)
//   - Heal your Nexus: fixed number
//   - Draw N cards / discard N cards (numbers as digits or words: "two", "three")
//   - Token creation: "Create [a|two|...] P/H <Name> token(s)"
//   - A few named one-offs that don't fit a generic pattern (Aetheric Blast's
//     variable damage, Brilliant Reversal's shield, The Infinite Loop's extra
//     turn, Reality Fracture's health swap, Verdant Reclaim's Void->hand)
//
// Explicitly NOT implemented yet (falls through to a generic "resolves" log,
// so the card still goes to the graveyard and the game doesn't break — the
// stated effect just doesn't happen mechanically):
//   - Spell countering (Countercurrent, Fading Memory) — needs a priority/stack
//     system this engine doesn't have
//   - Chrono Shift (return Entity to hand) — needs cross-player hand delivery,
//     see clientHints.returnEntityToOwner below for the partial plumbing
//   - Displacement Field / Purge the Gloom (exile until End Phase) — needs a
//     phase system
//   - Whispers of the Void (reveal opponent's hand) — hand isn't server-tracked
//     at all, so this is fundamentally unavailable without a bigger rework
//   - Relic-specific conditions (Unmake's "with a Relic attached", Landslide
//     Verdict's Relic destroy) — Relics don't have a battlefield home yet
//   - "Until End Phase" durations — buffs/debuffs here are treated as
//     permanent since there's no turn-based cleanup step yet
//   - Entity keyword abilities entirely (Evasive, Guard, Overwhelm, Swift,
//     Stealth, "When deployed", "When destroyed", Awakening Phase triggers) —
//     out of scope for this pass, which is spells only

const WORD_NUMBERS = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10 };
function parseCount(str) {
  const n = parseInt(str, 10);
  if (!isNaN(n)) return n;
  return WORD_NUMBERS[(str || '').toLowerCase()] || 1;
}

function findEntity(state, targetId) {
  return state.battlefield.find(c => c.id === targetId);
}

function destroyEntity(state, entity, logs) {
  const idx = state.battlefield.findIndex(c => c.id === entity.id);
  if (idx === -1) return;
  logs.push(`${entity.name} was destroyed!`);
  const [dead] = state.battlefield.splice(idx, 1);
  state.graveyard.push(dead);
}

function damageEntity(state, entity, amount, logs) {
  entity.currentHealth = (entity.currentHealth ?? entity.health) - amount;
  logs.push(`${entity.name} takes ${amount} damage.`);
  if (entity.currentHealth <= 0) destroyEntity(state, entity, logs);
}

function damageNexus(state, targetPlayer, amount, logs) {
  const shieldKey = `player${targetPlayer}_shield`;
  let shield = state[shieldKey] || 0;
  let remaining = amount;
  if (shield > 0) {
    const absorbed = Math.min(shield, remaining);
    state[shieldKey] = shield - absorbed;
    remaining -= absorbed;
    if (absorbed > 0) logs.push(`${absorbed} damage absorbed by a shield.`);
  }
  if (remaining > 0) {
    state[`player${targetPlayer}_hp`] -= remaining;
    logs.push(`${remaining} damage dealt to the Nexus.`);
  }
}

// Named one-offs that need bespoke handling instead of a generic regex.
const CARD_OVERRIDES = {
  'Aetheric Blast': ({ state, player, card, targetId, casterHandSize, logs }) => {
    const target = findEntity(state, targetId);
    const amount = casterHandSize ?? 0;
    if (target && target.owner !== player) damageEntity(state, target, amount, logs);
    else logs.push(`${card.name} needed a valid enemy Entity target.`);
    return true;
  },
  'Soul Tithe': ({ state, player, card, logs }) => {
    const opponent = player === 1 ? 2 : 1;
    const foes = state.battlefield.filter(c => c.owner === opponent);
    if (foes.length === 0) { logs.push(`${card.name} found no target.`); return true; }
    const lowest = foes.reduce((a, b) => (a.power ?? 0) <= (b.power ?? 0) ? a : b);
    destroyEntity(state, lowest, logs);
    return true;
  },
  'Verdant Reclaim': ({ state, player, card, logs, clientHints }) => {
    const idx = state.graveyard.findIndex(c => c.owner === player && c.card_type === 'Relic');
    if (idx === -1) { logs.push(`${card.name} found no Relic in your Void.`); return true; }
    const [reclaimed] = state.graveyard.splice(idx, 1);
    clientHints.returnedCardToHand = reclaimed;
    logs.push(`${reclaimed.name} returns from the Void to hand.`);
    return true;
  },
  'Brilliant Reversal': ({ state, player, card, logs }) => {
    const key = `player${player}_shield`;
    state[key] = (state[key] || 0) + 3;
    logs.push(`${card.name} shields your Nexus from the next 3 damage.`);
    return true;
  },
  'The Infinite Loop': ({ state, player, card, logs }) => {
    state.extraTurnFor = player;
    logs.push(`${card.name} grants an extra turn!`);
    return true;
  },
  'Reality Fracture': ({ state, card, targetId, targetId2, logs }) => {
    const a = findEntity(state, targetId);
    const b = findEntity(state, targetId2);
    if (!a || !b) { logs.push(`${card.name} needed two valid targets.`); return true; }
    const tmp = a.health; a.health = b.health; b.health = tmp;
    a.currentHealth = a.health; b.currentHealth = b.health;
    logs.push(`${a.name} and ${b.name} swap Health.`);
    return true;
  },
  'Chrono Shift': ({ state, card, targetId, logs, clientHints }) => {
    const target = findEntity(state, targetId);
    if (!target) { logs.push(`${card.name} needed a valid target.`); return true; }
    destroyEntity(state, target, []); // remove from board without a "destroyed" log
    state.graveyard.pop(); // it's returning to hand, not the Void — undo the graveyard push
    if (!state.pendingReturns) state.pendingReturns = [];
    const returnId = `ret_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
    state.pendingReturns.push({ returnId, owner: target.owner, card: target });
    logs.push(`${target.name} returns to its owner's hand.`);
    return true;
  },
};

export function resolveSpellEffect({ state, player, card, targetId, targetId2, turn, casterHandSize }) {
  if (!state.graveyard) state.graveyard = [];
  const desc = card.description || '';
  const logs = [];
  const clientHints = { draw: 0, discard: 0, returnedCardToHand: null };
  const opponent = player === 1 ? 2 : 1;

  if (CARD_OVERRIDES[card.name]) {
    CARD_OVERRIDES[card.name]({ state, player, card, targetId, targetId2, turn, casterHandSize, logs, clientHints });
  } else {
    const explicitTarget = targetId && targetId !== 'battlefield' && targetId !== 'opponent_vanguard'
      ? findEntity(state, targetId)
      : null;

    const dmgMatch = desc.match(/deals?\s+(\d+)\s+damage/i);
    const healMatch = desc.match(/heals?\s+your\s+nexus\s+(\d+)|(?:heals?|restores?)\s+(\d+)/i);
    const buffMatch = desc.match(/\+(\d+)\s*\/\s*\+(\d+)/);
    const debuffMatch = desc.match(/-(\d+)\s*\/\s*-(\d+)/);
    const destroyMatch = /destroy target/i.test(desc);
    const destroyThreshold = desc.match(/destroy all entities with power\s+(\d+)\s+or\s+(greater|less)/i);
    const aoeEnemy = /all\s+(enemy|opposing|enemies)/i.test(desc);
    const aoeAllBoard = /all(\s+non-\w+)?\s+entities\b/i.test(desc) && !aoeEnemy;
    const drawMatch = desc.match(/draw\s+(a|an|one|two|three|four|five|\d+)\s+cards?/i);
    const discardMatch = desc.match(/discard\s+(a|an|one|two|three|four|five|\d+)\s+cards?/i);
    const tokenMatch = desc.match(/create\s+(a|an|one|two|three|four|\d+)\s+(\d+)\s*\/\s*(\d+)\s+(.+?)\s+tokens?\b/i);

    let handled = false;

    if (dmgMatch) {
      const amount = parseInt(dmgMatch[1], 10);
      if (aoeEnemy) {
        state.battlefield.filter(c => c.owner !== player).forEach(e => damageEntity(state, e, amount, logs));
      } else if (aoeAllBoard) {
        [...state.battlefield].forEach(e => damageEntity(state, e, amount, logs));
      } else if (explicitTarget) {
        damageEntity(state, explicitTarget, amount, logs);
      } else {
        damageNexus(state, opponent, amount, logs);
      }
      handled = true;
    }

    if (destroyThreshold) {
      const threshold = parseInt(destroyThreshold[1], 10);
      const cmp = destroyThreshold[2].toLowerCase() === 'greater' ? (p => p >= threshold) : (p => p <= threshold);
      [...state.battlefield].filter(e => cmp(e.power ?? 0)).forEach(e => destroyEntity(state, e, logs));
      handled = true;
    } else if (destroyMatch && explicitTarget) {
      destroyEntity(state, explicitTarget, logs);
      handled = true;
    }

    if (healMatch) {
      const amount = parseInt(healMatch[1] || healMatch[2], 10);
      if (player === 1) state.player1_hp += amount; else state.player2_hp += amount;
      logs.push(`${card.name} heals your Nexus for ${amount}.`);
      handled = true;
    }

    if (buffMatch && explicitTarget) {
      const p = parseInt(buffMatch[1], 10), h = parseInt(buffMatch[2], 10);
      explicitTarget.power = (explicitTarget.power || 0) + p;
      explicitTarget.health = (explicitTarget.health || 0) + h;
      explicitTarget.currentHealth = (explicitTarget.currentHealth ?? explicitTarget.health) + h;
      logs.push(`${explicitTarget.name} gets +${p}/+${h}.`);
      handled = true;
    }

    if (debuffMatch && explicitTarget) {
      const p = parseInt(debuffMatch[1], 10), h = parseInt(debuffMatch[2], 10);
      explicitTarget.power = Math.max(0, (explicitTarget.power || 0) - p);
      explicitTarget.health = Math.max(1, (explicitTarget.health || 0) - h);
      explicitTarget.currentHealth = Math.min(explicitTarget.currentHealth ?? explicitTarget.health, explicitTarget.health);
      logs.push(`${explicitTarget.name} gets -${p}/-${h}.`);
      handled = true;
    }

    if (tokenMatch) {
      const count = parseCount(tokenMatch[1]);
      const power = parseInt(tokenMatch[2], 10);
      const health = parseInt(tokenMatch[3], 10);
      const name = tokenMatch[4].trim();
      for (let i = 0; i < count; i++) {
        state.battlefield.push({
          id: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          name: `${name} Token`, card_type: 'Entity', cost: 0,
          power, health, currentHealth: health,
          owner: player, turnSummoned: turn,
        });
      }
      logs.push(`${card.name} creates ${count} ${name} token(s).`);
      handled = true;
    }

    if (drawMatch) { clientHints.draw = parseCount(drawMatch[1]); handled = true; }
    if (discardMatch) { clientHints.discard = parseCount(discardMatch[1]); handled = true; }

    if (!handled) {
      logs.push(`${card.name} resolves (this effect isn't automated yet).`);
    }
  }

  let matchOver = null;
  if (state.player1_hp <= 0 || state.player2_hp <= 0) {
    matchOver = state.player1_hp <= 0 ? 'PLAYER 2 WINS' : 'PLAYER 1 WINS';
  }

  return { logs, matchOver, clientHints };
}

