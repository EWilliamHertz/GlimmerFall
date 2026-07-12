import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// GET /api/starter-decks            -> all starter decks
// GET /api/starter-decks?deck_key=X -> a single starter deck
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { deck_key } = req.query;

    let query = `
      SELECT sd.deck_key, sd.deck_name, sd.description, sd.color_theme,
             sdc.card_name, sdc.count
      FROM starter_decks sd
      LEFT JOIN starter_deck_cards sdc ON sd.id = sdc.starter_deck_id
    `;
    const params = [];

    if (deck_key) {
      query += ' WHERE sd.deck_key = $1';
      params.push(deck_key);
    }

    query += ' ORDER BY sd.deck_key, sdc.card_name';

    const { rows } = await pool.query(query, params);

    const decksMap = {};
    rows.forEach(row => {
      if (!decksMap[row.deck_key]) {
        decksMap[row.deck_key] = {
          deck_key: row.deck_key,
          deck_name: row.deck_name,
          description: row.description,
          color_theme: row.color_theme,
          cards: []
        };
      }
      if (row.card_name) {
        decksMap[row.deck_key].cards.push({ card_name: row.card_name, count: parseInt(row.count) });
      }
    });

    res.status(200).json({ starter_decks: Object.values(decksMap) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
