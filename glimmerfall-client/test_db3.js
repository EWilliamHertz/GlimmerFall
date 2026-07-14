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
  const res = await pool.query("SELECT id, status, state FROM matches ORDER BY created_at DESC LIMIT 5");
  console.log(JSON.stringify(res.rows, null, 2));
  process.exit(0);
}
run();
