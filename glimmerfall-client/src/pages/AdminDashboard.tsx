import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import producersData from '../data/producers.json';

// --- DATA --- //
const PRODUCERS = producersData;

const PLAYERS = [
  { id: 1, name: 'AlexTheGreat', archetype: 'Solar Aggro', winRate: '58%', feedback: 4 },
  { id: 2, name: 'ShadowWeaver', archetype: 'Void Control', winRate: '62%', feedback: 12 },
  { id: 3, name: 'CardMaster99', archetype: 'Aether Midrange', winRate: '49%', feedback: 1 },
  { id: 4, name: 'NeonKnight', archetype: 'Solar Aggro', winRate: '51%', feedback: 7 }
];

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('PRODUCERS');

  // Tab 1 States
  const [selectedProducer, setSelectedProducer] = useState(PRODUCERS[0]);
  const [productMode, setProductMode] = useState<'STARTER' | 'BOOSTER' | 'BOX'>('STARTER');
  const [compareMode, setCompareMode] = useState(false);
  const [comparedProducers, setComparedProducers] = useState<string[]>([PRODUCERS[0].id]);

  // Carousel Drag Logic
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const startDrag = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDragging(true);
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
    if (sliderRef.current) {
      setStartX(pageX - sliderRef.current.offsetLeft);
      setScrollLeft(sliderRef.current.scrollLeft);
    }
  };

  const endDrag = () => {
    setIsDragging(false);
  };

  const onDrag = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDragging || !sliderRef.current) return;
    e.preventDefault();
    const pageX = 'touches' in e ? e.touches[0].pageX : (e as React.MouseEvent).pageX;
    const x = pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  const toggleCompare = (id: string) => {
    if (comparedProducers.includes(id)) {
      setComparedProducers(prev => prev.filter(p => p !== id));
    } else {
      setComparedProducers(prev => [...prev, id]);
    }
  };

  return (
    <div className="min-h-screen bg-[#050B14] text-cyan-50 font-sans relative overflow-hidden flex flex-col">
      {/* Sci-Fi Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(6,182,212,0.1),transparent_70%)]"></div>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-30 shadow-[0_0_15px_rgba(6,182,212,0.8)]"></div>
        <div className="absolute w-full h-full bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,black_10%,transparent_100%)]"></div>
      </div>

      {/* Top Navbar */}
      <nav className="relative z-20 border-b border-cyan-500/20 bg-black/40 backdrop-blur-md px-6 py-4 flex items-center justify-between shadow-[0_0_30px_rgba(0,0,0,0.8)]">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/')} className="text-cyan-400 hover:text-cyan-300 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          </button>
          <h1 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500 uppercase drop-shadow-[0_0_10px_rgba(6,182,212,0.5)]">
            Nexus // Admin
          </h1>
        </div>
        <div className="flex gap-2">
          {['PRODUCERS', 'PLAYERS', 'MARKETING', 'RETAILERS'].map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-bold tracking-wider transition-all duration-300 ${
                activeTab === tab 
                  ? 'bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.4)]' 
                  : 'bg-transparent border border-transparent text-slate-400 hover:text-cyan-100 hover:border-cyan-500/30'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative z-10 flex-grow p-6 overflow-y-auto">
        {/* --- TAB 1: PRODUCERS --- */}
        {activeTab === 'PRODUCERS' && (
          <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
            
            {/* Header & Toggles */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
              <div>
                <h2 className="text-3xl font-black text-cyan-50 tracking-wide drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]">Procurement Matrix</h2>
                <p className="text-cyan-300/70 text-sm mt-1">Select and analyze manufacturing partners for Glimmerfall expansions.</p>
              </div>
              
              <div className="flex items-center gap-4 bg-black/40 p-1.5 rounded-lg border border-cyan-500/30 backdrop-blur-md">
                {(['STARTER', 'BOOSTER', 'BOX'] as const).map(mode => (
                  <button
                    key={mode}
                    onClick={() => setProductMode(mode)}
                    className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                      productMode === mode 
                        ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]' 
                        : 'text-slate-400 hover:text-cyan-200'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* Draggable Holo-Carousel */}
            <div className="relative group">
              <div 
                ref={sliderRef}
                onMouseDown={startDrag}
                onMouseLeave={endDrag}
                onMouseUp={endDrag}
                onMouseMove={onDrag}
                onTouchStart={startDrag}
                onTouchEnd={endDrag}
                onTouchMove={onDrag}
                className="flex gap-6 overflow-x-auto pb-8 pt-4 px-4 snap-x snap-mandatory hide-scrollbar cursor-grab active:cursor-grabbing"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {PRODUCERS.map((producer) => {
                  const isSelected = selectedProducer.id === producer.id;
                  const isCompared = comparedProducers.includes(producer.id);
                  return (
                    <div 
                      key={producer.id}
                      onClick={() => {
                        // Prevent click if we were just dragging
                        if (isDragging) return;
                        setSelectedProducer(producer);
                        if (compareMode && !isCompared) setComparedProducers(prev => [...prev, producer.id]);
                      }}
                      className={`min-w-[280px] snap-center shrink-0 rounded-xl transition-all duration-300 ease-out border backdrop-blur-xl
                        ${isSelected 
                          ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_25px_rgba(6,182,212,0.3)] scale-105 z-10' 
                          : 'border-white/10 bg-black/40 hover:border-cyan-500/50 hover:bg-cyan-950/20 hover:scale-100 scale-95'
                        }
                      `}
                    >
                      <div className="p-5 flex flex-col items-center text-center">
                        <div className={`w-20 h-20 rounded-full mb-4 p-1 border-2 ${isSelected ? 'border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'border-slate-600'} transition-all`}>
                          <img src={producer.avatar} alt={producer.rep} className="w-full h-full rounded-full object-cover filter grayscale hover:grayscale-0 transition-all duration-500" />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-1">{producer.rep}</h3>
                        <p className="text-xs text-cyan-400 font-semibold tracking-wider uppercase mb-2">{producer.name}</p>
                        <p className="text-[10px] text-slate-400 italic line-clamp-2">{producer.tagline}</p>
                      </div>
                      
                      {compareMode && (
                        <div className="absolute top-3 right-3">
                          <input 
                            type="checkbox" 
                            checked={isCompared}
                            onChange={(e) => { e.stopPropagation(); toggleCompare(producer.id); }}
                            className="w-5 h-5 rounded border-cyan-500 text-cyan-500 focus:ring-cyan-500 bg-black/50 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Spec Comparison Matrix */}
            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>
              
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-cyan-50 flex items-center gap-2">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                  {compareMode ? 'Cross-Matrix Comparison' : 'Technical Specifications'}
                </h3>
                <label className="flex items-center gap-2 cursor-pointer">
                  <span className="text-xs text-cyan-300 font-bold uppercase tracking-wider">Compare Mode</span>
                  <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
                    <input type="checkbox" name="toggle" id="toggle" checked={compareMode} onChange={() => setCompareMode(!compareMode)} className="toggle-checkbox absolute block w-5 h-5 rounded-full bg-white border-4 appearance-none cursor-pointer border-slate-700" style={{ right: compareMode ? 0 : '1.25rem', borderColor: compareMode ? '#06b6d4' : '#334155' }}/>
                    <label htmlFor="toggle" className={`toggle-label block overflow-hidden h-5 rounded-full cursor-pointer ${compareMode ? 'bg-cyan-900' : 'bg-slate-800'}`}></label>
                  </div>
                </label>
              </div>

              <div className="overflow-x-auto pb-4">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3 text-slate-400 font-normal w-1/4">Metric</th>
                      {compareMode ? (
                        comparedProducers.map(id => {
                          const p = PRODUCERS.find(x => x.id === id);
                          return <th key={id} className="p-3 text-cyan-200 font-bold">{p?.name}</th>;
                        })
                      ) : (
                        <th className="p-3 text-cyan-200 font-bold">{selectedProducer.name}</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {['dimensions', 'stock', 'finish', 'holographic', 'sample_size', 'min_bulk', 'fees', 'lead_time'].map((key) => (
                      <tr key={key} className="hover:bg-white/[0.02] transition-colors">
                        <td className="p-3 text-slate-300 font-medium capitalize">{key.replace('_', ' ')}</td>
                        {compareMode ? (
                          comparedProducers.map(id => {
                            const p = PRODUCERS.find(x => x.id === id);
                            return <td key={id} className="p-3 text-cyan-50/80">{p?.specs[key as keyof typeof p.specs]}</td>;
                          })
                        ) : (
                          <td className="p-3 text-cyan-50/80 font-bold">{selectedProducer.specs[key as keyof typeof selectedProducer.specs]}</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: PLAYERS --- */}
        {activeTab === 'PLAYERS' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <h2 className="text-3xl font-black text-cyan-50 tracking-wide">Player Base Alpha</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {[{label: 'Total Alpha Testers', val: '1,042'}, {label: 'Feedback Submissions', val: '847'}, {label: 'Most Played Deck', val: 'Solar Aggro'}].map((metric, i) => (
                <div key={i} className="bg-gradient-to-br from-cyan-900/40 to-purple-900/20 backdrop-blur-md border border-cyan-500/20 rounded-xl p-6 shadow-[0_0_20px_rgba(6,182,212,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] transition-all">
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">{metric.label}</p>
                  <p className="text-3xl font-black text-white">{metric.val}</p>
                </div>
              ))}
            </div>

            <div className="bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/5 border-b border-white/10">
                  <tr>
                    <th className="p-4 text-cyan-300 font-bold">Player Name</th>
                    <th className="p-4 text-cyan-300 font-bold">Main Archetype</th>
                    <th className="p-4 text-cyan-300 font-bold">Win Rate</th>
                    <th className="p-4 text-cyan-300 font-bold">Feedback Items</th>
                    <th className="p-4 text-cyan-300 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {PLAYERS.map(player => (
                    <tr key={player.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 font-bold text-white">{player.name}</td>
                      <td className="p-4 text-slate-300"><span className="px-2 py-1 bg-cyan-900/50 rounded text-xs border border-cyan-500/30">{player.archetype}</span></td>
                      <td className="p-4 text-emerald-400 font-mono">{player.winRate}</td>
                      <td className="p-4 text-slate-300">{player.feedback}</td>
                      <td className="p-4 text-right">
                        <button className="text-xs px-3 py-1 bg-white/5 hover:bg-cyan-500/20 border border-white/10 hover:border-cyan-400 rounded transition-colors text-cyan-100">View Log</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- TAB 3: MARKETING --- */}
        {activeTab === 'MARKETING' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center min-h-[60vh] text-center">
             <div className="w-24 h-24 rounded-full border-b-4 border-l-4 border-purple-500 animate-spin mb-8 shadow-[0_0_30px_rgba(168,85,247,0.5)]"></div>
             <h2 className="text-3xl font-black text-white tracking-widest uppercase">Marketing Node Offline</h2>
             <p className="text-slate-400 max-w-md mt-4">The Campaign Analytics engine is currently compiling pre-launch social engagement data. Please check back later.</p>
             <button className="mt-8 px-6 py-2 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500 rounded-md text-purple-100 font-bold tracking-wider transition-all shadow-[0_0_15px_rgba(168,85,247,0.3)]">Force Sync</button>
          </div>
        )}

        {/* --- TAB 4: RETAILERS --- */}
        {activeTab === 'RETAILERS' && (
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
             <h2 className="text-3xl font-black text-cyan-50 tracking-wide">Wholesale Network</h2>
             <div className="bg-black/40 border border-amber-500/20 rounded-xl p-6 relative overflow-hidden backdrop-blur-md">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <svg className="w-32 h-32 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M4 3a2 2 0 100 4h12a2 2 0 100-4H4z" /><path fillRule="evenodd" d="M3 8h14v7a2 2 0 01-2 2H5a2 2 0 01-2-2V8zm5 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" clipRule="evenodd" /></svg>
                </div>
                <h3 className="text-xl font-bold text-amber-400 mb-2">Tier Discount Calculator</h3>
                <p className="text-slate-300 text-sm mb-6 max-w-2xl">B2B sales tiers dynamically adjust pricing based on bulk volume thresholds. Ensure LGS partners are assigned to the correct geographic distribution zone.</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { tier: 'Tier 1 (LGS Demo)', req: '5 Boxes', discount: '15%' },
                    { tier: 'Tier 2 (Standard Retail)', req: '20 Boxes', discount: '35%' },
                    { tier: 'Tier 3 (Distributor)', req: '500+ Boxes', discount: '55%' },
                  ].map(t => (
                    <div key={t.tier} className="bg-amber-900/10 border border-amber-500/30 rounded-lg p-4 text-center">
                      <div className="text-amber-500 font-black text-lg mb-1">{t.tier}</div>
                      <div className="text-white font-mono text-sm mb-2">{t.req}</div>
                      <div className="text-2xl font-black text-emerald-400">{t.discount} <span className="text-xs text-slate-400 font-normal">margin</span></div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        )}
      </main>

      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};
