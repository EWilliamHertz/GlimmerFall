import { useState } from 'react';
import { PackageOpen, Sparkles } from 'lucide-react';

export const BoosterOpener = () => {
  const [cards, setCards] = useState<any[]>([]);
  const [isOpening, setIsOpening] = useState(false);

  const openBooster = async () => {
    setIsOpening(true);
    setCards([]);
    try {
      // Simulate API call for now, since we haven't uploaded images to DB yet
      // In production: const res = await fetch('http://localhost:8080/api/booster');
      setTimeout(() => {
        const mockBooster = [
          { name: 'Aether_Sprite', rarity: 'Common' },
          { name: 'Aetheric_Blast', rarity: 'Common' },
          { name: 'Ancient_Canopy', rarity: 'Common' },
          { name: 'Arcane_Intellect', rarity: 'Common' },
          { name: 'Ashen_Penitent', rarity: 'Common' },
          { name: 'Astral_Cartographer', rarity: 'Uncommon' },
          { name: 'Aurora_Marshal', rarity: 'Uncommon' },
          { name: 'Avalanche_Herd', rarity: 'Uncommon' },
          { name: 'Blackout_Edict', rarity: 'Rare' },
          { name: 'Blinding_Radiance', rarity: 'Mythic' },
        ];
        setCards(mockBooster);
        setIsOpening(false);
      }, 1500);
    } catch (err) {
      console.error(err);
      setIsOpening(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-[80vh] text-center px-4 py-12 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[20%] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-purple-900/20 blur-[100px] rounded-full -z-10"></div>
      
      <PackageOpen className={`w-20 h-20 text-purple-500 mb-6 ${isOpening ? 'animate-ping' : 'animate-bounce'}`} />
      
      <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-2 tracking-tight">
        BOOSTER SIMULATOR
      </h2>
      
      <p className="text-slate-400 max-w-lg mb-8">
        Test the mathematical drop rates of the Alpha Edition. Simulate opening a 10-card pack.
      </p>

      {cards.length === 0 && !isOpening && (
        <button 
          onClick={openBooster}
          className="group relative px-10 py-5 bg-gradient-to-b from-purple-600 to-purple-800 hover:from-purple-500 hover:to-purple-700 text-white font-bold text-xl rounded-xl transition-all shadow-[0_0_30px_rgba(168,85,247,0.4)] hover:shadow-[0_0_50px_rgba(168,85,247,0.7)] flex items-center gap-3 border border-purple-400/50"
        >
          <Sparkles className="w-6 h-6 group-hover:rotate-12 transition-transform" /> OPEN PACK
        </button>
      )}

      {isOpening && (
        <div className="text-2xl font-bold text-purple-400 animate-pulse mt-8">Decrypting Alpha Pack...</div>
      )}

      {cards.length > 0 && (
        <div className="mt-12 w-full max-w-6xl">
          <div className="flex justify-center gap-4 mb-8">
            <button onClick={() => setCards([])} className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors">Clear</button>
            <button onClick={openBooster} className="px-6 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors font-bold shadow-[0_0_15px_rgba(168,85,247,0.3)]">Open Another</button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {cards.map((c, i) => (
              <div key={i} className="relative group animate-in zoom-in duration-500 hover:z-50 cursor-pointer" style={{ animationDelay: `${i * 100}ms` }}>
                <img 
                  src={`/card_renders/${c.name}.png`} 
                  alt={c.name}
                  className={`w-full h-auto rounded-lg shadow-xl group-hover:scale-[1.6] transition-all duration-300 origin-center ${
                    c.rarity === 'Mythic' ? 'shadow-[0_0_30px_rgba(234,179,8,0.5)] border-2 border-yellow-500' :
                    c.rarity === 'Rare' ? 'shadow-[0_0_20px_rgba(168,85,247,0.5)] border-2 border-purple-500' :
                    c.rarity === 'Uncommon' ? 'shadow-[0_0_15px_rgba(56,189,248,0.3)] border border-sky-400' :
                    'shadow-[0_0_10px_rgba(0,0,0,0.5)] border border-slate-700'
                  }`}
                />
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 text-xs font-bold px-3 py-1 rounded-full text-white whitespace-nowrap opacity-100 transition-opacity group-hover:opacity-0">
                  {c.rarity}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
