import json

with open('quotes.json', 'r') as f:
    data = json.load(f)

producers = {}
for row in data.get('SAMPLES', []):
    contact = row.get("GLIMMERFALL — SAMPLE QUOTE LEDGER")
    if not contact or contact == "Supplier / Contact": continue
    
    company_link = row.get("Unnamed: 1", "")
    company = company_link.split(" — ")[0] if " — " in company_link else company_link
    
    status = row.get("Unnamed: 9", "")
    price = row.get("Unnamed: 8", "N/A")
    qty = row.get("Unnamed: 2", "")
    
    if contact not in producers:
        producers[contact] = {
            "id": contact.lower().replace(" ", "_"),
            "name": company,
            "rep": contact,
            "avatar": f"https://ui-avatars.com/api/?name={contact.replace(' ', '+')}&background=random",
            "tagline": status,
            "specs": {
                "dimensions": "63 × 88 mm",
                "stock": "300 gsm white-core card stock",
                "finish": "Matte varnish or lamination",
                "holographic": "1 replacement card / pack",
                "sample_size": "1 to 50 boxes",
                "min_bulk": "500 boxes",
                "fees": "To be confirmed",
                "lead_time": "To be confirmed"
            },
            "quotes": []
        }
    
    producers[contact]["quotes"].append({
        "quantity": qty,
        "price": str(price)
    })

# Add some variation to specs based on the info tab
for i, p in enumerate(producers.values()):
    p['specs']['fees'] = p['quotes'][0]['price'] if p['quotes'] else 'N/A'

with open('glimmerfall-client/src/data/producers.json', 'w') as f:
    json.dump(list(producers.values()), f, indent=2)

