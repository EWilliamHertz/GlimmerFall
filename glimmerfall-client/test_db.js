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
  const res = await pool.query("SELECT deck_key FROM starter_decks");
  console.log(res.rows);
  process.exit(0);
}
run();
