import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  const { username } = req.body;
  if (!username) return res.status(400).json({ error: 'Username required' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Look for a waiting match
    const result = await client.query("SELECT id FROM matches WHERE status = 'WAITING' AND player1 != $1 LIMIT 1 FOR UPDATE", [username]);
    
    if (result.rows.length > 0) {
      // Join match
      const matchId = result.rows[0].id;
      const initialState = {
        player1_hp: 20,
        player2_hp: 20,
        player1_hand: 5,
        player2_hand: 5,
        battlefield: [],
        resonanceRow: [],
        log: ['Match started!']
      };
      await client.query("UPDATE matches SET player2 = $1, status = 'PLAYING', state = $2 WHERE id = $3", [username, initialState, matchId]);
      await client.query('COMMIT');
      return res.status(200).json({ matchId, player: 2 });
    } else {
      // Create new match
      const insert = await client.query("INSERT INTO matches (player1, status, active_player) VALUES ($1, 'WAITING', $1) RETURNING id", [username]);
      await client.query('COMMIT');
      return res.status(200).json({ matchId: insert.rows[0].id, player: 1, status: 'WAITING' });
    }
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
}
