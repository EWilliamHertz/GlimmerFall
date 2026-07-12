import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { username } = req.query;
    if (!username) return res.status(400).json({ error: 'Username required' });

    try {
      const { rows } = await pool.query(`
        SELECT d.deck_name, dc.card_name, dc.count 
        FROM decks d 
        LEFT JOIN deck_cards dc ON d.id = dc.deck_id 
        WHERE d.username = $1`, [username]);

      const decksMap = {};
      rows.forEach(row => {
        if (!decksMap[row.deck_name]) decksMap[row.deck_name] = [];
        if (row.card_name) decksMap[row.deck_name].push({ card_name: row.card_name, count: parseInt(row.count) });
      });

      const result = Object.keys(decksMap).map(name => ({
        deck_name: name,
        cards: decksMap[name]
      }));

      res.status(200).json({ decks: result });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'POST') {
    const { username, deck_name, cards } = req.body;
    
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM decks WHERE username = $1 AND deck_name = $2', [username, deck_name]);
      const resDeck = await client.query('INSERT INTO decks (username, deck_name) VALUES ($1, $2) RETURNING id', [username, deck_name]);
      const deckId = resDeck.rows[0].id;

      for (const card of cards) {
        await client.query('INSERT INTO deck_cards (deck_id, card_name, count) VALUES ($1, $2, $3)', [deckId, card.card_name, card.count]);
      }
      await client.query('COMMIT');
      res.status(200).json({ message: 'Deck saved successfully!' });
    } catch (err) {
      await client.query('ROLLBACK');
      res.status(500).json({ error: err.message });
    } finally {
      client.release();
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
