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
  const result = await pool.query("SELECT id, status, player1, player2 FROM matches WHERE room_code = 'test1' ORDER BY created_at DESC LIMIT 1 FOR UPDATE");
  console.log(result.rows);
  process.exit(0);
}
run();
