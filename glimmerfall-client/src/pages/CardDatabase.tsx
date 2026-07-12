import { useState, useEffect } from 'react';
import { Database, Search } from 'lucide-react';

export const CardDatabase = () => {
  const [cards, setCards] = useState<string[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch('/cards.json')
      .then(res => res.json())
      .then(data => setCards(data))
      .catch(err => console.error("Error loading cards:", err));
  }, []);

  const filteredCards = cards.filter(card => 
    card.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <Database className="w-8 h-8 text-blue-500" />
          <h2 className="text-3xl font-black text-white">CARD DATABASE</h2>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search cards..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-sm text-white focus:border-blue-500 outline-none transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {filteredCards.map(filename => (
          <div key={filename} className="relative group cursor-pointer hover:z-50">
            <img 
              src={`/card_renders/${filename}`} 
              alt={filename.replace('.png', '').replace(/_/g, ' ')}
              className="w-full h-auto rounded-lg shadow-lg group-hover:scale-[1.6] group-hover:shadow-[0_0_40px_rgba(6,182,212,0.8)] transition-all duration-300 origin-center"
            />
          </div>
        ))}
        {filteredCards.length === 0 && (
          <div className="col-span-full text-center text-slate-500 py-12">
            No cards found matching "{search}"
          </div>
        )}
      </div>
    </div>
  );
};
