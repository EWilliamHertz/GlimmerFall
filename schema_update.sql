CREATE TABLE IF NOT EXISTS card_rarities (
    id SERIAL PRIMARY KEY,
    rarity_name VARCHAR(50) UNIQUE NOT NULL,
    drop_rate_percentage DECIMAL(5,2) NOT NULL
);

ALTER TABLE cards ADD COLUMN IF NOT EXISTS rarity VARCHAR(50) DEFAULT 'Common';

INSERT INTO card_rarities (rarity_name, drop_rate_percentage) VALUES 
('Common', 60.00),
('Uncommon', 25.00),
('Rare', 10.00),
('Mythic', 4.50),
('Founders Foil', 0.50)
ON CONFLICT (rarity_name) DO UPDATE 
SET drop_rate_percentage = EXCLUDED.drop_rate_percentage;
