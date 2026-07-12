import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { matchId, player, action, payload } = req.body;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await client.query('SELECT * FROM matches WHERE id = $1 FOR UPDATE', [matchId]);
    if (result.rows.length === 0) throw new Error('Match not found');

    const match = result.rows[0];
    if (match.status !== 'PLAYING') throw new Error('Match is over');

    let state = match.state;
    
    if (action === 'END_TURN') {
      match.active_player = match.active_player === match.player1 ? match.player2 : match.player1;
      match.current_turn += 1;
      state.log.unshift(`Turn ${match.current_turn} begins.`);
    } else if (action === 'PLAY_CARD') {
      // payload = { zone: 'battlefield' or 'resonanceRow', card: {} }
      if (payload.zone === 'battlefield') {
        state.battlefield.push({ ...payload.card, owner: player, currentHealth: payload.card.health });
        state.log.unshift(`Player ${player} summoned ${payload.card.name}.`);
      } else {
        state.resonanceRow.push({ ...payload.card, owner: player });
        state.log.unshift(`Player ${player} placed a node.`);
      }
    } else if (action === 'ATTACK_VANGUARD') {
      const damage = payload.power;
      if (player === 1) state.player2_hp -= damage;
      else state.player1_hp -= damage;
      state.log.unshift(`Player ${player} attacked the vanguard for ${damage} damage!`);
      
      if (state.player1_hp <= 0 || state.player2_hp <= 0) {
        match.status = state.player1_hp <= 0 ? 'PLAYER 2 WINS' : 'PLAYER 1 WINS';
        state.log.unshift(`MATCH OVER! ${match.status}!`);
      }
    } else if (action === 'ATTACK_ENTITY') {
      const damage = payload.power;
      const targetIndex = state.battlefield.findIndex(c => c.id === payload.targetId);
      if (targetIndex !== -1) {
        state.battlefield[targetIndex].currentHealth -= damage;
        state.log.unshift(`Player ${player} dealt ${damage} damage to ${state.battlefield[targetIndex].name}!`);
        if (state.battlefield[targetIndex].currentHealth <= 0) {
          state.log.unshift(`${state.battlefield[targetIndex].name} was destroyed!`);
          state.battlefield.splice(targetIndex, 1);
        }
      }
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
