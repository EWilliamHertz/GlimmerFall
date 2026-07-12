import { useState } from 'react';
import { PackageOpen, Sparkles, RotateCw } from 'lucide-react';
import { CardTemplate } from '../components/CardTemplate';

export const BoosterOpener = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [isOpening, setIsOpening] = useState(false);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);

  const openBooster = async () => {
    setIsOpening(true);
    setCards([]);
    setFlippedCards([]);
    try {
      const response = await fetch('/api/booster');
      const data = await response.json();
      if (data.cards && data.cards.length > 0) {
        setCards(data.cards);
      } else {
        console.error("No cards returned from database");
      }
      setIsOpening(false);
    } catch (err) {
      console.error(err);
      setIsOpening(false);
    }
  };

  const toggleFlip = (index: number) => {
    if (!flippedCards.includes(index)) {
      setFlippedCards(prev => [...prev, index]);
    }
  };

  const flipAll = () => {
    const allIndexes = cards.map((_, i) => i);
    setFlippedCards(allIndexes);
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] text-center px-4 py-12 relative overflow-hidden bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-slate-950">
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
      `}</style>

      {/* Background glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-purple-900/20 blur-[120px] rounded-full pointer-events-none"></div>
      
      {cards.length === 0 && (
        <div className="flex flex-col items-center mt-20 animate-in fade-in zoom-in duration-500">
          <div className="relative mb-8">
            <div className={`absolute inset-0 bg-purple-500 blur-3xl opacity-30 rounded-full ${isOpening ? 'animate-pulse scale-150' : ''}`}></div>
            <PackageOpen className={`w-32 h-32 text-purple-400 drop-shadow-[0_0_30px_rgba(168,85,247,0.8)] relative z-10 ${isOpening ? 'animate-ping' : 'animate-bounce'}`} />
          </div>
          
          <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-500 to-pink-600 mb-4 tracking-tighter drop-shadow-lg">
            ALPHA BOOSTER
          </h2>
          
          <p className="text-slate-400 max-w-lg mb-10 text-lg">
            Rip open a pack of 10 highly-charged aether cards. Click cards to flip them over.
          </p>

          {!isOpening ? (
            <button 
              onClick={openBooster}
              className="group relative px-12 py-5 bg-gradient-to-b from-purple-600 to-purple-900 hover:from-purple-500 hover:to-purple-800 text-white font-black text-2xl rounded-2xl transition-all shadow-[0_0_40px_rgba(168,85,247,0.5)] hover:shadow-[0_0_60px_rgba(168,85,247,0.8)] flex items-center gap-4 border-2 border-purple-400/50 hover:scale-105"
            >
              <Sparkles className="w-8 h-8 group-hover:rotate-12 transition-transform text-pink-300" /> RIP PACK
            </button>
          ) : (
            <div className="text-3xl font-black text-purple-400 animate-pulse mt-4 tracking-widest">
              EXTRACTING CARDS...
            </div>
          )}
        </div>
      )}

      {cards.length > 0 && (
        <div className="mt-4 w-full max-w-7xl animate-in slide-in-from-bottom-12 fade-in duration-700">
          <div className="flex justify-between items-center mb-8 border-b border-purple-900/50 pb-6 px-4">
            <h3 className="text-3xl font-black text-white flex items-center gap-3">
              <Sparkles className="w-8 h-8 text-purple-500" />
              PACK OPENED
            </h3>
            <div className="flex gap-4">
              {flippedCards.length < cards.length && (
                <button onClick={flipAll} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white rounded-xl transition-all font-bold flex items-center gap-2 hover:scale-105">
                  <RotateCw className="w-5 h-5" /> FLIP ALL
                </button>
              )}
              <button onClick={openBooster} className="px-8 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-all font-black shadow-[0_0_20px_rgba(168,85,247,0.5)] hover:scale-105">
                RIP ANOTHER
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6 gap-y-12">
            {cards.map((c, i) => (
              <div 
                key={i} 
                className="relative w-full aspect-[2.5/3.5] cursor-pointer group perspective-1000 animate-in zoom-in-75 fade-in"
                onClick={() => toggleFlip(i)}
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className={`w-full h-full transition-all duration-700 preserve-3d relative ${flippedCards.includes(i) ? 'rotate-y-180' : ''}`}>
                  
                  {/* Card Back (Face Down) */}
                  <div className={`absolute inset-0 backface-hidden shadow-[0_0_20px_rgba(0,0,0,0.8)] rounded-xl border-2 border-slate-700 overflow-hidden transform hover:-translate-y-4 hover:shadow-[0_0_30px_rgba(168,85,247,0.5)] hover:border-purple-500 transition-all duration-300 ${flippedCards.includes(i) ? 'opacity-0' : 'opacity-100'}`}>
                    <img src="/cardback.png" className="absolute inset-0 w-full h-full object-cover" alt="Cardback" />
                    <div className="absolute inset-0 bg-black/40"></div>
                    <img src="/logo.png" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4/5 drop-shadow-[0_0_15px_rgba(147,51,234,0.8)] mix-blend-screen" alt="Logo" />
                  </div>

                  {/* Card Front (Face Up) */}
                  <div className="absolute inset-0 backface-hidden rotate-y-180 shadow-[0_0_30px_rgba(147,51,234,0.3)] rounded-xl">
                    <CardTemplate card={{...c, card_type: c.card_type || 'Entity', description: c.description || 'Simulated resonance data.', cost: c.cost || 1}} />
                  </div>

                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
