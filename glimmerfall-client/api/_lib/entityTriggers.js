// Resolves the small subset of Entity "When deployed" / "When destroyed"
// triggers that are fully server-resolvable (no target picking, no deck/hand
// access needed). Named dispatch, same approach as api/_lib/effects.js.
//
// NOT covered here yet (deferred — see conversation notes):
//   - Anything needing deck peek/search/reorder (Deepstone Miner, Firstlight
//     Scout, Mind Sculptor, Rootbound Mystic, Mossback Forager, The Nightfall
//     King) — the deck is client-local, not server-tracked, so these need a
//     cross-client "hint" delivery system similar to Chrono Shift's
//     pendingReturns before they can fire correctly when triggered by an
//     opponent's action (e.g. a destroy trigger fired by being attacked)
//   - Anything needing a target choice on deploy (Sunspear Adept, Avalanche
//     Herd, Skyrail Saboteur) — there's no "deploy, then choose a target" UI
//     step yet
//   - Anything needing opponent hand access (Duskblade Fiend, Hollow
//     Courtier) — hand isn't server-tracked at all
//   - Relic-returning ones (Prism Courier, Sepulcher Warden), Void-based
//     resurrection (The Nightfall King), and Overload-comparison (Zenith
//     Inquisitor) — Relics/Overload aren't tracked yet

import { damageNexus } from './effects.js';

function makeToken({ name, power, health, owner, turn, keywords }) {
  return {
    id: `tok_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name, card_type: 'Entity', cost: 0,
    power, health, currentHealth: health,
    owner, turnSummoned: turn,
    keywords: { evasive: false, guard: false, overwhelm: false, stealth: false, ...keywords },
  };
}

const DEPLOY_TRIGGERS = {
  'Stonekin Elder': ({ state, owner, turn, logs, clientHints }) => {
    state.battlefield.push(makeToken({ name: 'Sapling Defender Token', power: 0, health: 4, owner, turn, keywords: { guard: true } }));
    logs.push(`Stonekin Elder creates a 0/4 Sapling Defender token with Guard.`);
  },
  'Citadel Seraph': ({ state, owner, logs }) => {
    state.battlefield.forEach(c => {
      if (c.owner === owner && c.name !== 'Citadel Seraph') {
        if (!c.keywords) c.keywords = {};
        c.keywords.guard = true;
        c.temporaryGuard = true;
      }
    });
    logs.push(`Citadel Seraph gives other allied Entities Guard.`);
  },
  'Rootbound Mystic': ({ state, owner, logs, clientHints }) => {
    clientHints.putGlimmerNode = (clientHints.putGlimmerNode || 0) + 1;
    logs.push(`Rootbound Mystic grows a Glimmer Node from your deck.`);
  },
  'Hollow Courtier': ({ state, logs, clientHints }) => {
    clientHints.discard = (clientHints.discard || 0) + 1;
    clientHints.opponentDiscard = (clientHints.opponentDiscard || 0) + 1;
    logs.push(`Hollow Courtier forces both players to discard a card.`);
  },
  'Avalanche Herd': ({ state, owner, logs, targetId }) => {
    const opponent = owner === 1 ? 2 : 1;
    let target = state.battlefield.find(c => c.id === targetId && c.owner === opponent && c.card_type === 'Entity');
    if (!target) {
      // automated fallback if target was invalid or missing
      const enemies = state.battlefield.filter(c => c.owner === opponent && c.card_type === 'Entity' && !c.exhausted);
      if (enemies.length > 0) target = enemies[Math.floor(Math.random() * enemies.length)];
    }
    if (target) {
      target.exhausted = true;
      logs.push(`Avalanche Herd exhausts ${target.name}.`);
    } else {
      logs.push(`Avalanche Herd's deploy effect fizzles (no valid target).`);
    }
  },
  'Sunspear Adept': ({ state, owner, logs, targetId }) => {
    let damage = 1;
    const targetEntity = state.battlefield.find(c => c.id === targetId);
    
    if (targetEntity) {
      if (targetEntity.currentHealth < targetEntity.health) damage = 2; // "If it is damaged, deal 2 instead"
      targetEntity.currentHealth -= damage;
      logs.push(`Sunspear Adept deals ${damage} damage to ${targetEntity.name}.`);
    } else {
      const opponent = owner === 1 ? 2 : 1;
      damageNexus(state, opponent, 1, logs);
      logs.push(`Sunspear Adept deals 1 damage to the enemy Vanguard.`);
    }
  },
  'Sepulcher Warden': ({ state, owner, logs, clientHints }) => {
    const validTargets = state.voidZone.filter(c => c.owner === owner && c.card_type === 'Entity' && c.cost <= 2);
    if (validTargets.length > 0) {
      const targetIndex = Math.floor(Math.random() * validTargets.length);
      const target = validTargets.splice(targetIndex, 1)[0];
      clientHints.returnedCardToHand = target;
      logs.push(`Sepulcher Warden returns ${target.name} from the Void to hand.`);
    }
  },
  'Firstlight Scout': ({ state, owner, logs, clientHints }) => {
    clientHints.scry = 1;
    logs.push(`Firstlight Scout allows you to peek at the top card of your deck.`);
  },
  'Deepstone Miner': ({ state, owner, logs, clientHints }) => {
    clientHints.scry = 1;
    logs.push(`Deepstone Miner reveals the top card of the deck.`);
  },
  'Mind Sculptor': ({ state, owner, logs, clientHints }) => {
    clientHints.draw = 1;
    clientHints.scry = 2;
    logs.push(`Mind Sculptor looks at the top three cards and takes one.`);
  },
  'Zenith Inquisitor': ({ state, owner, logs, clientHints }) => {
    clientHints.draw = 1;
    logs.push(`Zenith Inquisitor draws a card.`);
  },
  'The Nightfall King': ({ state, owner, logs, clientHints }) => {
    const validTargets = state.voidZone.filter(c => c.owner === owner && c.card_type === 'Entity');
    if (validTargets.length > 0) {
      const targetIndex = Math.floor(Math.random() * validTargets.length);
      const target = validTargets.splice(targetIndex, 1)[0];
      state.battlefield.push({ ...target, currentHealth: target.health, exhausted: false });
      logs.push(`The Nightfall King resurrects ${target.name} from the Void!`);
    } else {
      logs.push(`The Nightfall King found no Entity in the Void.`);
    }
  },
};

const DESTROY_TRIGGERS = {
  'Ashen Penitent': ({ state, owner, logs, clientHints }) => {
    const opponent = owner === 1 ? 2 : 1;
    damageNexus(state, opponent, 2, logs);
    logs.push(`Ashen Penitent's destruction deals 2 damage to the enemy Nexus.`);
  },
  'Voidling Swarm': ({ state, owner, turn, logs, clientHints }) => {
    state.battlefield.push(makeToken({ name: 'Voidling Token', power: 1, health: 1, owner, turn }));
    logs.push(`Voidling Swarm's destruction creates a 1/1 Voidling token.`);
  },
  'Static Anomaly': ({ state, owner, logs, clientHints }) => {
    clientHints.draw = (clientHints.draw || 0) + 1;
    logs.push(`Static Anomaly draws a card upon destruction.`);
  },
  'Mossback Forager': ({ state, owner, logs, clientHints }) => {
    clientHints.putGlimmerNode = (clientHints.putGlimmerNode || 0) + 1;
    logs.push(`Mossback Forager grows a Glimmer Node from your deck.`);
  },
  'Duskblade Fiend': ({ state, owner, logs, clientHints }) => {
    clientHints.opponentDiscard = (clientHints.opponentDiscard || 0) + 1;
    logs.push(`Duskblade Fiend forces the opponent to discard a card.`);
  },
};

export function resolveDeployTrigger({ state, entity, turn }) {
  const logs = [];
  const clientHints = {};
  const trigger = DEPLOY_TRIGGERS[entity.name];
  if (trigger) trigger({ state, owner: entity.owner, turn, logs, clientHints });
  return { logs, clientHints };
}

export function resolveDestroyTrigger({ state, entity, turn }) {
  const logs = [];
  const clientHints = {};
  const trigger = DESTROY_TRIGGERS[entity.name];
  if (trigger) trigger({ state, owner: entity.owner, turn, logs, clientHints });
  return { logs, clientHints };
}
