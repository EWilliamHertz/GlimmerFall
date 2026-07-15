#!/bin/bash
echo "Waiting for PDF generation to complete..."
while pgrep -f "node generate_press_pdf.js" > /dev/null; do
    sleep 5
done
echo "PDF Generation completed. Committing to GitHub..."
cd /home/ewilliamhe/glimmerfall-tcg
git add print_exports/
git commit -m "chore: add 1x Full Set Press Sheet"
git push
echo "Pushed successfully."
