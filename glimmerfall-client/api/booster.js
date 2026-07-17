import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  try {
    const { rows } = await pool.query('SELECT name, card_type, cost, power, health, description, rarity, set_name, collector_number, faction FROM cards ORDER BY RANDOM() LIMIT 10');
    res.status(200).json({ cards: rows });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
