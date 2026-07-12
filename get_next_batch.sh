#!/bin/bash
TARGET_DIR="/home/ewilliamhe/glimmerfall-tcg/glimmerfall-client/public/card_renders"
OUTPUT="/home/ewilliamhe/glimmerfall-tcg/next_batch.txt"
> "$OUTPUT"
count=0

while IFS='|' read -r name prompt; do
  # Replace spaces with underscores
  filename="${name// /_}.png"
  if [ ! -f "$TARGET_DIR/$filename" ]; then
    echo "$name|$prompt" >> "$OUTPUT"
    count=$((count+1))
    if [ $count -ge 5 ]; then
      break
    fi
  fi
done < /home/ewilliamhe/glimmerfall-tcg/all_cards.txt
echo "Found $count missing cards."
