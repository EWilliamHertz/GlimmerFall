import { useState, useEffect } from 'react';
import { LibraryBig, ArrowLeft, Search, Plus, Minus, PlusCircle } from 'lucide-react';
import { CardTemplate } from '../components/CardTemplate';
import { useNavigate } from 'react-router-dom';
import { STARTER_DECK_KEYS } from '../constants/starterDecks';

export const DeckBuilder = () => {
  const [editingDeck, setEditingDeck] = useState<string | null>(null);
  const [cards, setCards] = useState<any[]>([]);
  const [decklist, setDecklist] = useState<{card: any, count: number}[]>([]);
  const [userDecks, setUserDecks] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [costFilters, setCostFilters] = useState<number[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('All');
  const navigate = useNavigate();

  const currentUser = localStorage.getItem('glimmerfall_user') || 'Guest Player';

  // Fetch user decks on mount or after saving
  useEffect(() => {
    fetch(`/api/decks?username=${encodeURIComponent(currentUser)}`)
      .then(res => res.json())
      .then(data => {
        if (data.decks) setUserDecks(data.decks);
      })
      .catch(err => console.error(err));
  }, [currentUser, editingDeck]);

  // Fetch cards when editing a deck
  useEffect(() => {
    if (editingDeck) {
      fetch('/api/cards')
        .then(res => res.json())
        .then(data => {
          // Fix for white screen crash: handle { cards: [...] } API response
          const cardArray = data.cards || data || [];
          setCards(cardArray);
          
          if (editingDeck !== 'New Deck') {
            const existingUserDeck = userDecks.find(d => d.deck_name === editingDeck);
            if (existingUserDeck) {
              const deckCards = existingUserDeck.cards.map((c: any) => {
                 const cardObj = cardArray.find((dbCard: any) => dbCard.name === c.card_name);
                 return { card: cardObj, count: c.count };
              }).filter((i: any) => i.card);
              setDecklist(deckCards);
            } else if (STARTER_DECK_KEYS[editingDeck]) {
              fetch(`/api/starter-decks?deck_key=${STARTER_DECK_KEYS[editingDeck]}`)
                .then(res => res.json())
                .then(starterData => {
                  const starterDeck = (starterData.starter_decks || [])[0];
                  const deckCards = (starterDeck?.cards || []).map((c: any) => {
                    const cardObj = cardArray.find((dbCard: any) => dbCard.name === c.card_name);
                    return { card: cardObj, count: c.count };
                  }).filter((i: any) => i.card);
                  setDecklist(deckCards);
                })
                .catch(err => console.error("Failed to load starter deck", err));
            } else {
              setDecklist([]);
            }
          } else {
            setDecklist([]);
          }
        })
        .catch(err => console.error("Failed to load cards", err));
    }
  }, [editingDeck]);

  const addCardToDeck = (card: any) => {
    setDecklist(prev => {
      const existing = prev.find(i => i.card.name === card.name);
      if (existing) {
        if (existing.count >= 4) return prev; // Max 4 copies per card
        return prev.map(i => i.card.name === card.name ? { ...i, count: i.count + 1 } : i);
      }
      return [...prev, { card, count: 1 }];
    });
  };

  const removeCardFromDeck = (cardName: string) => {
    setDecklist(prev => {
      const existing = prev.find(i => i.card.name === cardName);
      if (existing && existing.count > 1) {
        return prev.map(i => i.card.name === cardName ? { ...i, count: i.count - 1 } : i);
      }
      return prev.filter(i => i.card.name !== cardName);
    });
  };

  const filteredCards = Array.isArray(cards) ? cards.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchesCost = costFilters.length === 0 || costFilters.includes(c.cost) || (costFilters.includes(7) && c.cost >= 7);
    const matchesType = typeFilter === 'All' || c.card_type.includes(typeFilter);
    return matchesSearch && matchesCost && matchesType;
  }) : [];
  const totalCards = decklist.reduce((sum, item) => sum + item.count, 0);

  const handleSaveDeck = () => {
    if (!editingDeck) return;
    
    let saveName = editingDeck;
    if (saveName === 'New Deck') {
      const input = prompt("Enter a name for your new deck:");
      if (!input || input.trim() === "") return;
      saveName = input.trim();
      setEditingDeck(saveName);
    }

    const payload = {
      username: currentUser,
      deck_name: saveName,
      cards: decklist.map(i => ({ card_name: i.card.name, count: i.count }))
    };

    fetch('/api/decks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).then(res => {
       if (res.ok) {
           alert("Deck saved successfully!");
           setEditingDeck(null); // Return to decks page
       } else {
           alert("Failed to save deck");
       }
    }).catch(err => console.error("Error saving deck:", err));
  };

  const handlePlay = (deckName: string, mode: 'pvp' | 'practice') => {
    localStorage.setItem('glimmerfall_active_deck', deckName);
    navigate(mode === 'pvp' ? '/play' : '/tutorial');
  };

  if (editingDeck) {
    return (
      <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-slate-950">
        
        {/* Left Side: Card Pool */}
        <div className="flex-1 flex flex-col border-r border-slate-800 bg-slate-900/30">
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80 backdrop-blur-md">
            <button onClick={() => setEditingDeck(null)} className="text-slate-400 hover:text-white flex items-center gap-2">
              <ArrowLeft className="w-5 h-5" /> Back to Decks
            </button>
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search collection..." 
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-cyan-500 outline-none"
              />
            </div>
            
            <select 
              value={typeFilter} 
              onChange={e => setTypeFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-cyan-500 outline-none"
            >
              <option value="All">All Types</option>
              <option value="Entity">Entities</option>
              <option value="Spell">Spells</option>
              <option value="Relic">Relics</option>
            </select>

            <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700">
              {[0, 1, 2, 3, 4, 5, 6, 7].map(cost => (
                <button 
                  key={cost}
                  onClick={() => {
                    setCostFilters(prev => 
                      prev.includes(cost) ? prev.filter(c => c !== cost) : [...prev, cost]
                    );
                  }}
                  className={`w-8 h-8 rounded flex items-center justify-center text-sm font-bold transition-colors ${
                    costFilters.includes(cost) ? 'bg-cyan-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {cost}{cost === 7 ? '+' : ''}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4">
              {filteredCards.map(card => (
                <div key={card.name} className="relative group">
                  <CardTemplate card={card} minimal={true} />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm rounded-xl">
                    <button 
                      onClick={() => addCardToDeck(card)}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold p-3 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.6)] transform hover:scale-110 transition-transform"
                    >
                      <Plus className="w-6 h-6" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Decklist */}
        <div className="w-80 flex flex-col bg-slate-950 shrink-0">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-xl font-bold text-white mb-1">{editingDeck}</h2>
            <div className="flex justify-between text-sm">
              <span className="text-slate-400">Total Cards:</span>
              <span className={`font-bold ${totalCards >= 40 ? 'text-green-400' : 'text-yellow-400'}`}>
                {totalCards} / 40
              </span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            {decklist.map((item) => (
              <div key={item.card.name} className="flex items-center bg-slate-900 border border-slate-800 rounded overflow-hidden group">
                <div className="w-8 h-full bg-slate-800 border-r border-slate-700 flex items-center justify-center font-bold text-cyan-400 py-2">
                  {item.count}x
                </div>
                <div className="flex-1 px-3 py-2 text-sm text-slate-200 font-semibold truncate cursor-pointer hover:text-cyan-400 transition-colors"
                     onMouseEnter={(e) => window.dispatchEvent(new CustomEvent('card-hover-in', { detail: { card: item.card, x: e.clientX, y: e.clientY } }))}
                     onMouseLeave={() => window.dispatchEvent(new CustomEvent('card-hover-out'))}>
                  {item.card.name}
                </div>
                <div className="flex">
                  <button onClick={() => addCardToDeck(item.card)} className="p-2 text-slate-500 hover:text-green-400 hover:bg-slate-800 transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                  <button onClick={() => removeCardFromDeck(item.card.name)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors">
                    <Minus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
            {decklist.length === 0 && (
              <div className="text-center p-8 text-slate-500 text-sm">
                Deck is empty. Add cards from your collection.
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-slate-800 bg-slate-900/50">
            <button onClick={handleSaveDeck} className="w-full bg-cyan-700 hover:bg-cyan-600 text-white font-bold py-3 rounded-lg transition-colors shadow-lg">
              Save Deck
            </button>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8 flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-black text-white tracking-wide mb-2 flex items-center gap-3">
            <LibraryBig className="w-8 h-8 text-purple-400" />
            DECK BUILDER
          </h2>
          <p className="text-slate-400">
            Welcome to your collection! Build your own decks or try out the introduction decks.
          </p>
        </div>
        <button onClick={() => setEditingDeck('New Deck')} className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] flex items-center gap-2">
          <PlusCircle className="w-5 h-5" /> Create New Deck
        </button>
      </div>

      <div className="mb-10 border-t border-slate-800 pt-8">
        <h3 className="text-xl font-bold text-white mb-4 tracking-wide">YOUR DECKS</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          
          {userDecks.map(deck => {
            const cardCount = deck.cards.reduce((sum: number, c: any) => sum + c.count, 0);
            return (
              <div key={deck.deck_name} className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-cyan-500 transition-colors group flex flex-col h-[200px]">
                <div className="h-24 bg-gradient-to-r from-cyan-900 to-blue-900 relative">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50"></div>
                  <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-slate-900 to-transparent">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{deck.deck_name}</h3>
                    <p className="text-cyan-400 text-sm font-semibold">{cardCount} Cards</p>
                  </div>
                </div>
                <div className="p-4 flex gap-4 mt-auto">
                  <button onClick={() => setEditingDeck(deck.deck_name)} className="flex-1 bg-slate-800 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors">
                    Edit Deck
                  </button>
                  <button onClick={() => handlePlay(deck.deck_name, 'pvp')} className="flex-1 bg-slate-800 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-colors">
                    Play PvP
                  </button>
                </div>
              </div>
            );
          })}

          {/* Custom Deck Placeholder */}
          <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-xl overflow-hidden hover:border-cyan-500/50 transition-colors group cursor-pointer flex flex-col items-center justify-center h-[200px]" onClick={() => setEditingDeck('New Deck')}>
            <PlusCircle className="w-12 h-12 text-slate-600 group-hover:text-cyan-500 transition-colors mb-2" />
            <span className="text-slate-400 font-semibold group-hover:text-white transition-colors">Create New Deck</span>
          </div>
        </div>
      </div>

      <div className="mb-10 border-t border-slate-800 pt-8">
        <h3 className="text-xl font-bold text-white mb-4 tracking-wide">INTRODUCTION DECKS</h3>
        <div className="grid md:grid-cols-2 gap-8">
          {/* Starter Deck 1 */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-cyan-500 transition-colors group">
            <div className="h-32 bg-gradient-to-r from-emerald-900 to-cyan-900 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-slate-900 to-transparent">
                <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors">Nature's Wrath</h3>
                <p className="text-emerald-400 text-sm font-semibold">Starter Deck • 40 Cards</p>
              </div>
            </div>
            <div className="p-4 flex gap-4">
              <button onClick={() => setEditingDeck("Nature's Wrath")} className="flex-1 bg-slate-800 hover:bg-cyan-600 text-white font-semibold py-2 rounded-lg transition-colors">
                Edit Deck
              </button>
              <button onClick={() => handlePlay("Nature's Wrath", 'practice')} className="flex-1 bg-slate-800 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-colors">
                Play Practice
              </button>
            </div>
          </div>

          {/* Starter Deck 2 */}
          <div className="bg-slate-900 border border-slate-700 rounded-xl overflow-hidden hover:border-red-500 transition-colors group">
            <div className="h-32 bg-gradient-to-r from-red-900 to-orange-900 relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-50"></div>
              <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-slate-900 to-transparent">
                <h3 className="text-xl font-bold text-white group-hover:text-red-400 transition-colors">Cinder Ignition</h3>
                <p className="text-red-400 text-sm font-semibold">Starter Deck • 40 Cards</p>
              </div>
            </div>
            <div className="p-4 flex gap-4">
              <button onClick={() => setEditingDeck("Cinder Ignition")} className="flex-1 bg-slate-800 hover:bg-red-600 text-white font-semibold py-2 rounded-lg transition-colors">
                Edit Deck
              </button>
              <button onClick={() => handlePlay("Cinder Ignition", 'practice')} className="flex-1 bg-slate-800 hover:bg-purple-600 text-white font-semibold py-2 rounded-lg transition-colors">
                Play Practice
              </button>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};
