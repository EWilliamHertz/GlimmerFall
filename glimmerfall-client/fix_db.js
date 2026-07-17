import pkg from 'pg';
import dotenv from 'dotenv';
dotenv.config();
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
async function run() {
  await pool.query("UPDATE cards SET description = trim(regexp_replace(description, '(?i)\\bswift\\b[,\\.]?\\s*', '', 'g'))");
  console.log("Updated cards successfully");
  process.exit(0);
}
run();
