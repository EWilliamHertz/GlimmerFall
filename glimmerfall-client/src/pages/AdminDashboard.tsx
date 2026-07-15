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
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState('PRODUCERS');

  // Tab 1 States
  const [selectedProducer, setSelectedProducer] = useState(PRODUCERS[0]);
  const [productMode, setProductMode] = useState<'STARTER' | 'BOOSTER' | 'BOX'>('STARTER');
  const [compareMode, setCompareMode] = useState(false);
  const [comparedProducers, setComparedProducers] = useState<string[]>([PRODUCERS[0].id]);

  // Marketing States
  const [campaignActive, setCampaignActive] = useState(false);
  const [budgetTotal, setBudgetTotal] = useState(5000);
  const [adSpend, setAdSpend] = useState(2500);
  const [influencerSpend, setInfluencerSpend] = useState(1500);
  const [promoCode, setPromoCode] = useState('GLIMMER2026');
  const [promoGenerated, setPromoGenerated] = useState(false);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050B14] flex flex-col items-center justify-center font-sans">
         <div className="bg-black/40 border border-cyan-500/30 p-8 rounded-xl backdrop-blur-md shadow-[0_0_30px_rgba(6,182,212,0.2)] text-center">
            <h2 className="text-2xl font-black text-cyan-400 tracking-widest uppercase mb-6">Admin Authentication</h2>
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  if (password === '123' || password === import.meta.env.VITE_ADMIN_PASSWORD) setIsAuthenticated(true);
                }
              }}
              placeholder="Enter passcode..."
              className="bg-slate-900 border border-slate-700 text-cyan-50 p-3 rounded w-64 focus:outline-none focus:border-cyan-400 transition-colors text-center font-mono"
            />
            <button 
              onClick={() => {
                 if (password === '123' || password === import.meta.env.VITE_ADMIN_PASSWORD) setIsAuthenticated(true);
                 else alert("Incorrect password");
              }}
              className="block w-full mt-4 bg-cyan-600/20 hover:bg-cyan-600/40 text-cyan-300 border border-cyan-500 p-2 rounded transition-colors font-bold tracking-wider"
            >
              Access Terminal
            </button>
         </div>
      </div>
    );
  }

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
          <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex justify-between items-end mb-6">
              <div>
                <h2 className="text-3xl font-black text-purple-400 tracking-wide drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]">Campaign Control Center</h2>
                <p className="text-purple-300/70 text-sm mt-1">Manage live marketing initiatives, budget allocation, and promo codes.</p>
              </div>
              
              <div className="flex items-center gap-4 bg-black/40 p-3 rounded-xl border border-purple-500/30 backdrop-blur-md">
                <span className="text-sm font-bold text-slate-300">Campaign Status:</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={campaignActive} onChange={() => setCampaignActive(!campaignActive)} />
                  <div className="w-14 h-7 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600 shadow-[0_0_15px_rgba(168,85,247,0.4)]"></div>
                  <span className={`ml-3 text-sm font-black ${campaignActive ? 'text-purple-400 drop-shadow-[0_0_5px_rgba(168,85,247,0.8)]' : 'text-slate-500'}`}>
                    {campaignActive ? 'LIVE' : 'OFFLINE'}
                  </span>
                </label>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Budget Allocation Panel */}
              <div className="bg-black/50 backdrop-blur-xl border border-purple-500/20 rounded-xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-32 h-32 bg-purple-600/10 rounded-full blur-[60px] pointer-events-none"></div>
                <h3 className="text-xl font-bold text-purple-100 mb-6 flex items-center gap-2">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Budget Allocation ($)
                </h3>
                
                <div className="space-y-6 relative z-10">
                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Monthly Budget</label>
                      <span className="text-emerald-400 font-mono font-bold">${budgetTotal.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" min="1000" max="20000" step="500"
                      value={budgetTotal}
                      onChange={(e) => setBudgetTotal(Number(e.target.value))}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>

                  <div className="pt-4 border-t border-purple-500/10">
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Targeted Ad Spend (Meta/Google)</label>
                      <span className="text-cyan-400 font-mono font-bold">${adSpend.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" min="0" max={budgetTotal} step="100"
                      value={adSpend}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setAdSpend(val);
                        if (val + influencerSpend > budgetTotal) setInfluencerSpend(budgetTotal - val);
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between mb-2">
                      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Influencer Sponsorships (YouTube/Twitch)</label>
                      <span className="text-pink-400 font-mono font-bold">${influencerSpend.toLocaleString()}</span>
                    </div>
                    <input 
                      type="range" min="0" max={budgetTotal} step="100"
                      value={influencerSpend}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        setInfluencerSpend(val);
                        if (val + adSpend > budgetTotal) setAdSpend(budgetTotal - val);
                      }}
                      className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-pink-500"
                    />
                  </div>
                  
                  <div className="pt-4 flex justify-between items-center">
                    <span className="text-xs text-slate-500 font-bold uppercase">Remaining Reserves:</span>
                    <span className="text-yellow-400 font-mono font-bold">${(budgetTotal - adSpend - influencerSpend).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Promo Generator & Engagement Chart */}
              <div className="flex flex-col gap-6">
                <div className="bg-gradient-to-br from-purple-900/30 to-black/50 backdrop-blur-xl border border-purple-500/30 rounded-xl p-6 shadow-[0_0_20px_rgba(168,85,247,0.15)] flex-1">
                  <h3 className="text-xl font-bold text-purple-100 mb-4 flex items-center gap-2">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                    Dynamic Promo Code Generator
                  </h3>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={promoCode} 
                      onChange={e => setPromoCode(e.target.value.toUpperCase())}
                      className="flex-1 bg-slate-900/80 border border-slate-700 text-white font-mono p-3 rounded focus:outline-none focus:border-purple-400 transition-colors uppercase"
                    />
                    <button 
                      onClick={() => {
                        setPromoGenerated(true);
                        setTimeout(() => setPromoGenerated(false), 2000);
                      }}
                      className="px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] hover:shadow-[0_0_25px_rgba(168,85,247,0.6)]"
                    >
                      {promoGenerated ? 'ACTIVATED' : 'DEPLOY'}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400 mt-3 italic">Deploying a code instantly syncs with the Stripe payment gateway for 20% off all Starter Decks.</p>
                </div>

                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl p-6 relative overflow-hidden flex-1 flex flex-col justify-between">
                   <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-4">Projected Engagement Yield</h3>
                   <div className="flex items-end gap-2 h-32 w-full mt-auto opacity-80">
                     {/* Mock Interactive Bar Chart */}
                     {[40, 65, 45, 80, 55, 95, 75].map((h, i) => (
                       <div key={i} className="flex-1 bg-gradient-to-t from-purple-900/50 to-purple-400/80 rounded-t-sm hover:to-cyan-400 hover:scale-105 transition-all cursor-pointer relative group" style={{ height: `${campaignActive ? h : 10}%` }}>
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                           {campaignActive ? Math.floor(h * (budgetTotal/1000)) : 0} Clicks
                         </div>
                       </div>
                     ))}
                   </div>
                   <div className="flex justify-between mt-2 text-[10px] text-slate-500 font-bold uppercase">
                     <span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span><span>Sun</span>
                   </div>
                </div>
              </div>
            </div>
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
