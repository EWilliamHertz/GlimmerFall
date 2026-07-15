import pkg from 'pg';
const { Pool } = pkg;
import { resolveSpellEffect, damageNexus } from './_lib/effects.js';
import { parseKeywords } from './_lib/keywords.js';
import { resolveDeployTrigger, resolveDestroyTrigger } from './_lib/entityTriggers.js';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { matchId, player, action, payload } = req.body;

  const mergeHints = (state, hints, sourcePlayer) => {
    if (!hints || Object.keys(hints).length === 0) return;
    state.pendingHints = state.pendingHints || [];
    const hintObj = { id: `hint_${Date.now()}_${Math.random()}`, sourcePlayer };
    
    // We can distribute hints to players
    if (hints.draw) hintObj.draw = hints.draw;
    if (hints.discard) hintObj.discard = hints.discard;
    if (hints.opponentDiscard) hintObj.opponentDiscard = hints.opponentDiscard;
    if (hints.putGlimmerNode) hintObj.putGlimmerNode = hints.putGlimmerNode;
    if (hints.returnedCardToHand) hintObj.returnedCardToHand = hints.returnedCardToHand;
    
    state.pendingHints.push(hintObj);
  };

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM matches WHERE id = $1 FOR UPDATE', [matchId]);
    if (result.rows.length === 0) throw new Error('Match not found');

    const match = result.rows[0];
    if (match.status !== 'PLAYING' && match.status !== 'MULLIGAN') throw new Error('Match is over');

    let state = match.state;
    if (!state.graveyard) state.graveyard = [];
    if (!state.pendingReturns) state.pendingReturns = [];
    if (!state.pendingHints) state.pendingHints = [];
    if (!state.log) state.log = [];
    if (state.player1_shield === undefined) state.player1_shield = 0;
    if (state.player2_shield === undefined) state.player2_shield = 0;
    
    if (action === 'END_TURN') {
      if (state.extraTurnFor && state.extraTurnFor === player) {
        state.log.unshift(`Player ${player} takes an extra turn!`);
        state.extraTurnFor = null;
      } else {
        match.active_player = match.active_player === match.player1 ? match.player2 : match.player1;
      }
      match.current_turn += 1;
      state.log.unshift(`Turn ${match.current_turn} begins.`);
      
      // Clear exhaustion and temporary guard for the NEW active player's entities
      const activePlayerNum = match.active_player === match.player1 ? 1 : 2;
      state.battlefield.forEach(c => {
         if (c.owner === activePlayerNum) {
           c.exhausted = false;
           if (c.temporaryGuard) {
             c.temporaryGuard = false;
             if (c.keywords) c.keywords.guard = false;
           }
         }
      });
    } else if (action === 'PLAY_CARD') {
      // payload = { zone: 'battlefield' or 'resonanceRow', card: {} }
      if (payload.zone === 'battlefield') {
        const entity = {
          ...payload.card,
          owner: player,
          currentHealth: payload.card.health,
          keywords: parseKeywords(payload.card.description),
          exhausted: true // Summoning sickness
        };
        state.battlefield.push(entity);
        state.log.unshift(`Player ${player} summoned ${payload.card.name}.`);
        const { logs: deployLogs, clientHints } = resolveDeployTrigger({ state, entity, turn: match.current_turn, targetId: payload.targetId });
        deployLogs.forEach(l => state.log.unshift(l));
        mergeHints(state, clientHints, player);
      } else {
        state.resonanceRow.push({ ...payload.card, owner: player });
        state.log.unshift(`Player ${player} placed a node.`);
      }
    } else if (action === 'ATTACK_VANGUARD') {
      const attacker = state.battlefield.find(c => c.id === payload.attackerId);
      if (attacker) attacker.exhausted = true;
      const opponentNum = player === 1 ? 2 : 1;
      const guardians = state.battlefield.filter(c => c.owner === opponentNum && c.keywords?.guard);
      if (guardians.length > 0 && !attacker?.keywords?.evasive) {
        throw new Error(`${attacker?.name || 'Your Entity'} must attack a Guard Entity — the opponent has one in play!`);
      }
      const damage = payload.power;
      if (player === 1) state.player2_hp -= damage;
      else state.player1_hp -= damage;
      state.log.unshift(`Player ${player} attacked the vanguard for ${damage} damage!`);
      if (attacker?.keywords?.stealth) {
        attacker.keywords.stealth = false;
        state.log.unshift(`${attacker.name}'s Stealth fades after attacking.`);
      }

      if (state.player1_hp <= 0 || state.player2_hp <= 0) {
        match.status = state.player1_hp <= 0 ? 'PLAYER 2 WINS' : 'PLAYER 1 WINS';
        state.log.unshift(`MATCH OVER! ${match.status}!`);
      }
    } else if (action === 'ATTACK_ENTITY') {
      const attacker = state.battlefield.find(c => c.id === payload.attackerId);
      if (attacker) attacker.exhausted = true;
      const opponentNum = player === 1 ? 2 : 1;
      const targetIndex = state.battlefield.findIndex(c => c.id === payload.targetId);
      if (targetIndex !== -1) {
        const target = state.battlefield[targetIndex];
        if (target.card_type === 'Relic' || target.card_type === 'Artifact') {
          throw new Error(`${target.name} is an Artifact and cannot be attacked.`);
        }
        if (target.keywords?.stealth) {
          throw new Error(`${target.name} has Stealth and can't be targeted.`);
        }
        const guardians = state.battlefield.filter(c => c.owner === opponentNum && c.keywords?.guard);
        if (guardians.length > 0 && !target.keywords?.guard && !attacker?.keywords?.evasive) {
          throw new Error(`${attacker?.name || 'Your Entity'} must attack a Guard Entity — the opponent has one in play!`);
        }

        const damage = payload.power;
        const healthBefore = target.currentHealth;
        target.currentHealth -= damage;
        
        let counterDamageStr = "";
        if (target.power && target.power > 0) {
          attacker.currentHealth -= target.power;
          counterDamageStr = ` and took ${target.power} damage back`;
        }
        
        state.log.unshift(`Player ${player} dealt ${damage} damage to ${target.name}${counterDamageStr}!`);
        
        // Handle attacker death
        if (attacker.currentHealth <= 0) {
          state.log.unshift(`${attacker.name} was destroyed in combat!`);
          const attackerIndex = state.battlefield.findIndex(c => c.id === payload.attackerId);
          if (attackerIndex !== -1) state.battlefield.splice(attackerIndex, 1);
          state.graveyard.push(attacker);
          const { logs: destroyLogs, clientHints } = resolveDestroyTrigger({ state, entity: attacker, turn: match.current_turn });
          destroyLogs.forEach(l => state.log.unshift(l));
          mergeHints(state, clientHints, player);
        }

        // Handle target death
        if (target.currentHealth <= 0) {
          state.log.unshift(`${target.name} was destroyed!`);
          const newTargetIndex = state.battlefield.findIndex(c => c.id === payload.targetId);
          if (newTargetIndex !== -1) state.battlefield.splice(newTargetIndex, 1);
          state.graveyard.push(target);
          const { logs: destroyLogs, clientHints } = resolveDestroyTrigger({ state, entity: target, turn: match.current_turn });
          destroyLogs.forEach(l => state.log.unshift(l));
          mergeHints(state, clientHints, player);
          if (attacker?.keywords?.overwhelm && damage > healthBefore) {
            const excess = damage - healthBefore;
            const spillLogs = [];
            damageNexus(state, opponentNum, excess, spillLogs);
            for (let i = spillLogs.length - 1; i >= 0; i--) state.log.unshift(spillLogs[i]);
            state.log.unshift(`${attacker.name}'s Overwhelm spills ${excess} damage to the enemy Nexus!`);
          }
        }
        if (attacker?.keywords?.stealth) {
          attacker.keywords.stealth = false;
          state.log.unshift(`${attacker.name}'s Stealth fades after attacking.`);
        }
      }
    } else if (action === 'CAST_SPELL') {
      const { card, targetId, targetId2, casterHandSize } = payload;
      const { logs, matchOver, clientHints, destroyed } = resolveSpellEffect({ state, player, card, targetId, targetId2, turn: match.current_turn, casterHandSize });
      state.graveyard.push({ id: card.id, name: card.name, card_type: card.card_type, owner: player });
      logs.forEach(l => state.log.unshift(l));
      (destroyed || []).forEach(entity => {
        const { logs: destroyLogs, clientHints: destroyHints } = resolveDestroyTrigger({ state, entity, turn: match.current_turn });
        destroyLogs.forEach(l => state.log.unshift(l));
        mergeHints(state, destroyHints, player);
      });
      if (matchOver) {
        match.status = matchOver;
        state.log.unshift(`MATCH OVER! ${match.status}!`);
      }
      mergeHints(state, clientHints, player);
    } else if (action === 'CLAIM_HINT') {
      if (state.pendingHints) {
        state.pendingHints = state.pendingHints.filter(h => h.id !== payload.hintId);
      }
    } else if (action === 'CLAIM_RETURN') {
      // Client has added a pending returned-to-hand card locally; remove it from state.
      if (state.pendingReturns) {
        state.pendingReturns = state.pendingReturns.filter(r => r.returnId !== payload.returnId);
      }
    } else if (action === 'READY_MULLIGAN') {
      if (player === 1) state.player1_ready = true;
      else state.player2_ready = true;
      
      if (state.player1_ready && state.player2_ready) {
        match.status = 'PLAYING';
        state.log.unshift('Both players are ready. Match begins!');
      }
    } else if (action === 'UPDATE_HAND_SIZE') {
      if (player === 1) state.player1_hand = payload.size;
      else state.player2_hand = payload.size;
    } else if (action === 'SURRENDER') {
      match.status = player === 1 ? 'PLAYER 2 WINS' : 'PLAYER 1 WINS';
      state.log.unshift(`Player ${player} surrendered!`);
    }

    await client.query(
      'UPDATE matches SET state = $1, active_player = $2, current_turn = $3, status = $4 WHERE id = $5', 
      [state, match.active_player, match.current_turn, match.status, matchId]
    );
    await client.query('COMMIT');
    res.status(200).json({ success: true, match });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}
