import { useState, useEffect } from 'react';
import { CardTemplate } from '../components/CardTemplate';

export const PrintDecks = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [decklist, setDecklist] = useState<any[]>([]);
  const [userDecks, setUserDecks] = useState<any[]>([]);
  const [starterDecks, setStarterDecks] = useState<any[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string>('');

  const currentUser = localStorage.getItem('glimmerfall_user') || 'Guest Player';

  // Fetch all available cards
  useEffect(() => {
    fetch('/api/cards')
      .then(res => res.json())
      .then(data => {
        setCards(data.cards || data || []);
      })
      .catch(err => console.error(err));
  }, []);

  // Fetch user decks and starter decks
  useEffect(() => {
    fetch(`/api/decks?username=${encodeURIComponent(currentUser)}`)
      .then(res => res.json())
      .then(data => {
        if (data.decks) setUserDecks(data.decks);
      })
      .catch(err => console.error(err));

    fetch('/api/starter-decks')
      .then(res => res.json())
      .then(data => {
        if (data.starter_decks) setStarterDecks(data.starter_decks);
      })
      .catch(err => console.error(err));
  }, [currentUser]);

  // When a deck is selected, construct the flat array of cards
  useEffect(() => {
    if (!selectedDeck || cards.length === 0) return;

    let deckData = null;

    // Check user decks
    const uDeck = userDecks.find(d => d.deck_name === selectedDeck);
    if (uDeck) {
      deckData = uDeck;
    } else {
      // Check starter decks
      const sDeck = starterDecks.find(d => d.deck_name === selectedDeck);
      if (sDeck) {
        deckData = sDeck;
      }
    }

    if (deckData && deckData.cards) {
      const flattened: any[] = [];
      deckData.cards.forEach((c: any) => {
        const cardObj = cards.find(dbCard => dbCard.name === c.card_name);
        if (cardObj) {
          for (let i = 0; i < c.count; i++) {
            flattened.push(cardObj);
          }
        }
      });
      setDecklist(flattened);
    } else {
      setDecklist([]);
    }

  }, [selectedDeck, cards, userDecks, starterDecks]);

  // Chunk cards into groups of 9 for A4 pages
  const chunkedCards = [];
  for (let i = 0; i < decklist.length; i += 9) {
    chunkedCards.push(decklist.slice(i, i + 9));
  }

  return (
    <div className="min-h-screen bg-slate-200 print-container">
      <style>{`
        @media print {
          nav, footer, header {
            display: none !important;
          }
          .no-print {
            display: none !important;
          }
          body, html, #root {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          /* Override the md:flex layout of the main app container */
          .md\\:flex {
            display: block !important;
          }
          .page-wrapper {
            margin: 0 !important;
            box-shadow: none !important;
            page-break-after: always;
            break-after: page;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
      
      <div className="no-print p-8 bg-slate-900 text-white mb-8 shadow-md">
        <h1 className="text-3xl font-black text-cyan-400 mb-4">Print Deck to PDF</h1>
        <p className="mb-4 text-slate-300">Select a deck below. The cards will render in perfect 3x3 grids (9 cards per page) on A4 dimensions. A standard 40-card deck will cleanly fit onto 5 pages!</p>
        <div className="flex gap-4">
          <select 
            className="p-3 rounded bg-slate-800 border border-slate-700 text-white font-bold w-full max-w-md"
            value={selectedDeck}
            onChange={(e) => setSelectedDeck(e.target.value)}
          >
            <option value="">-- Select a Deck --</option>
            <optgroup label="Your Decks">
              {userDecks.map(d => (
                <option key={d.deck_name} value={d.deck_name}>{d.deck_name}</option>
              ))}
            </optgroup>
            <optgroup label="Starter & Tournament Decks">
              {starterDecks.map(d => (
                <option key={d.deck_name} value={d.deck_name}>{d.deck_name}</option>
              ))}
            </optgroup>
          </select>
          <button onClick={() => window.print()} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded font-bold transition-colors">
            Print Now
          </button>
        </div>
      </div>

      <div className="print-content" style={{ background: 'white' }}>
        {chunkedCards.map((page, pageIndex) => (
          <div 
            key={pageIndex} 
            className="page-wrapper mx-auto" 
            style={{ 
              width: '180mm', // exactly 3 * 60mm
              height: '251.4mm', // exactly 3 * 83.8mm
              pageBreakAfter: 'always',
              breakAfter: 'page',
              margin: '10mm auto',
              background: 'white',
              position: 'relative',
              overflow: 'hidden'
            }}
          >
            {page.map((card: any, i: number) => (
              <div 
                key={i} 
                style={{ 
                  float: 'left',
                  width: '60mm', 
                  height: '83.8mm', 
                  position: 'relative',
                  boxSizing: 'border-box'
                }}
              >
                <CardTemplate card={card} minimal={false} />
                <div className="absolute inset-0 border-[0.5mm] border-solid border-gray-300 pointer-events-none z-50"></div>
              </div>
            ))}
            <div style={{ clear: 'both' }}></div>
          </div>
        ))}
      </div>
      
      {decklist.length === 0 && selectedDeck && (
        <div className="text-center p-8 text-slate-500">Loading cards...</div>
      )}
    </div>
  );
};
