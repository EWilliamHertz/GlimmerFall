// Parses the handful of keyword abilities that appear on Entities in the
// GlimmerFall card set. These are simple boolean flags attached to a
// battlefield entity when it's deployed, then read by the combat logic in
// action.js.
//
// How each maps onto this game's *direct-target* attack model (there's no
// separate declare-attackers/declare-blockers step — an attacking Entity is
// dragged straight onto either the enemy Vanguard or a specific enemy Entity):
//   - Guard:      if the defender controls any Guard Entity, non-Evasive
//                 attackers must target a Guard Entity — they can't hit the
//                 Vanguard or a non-Guard Entity directly.
//   - Evasive:    bypasses the Guard requirement above (can always attack
//                 the Vanguard freely).
//   - Overwhelm:  if this Entity's attack on a target Entity deals more
//                 onto the enemy Vanguard.
//   - Stealth:    can't be chosen as the target of an attack or a spell;
//                 the flag clears once the Entity itself attacks.

export function parseKeywords(description) {
  const desc = description || '';
  return {
    evasive: /\bEvasive\b/i.test(desc),
    guard: /\bGuard\b/i.test(desc),
    overwhelm: /\bOverwhelm\b/i.test(desc),
    stealth: /\bStealth\b/i.test(desc),
  };
}
