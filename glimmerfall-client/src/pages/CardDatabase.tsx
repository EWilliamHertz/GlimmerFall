import { useState, useEffect } from 'react';
import { Database, Search } from 'lucide-react';
import { CardTemplate } from '../components/CardTemplate';

export const CardDatabase = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [costFilters, setCostFilters] = useState<number[]>([]);
  const [typeFilter, setTypeFilter] = useState<string>('All');

  useEffect(() => {
    fetch('/api/cards')
      .then(res => res.json())
      .then(data => {
        if (data.cards) setCards(data.cards);
      })
      .catch(err => console.error("Error loading cards:", err));
  }, []);

  const filteredCards = cards.filter(card => {
    const matchesSearch = card.name.toLowerCase().includes(search.toLowerCase()) || 
                          card.card_type.toLowerCase().includes(search.toLowerCase());
    const matchesCost = costFilters.length === 0 || costFilters.includes(card.cost) || (costFilters.includes(7) && card.cost >= 7);
    const matchesType = typeFilter === 'All' || card.card_type.includes(typeFilter);
    return matchesSearch && matchesCost && matchesType;
  });

  return (
    <div className="max-w-[1600px] mx-auto py-8 px-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end mb-8 gap-6 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3 shrink-0">
          <Database className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-black text-white">CARD DATABASE</h2>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          <div className="relative flex-1 min-w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search cards..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-colors"
            />
          </div>
          
          <select 
            value={typeFilter} 
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 focus:border-blue-500 outline-none"
          >
            <option value="All">All Types</option>
            <option value="Entity">Entities</option>
            <option value="Spell">Spells</option>
            <option value="Relic">Relics</option>
          </select>

          <div className="flex gap-1 bg-slate-900 p-1 rounded-lg border border-slate-700 overflow-x-auto">
            {[0, 1, 2, 3, 4, 5, 6, 7].map(cost => (
              <button 
                key={cost}
                onClick={() => {
                  setCostFilters(prev => 
                    prev.includes(cost) ? prev.filter(c => c !== cost) : [...prev, cost]
                  );
                }}
                className={`w-10 h-10 shrink-0 rounded flex items-center justify-center text-sm font-bold transition-colors ${
                  costFilters.includes(cost) ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                {cost}{cost === 7 ? '+' : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
        {filteredCards.map((card, idx) => (
          <div key={idx} className="hover:-translate-y-2 transition-transform duration-300 hover:z-50 cursor-pointer">
            <CardTemplate card={card} minimal={true} />
          </div>
        ))}
        {filteredCards.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-12">
            No cards found matching your filters.
          </div>
        )}
      </div>
    </div>
  );
};
