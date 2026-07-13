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
    keywords: { evasive: false, guard: false, overwhelm: false, swift: false, stealth: false, ...keywords },
  };
}

const DEPLOY_TRIGGERS = {
  'Stonekin Elder': ({ state, owner, turn, logs }) => {
    state.battlefield.push(makeToken({ name: 'Sapling Defender Token', power: 0, health: 4, owner, turn, keywords: { guard: true } }));
    logs.push(`Stonekin Elder creates a 0/4 Sapling Defender token with Guard.`);
  },
};

const DESTROY_TRIGGERS = {
  'Ashen Penitent': ({ state, owner, logs }) => {
    const opponent = owner === 1 ? 2 : 1;
    damageNexus(state, opponent, 2, logs);
    logs.push(`Ashen Penitent's destruction deals 2 damage to the enemy Nexus.`);
  },
  'Voidling Swarm': ({ state, owner, turn, logs }) => {
    state.battlefield.push(makeToken({ name: 'Voidling Token', power: 1, health: 1, owner, turn }));
    logs.push(`Voidling Swarm's destruction creates a 1/1 Voidling token.`);
  },
};

export function resolveDeployTrigger({ state, entity, turn }) {
  const logs = [];
  const trigger = DEPLOY_TRIGGERS[entity.name];
  if (trigger) trigger({ state, owner: entity.owner, turn, logs });
  return { logs };
}

export function resolveDestroyTrigger({ state, entity, turn }) {
  const logs = [];
  const trigger = DESTROY_TRIGGERS[entity.name];
  if (trigger) trigger({ state, owner: entity.owner, turn, logs });
  return { logs };
}
