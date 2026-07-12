// Lightweight, text-driven spell effect resolver.
// Instead of hand-writing a special case for each of the ~100 cards, this reads
// the card's `description` field and applies whichever recognized pattern(s) match.
// Unknown / unrecognized text is safe: the spell still resolves (goes to the
// graveyard) and just logs a generic "resolves" message instead of crashing
// or being silently dropped.
//
// Recognized patterns (case-insensitive):
//   "Deal X damage"                          -> damage to a target entity, or the
//                                                enemy Vanguard if no entity is targeted
//   "...to all enemy/opposing entities"      -> damage becomes an AOE on all opponent entities
//   "Destroy target entity" / "destroy an enemy creature" -> destroys the targeted entity
//   "Heal X" / "Restore X"                   -> heals a targeted friendly entity, or your
//                                                own Vanguard if no entity is targeted
//   "+X/+Y"                                  -> buffs power/health of the targeted friendly
//                                                entity, or all your entities if "all your"/
//                                                "all allied"/"all friendly" is present
//   "Draw a card" / "Draw X cards"           -> reported back via clientHints (hand is
//                                                client-local, so the draw itself happens
//                                                on the casting player's client)
//   "Gain X energy"                          -> reported back via clientHints, same reason

function findEntity(state, targetId) {
  return state.battlefield.find(c => c.id === targetId);
}

function damageEntity(state, entity, amount, logs) {
  entity.currentHealth = (entity.currentHealth ?? entity.health) - amount;
  logs.push(`${entity.name} takes ${amount} damage.`);
  if (entity.currentHealth <= 0) {
    logs.push(`${entity.name} was destroyed!`);
    const idx = state.battlefield.findIndex(c => c.id === entity.id);
    if (idx !== -1) {
      const [dead] = state.battlefield.splice(idx, 1);
      state.graveyard.push(dead);
    }
  }
}

export function resolveSpellEffect({ state, player, card, targetId }) {
  if (!state.graveyard) state.graveyard = [];
  const desc = card.description || '';
  const logs = [];
  const opponent = player === 1 ? 2 : 1;

  const dmgMatch = desc.match(/deals?\s+(\d+)\s+damage/i);
  const healMatch = desc.match(/(?:heals?|restores?)\s+(\d+)/i);
  const buffMatch = desc.match(/\+(\d+)\s*\/\s*\+(\d+)/);
  const destroyMatch = /destroy target|destroy an?\s+(enemy\s+)?(entity|creature)/i.test(desc);
  const aoeEnemy = /all\s+(enemy|opposing|enemies)/i.test(desc);
  const aoeSelf = /all\s+(your|allied|friendly)/i.test(desc);
  const drawMatch = desc.match(/draw\s+(a card|\d+\s+cards?)/i);
  const energyMatch = desc.match(/gain\s+(\d+)\s+energy/i);

  const explicitTarget = targetId && targetId !== 'battlefield' && targetId !== 'opponent_vanguard'
    ? findEntity(state, targetId)
    : null;

  // Damage
  if (dmgMatch) {
    const amount = parseInt(dmgMatch[1], 10);
    if (aoeEnemy) {
      state.battlefield.filter(c => c.owner !== player).forEach(e => damageEntity(state, e, amount, logs));
    } else if (explicitTarget && explicitTarget.owner !== player) {
      damageEntity(state, explicitTarget, amount, logs);
    } else if (!explicitTarget) {
      // No entity targeted -> hits the enemy Vanguard directly
      if (opponent === 1) state.player1_hp -= amount; else state.player2_hp -= amount;
      logs.push(`${card.name} deals ${amount} damage to the enemy Vanguard!`);
    }
  }

  // Destroy
  if (destroyMatch && explicitTarget && explicitTarget.owner !== player) {
    logs.push(`${explicitTarget.name} was destroyed by ${card.name}!`);
    const idx = state.battlefield.findIndex(c => c.id === explicitTarget.id);
    if (idx !== -1) {
      const [dead] = state.battlefield.splice(idx, 1);
      state.graveyard.push(dead);
    }
  }

  // Heal
  if (healMatch) {
    const amount = parseInt(healMatch[1], 10);
    if (explicitTarget && explicitTarget.owner === player) {
      explicitTarget.currentHealth = Math.min(
        (explicitTarget.currentHealth ?? explicitTarget.health) + amount,
        explicitTarget.health
      );
      logs.push(`${explicitTarget.name} heals ${amount}.`);
    } else {
      if (player === 1) state.player1_hp += amount; else state.player2_hp += amount;
      logs.push(`${card.name} restores ${amount} HP to your Vanguard.`);
    }
  }

  // Buff
  if (buffMatch) {
    const pBoost = parseInt(buffMatch[1], 10);
    const hBoost = parseInt(buffMatch[2], 10);
    const targets = aoeSelf
      ? state.battlefield.filter(c => c.owner === player)
      : (explicitTarget && explicitTarget.owner === player ? [explicitTarget] : []);
    targets.forEach(e => {
      e.power = (e.power || 0) + pBoost;
      e.health = (e.health || 0) + hBoost;
      e.currentHealth = (e.currentHealth ?? e.health) + hBoost;
      logs.push(`${e.name} gets +${pBoost}/+${hBoost}.`);
    });
  }

  if (!dmgMatch && !destroyMatch && !healMatch && !buffMatch) {
    logs.push(`${card.name} resolves.`);
  }

  let matchOver = null;
  if (state.player1_hp <= 0 || state.player2_hp <= 0) {
    matchOver = state.player1_hp <= 0 ? 'PLAYER 2 WINS' : 'PLAYER 1 WINS';
  }

  return {
    logs,
    matchOver,
    clientHints: {
      draw: drawMatch ? (drawMatch[1].startsWith('a') ? 1 : parseInt(drawMatch[1], 10)) : 0,
      energy: energyMatch ? parseInt(energyMatch[1], 10) : 0,
    },
  };
}
