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

  return (
    <div className="min-h-screen bg-white">
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          @page {
            margin: 0;
            size: auto;
          }
          body {
            margin: 1cm;
          }
        }
      `}</style>
      
      <div className="no-print p-8 bg-slate-900 text-white mb-8">
        <h1 className="text-3xl font-black text-cyan-400 mb-4">Print Deck to PDF</h1>
        <p className="mb-4 text-slate-300">Select a deck below. The cards will render in actual physical dimensions (63mm x 88mm). Then, just use your browser's Print function (Ctrl+P / Cmd+P) and save as PDF!</p>
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
        <button onClick={() => window.print()} className="ml-4 px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded font-bold transition-colors">
          Print Now
        </button>
      </div>

      <div className="flex flex-wrap gap-[2mm] px-[1cm]">
        {decklist.map((card, i) => (
          <div key={i} style={{ width: '63mm', height: '88mm', position: 'relative' }}>
            <CardTemplate card={card} minimal={false} />
            <div className="absolute inset-0 border border-dashed border-gray-400 pointer-events-none z-50"></div>
          </div>
        ))}
      </div>
      
      {decklist.length === 0 && selectedDeck && (
        <div className="text-center p-8 text-slate-500">Loading cards...</div>
      )}
    </div>
  );
};
