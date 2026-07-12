import os
import psycopg2
import json

db_url = "postgresql://neondb_owner:npg_c8rRimgWC1OG@ep-round-lab-atbehctx-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require"
conn = psycopg2.connect(db_url)
cur = conn.cursor()

cur.execute("SELECT name, ai_art_prompt FROM cards WHERE name != 'Aether Sprite'")
rows = cur.fetchall()

# We need to overwrite the old images with textless ones
cards = [{"name": r[0], "prompt": r[1]} for r in rows]

# We will chunk this into 5 batches (20 cards each)
chunks = [cards[i:i + 20] for i in range(0, len(cards), 20)]

for idx, chunk in enumerate(chunks):
    with open(f"/home/ewilliamhe/glimmerfall-tcg/batch_{idx}.json", "w") as f:
        json.dump(chunk, f, indent=2)
    print(f"Created batch_{idx}.json with {len(chunk)} cards.")
