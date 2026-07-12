import { ShoppingCart, TrendingUp, Search } from 'lucide-react';

export const Market = () => {
  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      
      {/* Pre-order Banner Section */}
      <div className="mb-12 bg-gradient-to-r from-purple-900 via-indigo-900 to-cyan-900 rounded-2xl p-8 border border-purple-500/30 shadow-[0_0_40px_rgba(168,85,247,0.2)] flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20"></div>
        <div className="relative z-10 max-w-2xl">
          <div className="inline-block bg-yellow-500 text-yellow-950 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest mb-4">Limited Allocation</div>
          <h2 className="text-4xl font-black text-white mb-2 tracking-tight">PRE-ORDER FIRST EDITION</h2>
          <h3 className="text-2xl text-purple-300 font-medium mb-4">Sealed Booster Boxes (24 Packs)</h3>
          <p className="text-slate-300 mb-6 text-lg">Secure your inventory before the Alpha ends. Each box guarantees at least one Founders Foil card. <strong>Wholesale discount applied automatically for orders of 6+ cases.</strong></p>
          <div className="flex items-center gap-4">
            <span className="text-4xl font-black text-white">$179.99</span>
            <button className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black px-8 py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all flex items-center gap-2">
              <ShoppingCart className="w-5 h-5" /> ADD TO CART
            </button>
          </div>
        </div>
        <div className="relative z-10 flex-shrink-0">
          <div className="w-48 h-48 md:w-64 md:h-64 bg-slate-900 rounded-xl border border-slate-700 flex items-center justify-center text-slate-500 font-bold shadow-2xl rotate-3 hover:rotate-0 transition-transform">
            [3D BOX RENDER]
          </div>
        </div>
      </div>

      {/* Market Header */}
      <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <TrendingUp className="w-8 h-8 text-green-500" />
          <h2 className="text-3xl font-black text-white">SINGLES MARKET</h2>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search singles..." 
              className="w-full bg-slate-900 border border-slate-700 rounded-md py-2 pl-10 pr-4 text-sm text-white focus:border-green-500 outline-none transition-colors"
            />
          </div>
          <button className="bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-md font-bold transition-colors">Sell Cards</button>
        </div>
      </div>

      {/* Market Listings */}
      <div className="bg-slate-900/50 rounded-xl border border-slate-800 overflow-hidden min-h-[300px] flex items-center justify-center">
        <div className="text-center text-slate-500">
          <p className="text-lg font-bold mb-2">Marketplace Empty</p>
          <p>Singles market will open once players begin opening Booster Boxes.</p>
        </div>
      </div>
    </div>
  );
};
