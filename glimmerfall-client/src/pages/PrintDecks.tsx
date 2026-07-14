import { useState, useEffect } from 'react';
import { CardTemplate } from '../components/CardTemplate';

const CARDS_PER_PAGE = 9;
const CARD_W = '60mm';
const CARD_H = '83.8mm';

export const PrintDecks = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [decklist, setDecklist] = useState<any[]>([]);
  const [userDecks, setUserDecks] = useState<any[]>([]);
  const [starterDecks, setStarterDecks] = useState<any[]>([]);
  const [selectedDeck, setSelectedDeck] = useState('');
  const currentUser = localStorage.getItem('glimmerfall_user') || 'Guest Player';

  useEffect(() => { fetch('/api/cards').then(r => r.json()).then(d => setCards(d.cards || d || [])).catch(console.error); }, []);
  useEffect(() => {
    fetch(`/api/decks?username=${encodeURIComponent(currentUser)}`).then(r => r.json()).then(d => d.decks && setUserDecks(d.decks)).catch(console.error);
    fetch('/api/starter-decks').then(r => r.json()).then(d => d.starter_decks && setStarterDecks(d.starter_decks)).catch(console.error);
  }, [currentUser]);
  useEffect(() => {
    if (!selectedDeck || !cards.length) return;
    const deckData = userDecks.find(d => d.deck_name === selectedDeck) || starterDecks.find(d => d.deck_name === selectedDeck);
    const flat: any[] = [];
    (deckData?.cards || []).forEach((entry: any) => {
      const card = cards.find(c => c.name === entry.card_name);
      if (card) for (let i = 0; i < Number(entry.count) || 0; i++) flat.push(card);
    });
    setDecklist(flat);
  }, [selectedDeck, cards, userDecks, starterDecks]);

  // Always render complete 3x3 sheets. The final sheet gets empty slots, never a partial/reflowed row.
  const pages: any[][] = [];
  for (let i = 0; i < decklist.length; i += CARDS_PER_PAGE) {
    const page = decklist.slice(i, i + CARDS_PER_PAGE);
    while (page.length < CARDS_PER_PAGE) page.push(null);
    pages.push(page);
  }

  return <div className="min-h-screen bg-slate-200 print-container">
    <style>{`@media print {
      nav, footer, header, .no-print { display:none !important; }
      body, html, #root { background:#fff !important; margin:0 !important; padding:0 !important; }
      .md\:flex { display:block !important; }
      .print-sheet { page-break-after:always; break-after:page; margin:0 !important; }
      @page { size:A4 portrait; margin:10mm; }
    }`}</style>
    <div className="no-print p-8 bg-slate-900 text-white mb-8 shadow-md">
      <h1 className="text-3xl font-black text-cyan-400 mb-4">Print Deck to PDF</h1>
      <p className="mb-4 text-slate-300">Every A4 sheet contains exactly nine fixed card positions (3 × 3). The final sheet uses blank positions so cards never shift or create uneven pages.</p>
      <div className="flex gap-4"><select className="p-3 rounded bg-slate-800 border border-slate-700 text-white font-bold w-full max-w-md" value={selectedDeck} onChange={e => setSelectedDeck(e.target.value)}><option value="">-- Select a Deck --</option><optgroup label="Your Decks">{userDecks.map(d => <option key={d.deck_name} value={d.deck_name}>{d.deck_name}</option>)}</optgroup><optgroup label="Starter & Tournament Decks">{starterDecks.map(d => <option key={d.deck_name} value={d.deck_name}>{d.deck_name}</option>)}</optgroup></select><button onClick={() => window.print()} className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 rounded font-bold">Print Now</button></div>
    </div>
    <div className="print-content" style={{background:'#fff'}}>
      {pages.map((page, pageIndex) => <div key={pageIndex} className="print-sheet" style={{width:'180mm', height:'251.4mm', margin:'10mm auto', background:'#fff', display:'grid', gridTemplateColumns:`repeat(3, ${CARD_W})`, gridTemplateRows:`repeat(3, ${CARD_H})`, overflow:'hidden'}}>
        {page.map((card, i) => <div key={i} style={{width:CARD_W, height:CARD_H, overflow:'hidden', boxSizing:'border-box'}}>{card && <CardTemplate card={card} minimal={false} />}</div>)}
      </div>)}
    </div>
    {decklist.length === 0 && selectedDeck && <div className="text-center p-8 text-slate-500">Loading cards...</div>}
  </div>;
};
