import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  try {
    console.log("Renaming spells...");
    
    // Update card_type
    await pool.query("UPDATE cards SET card_type = replace(card_type, 'Slow Spell', 'Rite') WHERE card_type LIKE '%Slow Spell%'");
    await pool.query("UPDATE cards SET card_type = replace(card_type, 'Fast Spell', 'Flash') WHERE card_type LIKE '%Fast Spell%'");
    
    // Replace in descriptions
    await pool.query("UPDATE cards SET description = regexp_replace(description, '(?i)slow spell', 'Rite', 'g')");
    await pool.query("UPDATE cards SET description = regexp_replace(description, '(?i)fast spell', 'Flash', 'g')");
    
    // Also capitalize if it's currently 'spell' but shouldn't be? Wait, 'Rite' and 'Flash' are already capitalized.
    
    console.log("Done updating database!");
  } catch (err) {
    console.error(err);
  } finally {
    pool.end();
  }
}
run();
