const fs = require('fs');

function wrapText(text, maxCharsPerLine) {
    if (!text) return [];
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';
    for (const word of words) {
        if ((currentLine + word).length > maxCharsPerLine) {
            lines.push(currentLine.trim());
            currentLine = word + ' ';
        } else {
            currentLine += word + ' ';
        }
    }
    if (currentLine) {
        lines.push(currentLine.trim());
    }
    return lines;
}

function generateCardTemplate(cardData) {
    // Physical dimensions in millimeters
    const bleedCanvasW = 69;
    const bleedCanvasH = 94;
    const trimX = 3;
    const trimY = 3;
    const trimW = 63;
    const trimH = 88;
    const safeX = 6;
    const safeY = 6;
    const safeW = 57;
    const safeH = 82;

    const copyrightText = `© 2026 AI Generated`;
    const collectorNumber = `${cardData.cardNumber || '000'}`;

    // Ability text wrapping (approx 45 chars fit in the width with our font size)
    const abilityLines = wrapText(cardData.abilityText, 45);
    const abilityTspans = abilityLines.map((line, i) => 
        `<tspan x="8" dy="${i === 0 ? '0' : '3'}">${line}</tspan>`
    ).join('');

    const svgContent = `
    <svg width="${bleedCanvasW}mm" height="${bleedCanvasH}mm" viewBox="0 0 ${bleedCanvasW} ${bleedCanvasH}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <linearGradient id="bgGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#1e293b" />
                <stop offset="100%" stop-color="#020617" />
            </linearGradient>
            <linearGradient id="frameGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#334155" />
                <stop offset="50%" stop-color="#94a3b8" />
                <stop offset="100%" stop-color="#0f172a" />
            </linearGradient>
            <linearGradient id="costGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#083344" />
                <stop offset="100%" stop-color="#06b6d4" />
            </linearGradient>
            <filter id="dropShadow" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1" flood-color="#000000" flood-opacity="0.7"/>
            </filter>
            <clipPath id="artClip">
                <rect x="${safeX}" y="${safeY + 6}" width="${safeW}" height="42" rx="2" />
            </clipPath>
        </defs>

        <!-- BLEED AREA (Dark border) -->
        <rect width="${bleedCanvasW}" height="${bleedCanvasH}" fill="#000000" />

        <!-- TRIM LINE GUIDELINE (Hidden in production, keeping for debugging) -->
        <rect x="${trimX}" y="${trimY}" width="${trimW}" height="${trimH}" rx="3.5" fill="none" stroke="#333333" stroke-width="0.2" stroke-dasharray="1 1" />

        <!-- SAFE ZONE BACKGROUND (Gradient base) -->
        <rect x="${safeX}" y="${safeY}" width="${safeW}" height="${safeH}" rx="2" fill="url(#bgGradient)" stroke="url(#frameGradient)" stroke-width="0.5" />

        <!-- MAIN ART CANVAS (Placeholder) -->
        <rect x="${safeX}" y="${safeY + 6}" width="${safeW}" height="42" fill="#334155" clip-path="url(#artClip)" />
        <!-- Subtle inner shadow/border for art -->
        <rect x="${safeX}" y="${safeY + 6}" width="${safeW}" height="42" fill="none" stroke="#000000" stroke-width="0.5" clip-path="url(#artClip)" />
        <text x="${bleedCanvasW / 2}" y="32" font-family="'Trebuchet MS', Arial, sans-serif" font-size="2.5" fill="#94a3b8" text-anchor="middle" letter-spacing="1">[ AI Artwork Placeholder ]</text>

        <!-- HEADER BAR -->
        <path d="M ${safeX} ${safeY} h 45 l 3 6 h -48 Z" fill="rgba(0,0,0,0.8)" stroke="rgba(255,255,255,0.1)" stroke-width="0.3" filter="url(#dropShadow)" />
        <text x="8" y="${safeY + 4}" font-family="'Trebuchet MS', Arial, sans-serif" font-size="3" font-weight="900" fill="#ffffff" letter-spacing="0.2">${cardData.name.toUpperCase()}</text>

        <!-- COST CIRCLE -->
        <circle cx="${safeX + safeW - 4}" cy="${safeY + 3}" r="4" fill="url(#costGradient)" stroke="#22d3ee" stroke-width="0.4" filter="url(#dropShadow)" />
        <text x="${safeX + safeW - 4}" y="${safeY + 4.2}" font-family="'Arial Black', Arial, sans-serif" font-size="4" font-weight="900" fill="#ffffff" text-anchor="middle">${cardData.cost}</text>

        <!-- TYPE LINE / MIDDLE BAR -->
        <rect x="${safeX}" y="${safeY + 48}" width="${safeW}" height="5" fill="rgba(15,23,42,0.9)" stroke="rgba(148,163,184,0.3)" stroke-width="0.3" filter="url(#dropShadow)" />
        <text x="8" y="${safeY + 51.5}" font-family="'Trebuchet MS', Arial, sans-serif" font-size="2.2" font-weight="bold" fill="#67e8f9" letter-spacing="1" text-transform="uppercase">${cardData.faction} • ${cardData.type}</text>
        <text x="${safeX + safeW - 2}" y="${safeY + 51.5}" font-family="Arial" font-size="2.5" fill="#facc15" text-anchor="end">${cardData.rarityIcon}</text>

        <!-- TEXT BOX (Rules) -->
        <rect x="${safeX}" y="${safeY + 53}" width="${safeW}" height="24" fill="rgba(2,6,23,0.7)" />
        
        <!-- Keywords -->
        <text x="8" y="${safeY + 57}" font-family="'Trebuchet MS', Arial, sans-serif" font-size="2.2" font-weight="bold" fill="#ffffff">${cardData.keywords}</text>
        
        <!-- Ability Text -->
        <text x="8" y="${safeY + 61}" font-family="'Georgia', serif" font-size="2.2" font-style="italic" fill="#cbd5e1" line-height="1.5">
            ${abilityTspans}
        </text>

        <!-- COMBAT STATS (Bottom Right) -->
        <path d="M ${safeX + safeW - 14} ${safeY + safeH} l 2 -6 h 12 v 6 Z" fill="#0f172a" stroke="#475569" stroke-width="0.4" filter="url(#dropShadow)"/>
        <text x="${safeX + safeW - 6}" y="${safeY + safeH - 1.5}" font-family="'Arial Black', Arial, sans-serif" font-size="3.5" font-weight="900" fill="#ffffff" text-anchor="middle">${cardData.attack} / ${cardData.health}</text>

        <!-- FOOTER / META INFO (Bottom Left) -->
        <text x="8" y="${safeY + safeH - 2}" font-family="'Trebuchet MS', Arial, sans-serif" font-size="1.5" fill="#64748b" font-weight="bold">${cardData.set || 'CORE'} - ${collectorNumber} | ${copyrightText}</text>
    </svg>`;

    return svgContent;
}

// Example JSON Data Input pulled from the Core Set Blueprint
const sunfireColossus = {
    name: "Sunfire Colossus",
    cost: "6",
    faction: "Solari",
    type: "Entity",
    rarityIcon: "★",
    keywords: "Overwhelm",
    abilityText: "Excess combat damage bleeds to the enemy Nexus.",
    attack: "6",
    health: "6",
    cardNumber: "089",
    set: "GLIMMERFALL"
};

// Generate and save the SVG file
const svgOutput = generateCardTemplate(sunfireColossus);
fs.writeFileSync('template_frame.svg', svgOutput);
console.log("SVG Template created successfully!");
