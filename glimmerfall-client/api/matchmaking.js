import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username, lobbyCode } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    if (lobbyCode) {
      // Try to join specific lobby
      const result = await client.query("SELECT id, status FROM matches WHERE room_code = $1 FOR UPDATE", [lobbyCode]);
      if (result.rows.length > 0) {
        const match = result.rows[0];
        if (match.status === 'WAITING') {
          const initialState = {
            player1_hp: 20, player2_hp: 20,
            player1_hand: 5, player2_hand: 5,
            player1_ready: false, player2_ready: false,
            battlefield: [], resonanceRow: [], graveyard: [], pendingReturns: [], pendingHints: [], player1_shield: 0, player2_shield: 0,
            log: ['Mulligan Phase...']
          };
          await client.query("UPDATE matches SET player2 = $1, status = 'MULLIGAN', state = $2 WHERE id = $3", [username, initialState, match.id]);
          await client.query('COMMIT');
          return res.status(200).json({ matchId: match.id, player: 2 });
        } else {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Lobby full or match already started' });
        }
      } else {
        // Create new lobby with that code
        const insert = await client.query("INSERT INTO matches (player1, status, active_player, room_code) VALUES ($1, 'WAITING', $1, $2) RETURNING id", [username, lobbyCode]);
        await client.query('COMMIT');
        return res.status(200).json({ matchId: insert.rows[0].id, player: 1, status: 'WAITING' });
      }
    } else {
      // Random matchmaking
      const result = await client.query("SELECT id FROM matches WHERE status = 'WAITING' AND room_code IS NULL AND player1 != $1 LIMIT 1 FOR UPDATE", [username]);
      if (result.rows.length > 0) {
        const matchId = result.rows[0].id;
        const initialState = {
          player1_hp: 20, player2_hp: 20,
          player1_hand: 5, player2_hand: 5,
          player1_ready: false, player2_ready: false,
          battlefield: [], resonanceRow: [], graveyard: [], pendingReturns: [], pendingHints: [], player1_shield: 0, player2_shield: 0,
          log: ['Mulligan Phase...']
        };
        await client.query("UPDATE matches SET player2 = $1, status = 'MULLIGAN', state = $2 WHERE id = $3", [username, initialState, matchId]);
        await client.query('COMMIT');
        return res.status(200).json({ matchId, player: 2 });
      } else {
        const insert = await client.query("INSERT INTO matches (player1, status, active_player) VALUES ($1, 'WAITING', $1) RETURNING id", [username]);
        await client.query('COMMIT');
        return res.status(200).json({ matchId: insert.rows[0].id, player: 1, status: 'WAITING' });
      }
    }
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}
