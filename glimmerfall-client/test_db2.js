import fs from 'fs';
import pkg from 'pg';
const { Pool } = pkg;

const env = fs.readFileSync('.env', 'utf-8');
const dbUrlMatch = env.split('\n').find(l => l.startsWith('DATABASE_URL'));
const dbUrl = dbUrlMatch ? dbUrlMatch.split('=')[1].replace(/"/g, '') : '';

const pool = new Pool({
  connectionString: dbUrl,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const res = await pool.query("SELECT sd.deck_key, sdc.card_name, sdc.count FROM starter_decks sd LEFT JOIN starter_deck_cards sdc ON sd.id = sdc.starter_deck_id WHERE sd.deck_key = 'solar_singularity'");
  console.log(res.rows);
  process.exit(0);
}
run();
