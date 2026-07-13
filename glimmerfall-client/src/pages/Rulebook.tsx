import { useState } from 'react';
import { BookOpen, FastForward, Scale, Target, Zap, Shield, Grid, Clock, Flame, ChevronRight } from 'lucide-react';

export const Rulebook = () => {
  const [activeMode, setActiveMode] = useState<'relaxed' | 'indepth'>('relaxed');

  return (
    <div className="min-h-[calc(100vh-64px)] bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-slate-950 py-12 px-6">
      <div className="max-w-5xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b border-cyan-900/50 pb-8">
          <div className="flex items-center gap-5">
            <div className="p-4 bg-cyan-950/50 border border-cyan-800/50 rounded-xl shadow-[0_0_30px_rgba(6,182,212,0.15)]">
              <BookOpen className="w-10 h-10 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
                OFFICIAL RULEBOOK
              </h2>
              <p className="text-cyan-600 font-semibold mt-1 tracking-wider uppercase text-sm">Glimmerfall TCG Core Mechanics</p>
            </div>
          </div>
          
          <div className="flex bg-slate-900/80 p-1.5 rounded-xl border border-slate-800 backdrop-blur-md shadow-xl">
            <button 
              onClick={() => setActiveMode('relaxed')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                activeMode === 'relaxed' 
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <FastForward className="w-5 h-5" /> Quick Start
            </button>
            <button 
              onClick={() => setActiveMode('indepth')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-bold transition-all duration-300 ${
                activeMode === 'indepth' 
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_20px_rgba(147,51,234,0.4)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Scale className="w-5 h-5" /> Comprehensive
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="relative">
          {/* Subtle background glow */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none transition-colors duration-1000 ${
            activeMode === 'relaxed' ? 'bg-cyan-500' : 'bg-purple-500'
          }`}></div>

          <div className="relative text-slate-300 bg-slate-900/60 backdrop-blur-xl p-8 md:p-12 rounded-3xl border border-slate-700/50 shadow-2xl">
            {activeMode === 'relaxed' ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                <section className="flex gap-6">
                  <div className="shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-cyan-900/50 border border-cyan-500 flex items-center justify-center text-cyan-400">
                      <Target className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">1. How to Win</h3>
                    <p className="text-lg text-slate-400 leading-relaxed">
                      Bring your opponent's Nexus Health from <strong className="text-white">20</strong> down to <strong className="text-white">0</strong> by attacking it with your Entities. Alternatively, you win immediately if your opponent must draw a card from an empty deck.
                    </p>
                  </div>
                </section>
                
                <section className="flex gap-6">
                  <div className="shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-yellow-900/50 border border-yellow-500 flex items-center justify-center text-yellow-400">
                      <Zap className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">2. Glimmer & Resonance</h3>
                    <p className="text-lg text-slate-400 leading-relaxed mb-4">
                      Instead of specific land or mana cards, you can play <strong>any card from your hand face-down</strong> once per turn into your Resonance Row. This card becomes a "Glimmer Node". Each Glimmer Node gives you 1 Energy to spend every turn to play other cards.
                    </p>
                    <div className="bg-gradient-to-r from-red-950/80 to-transparent border-l-4 border-red-500 p-5 rounded-r-lg flex items-start gap-4">
                      <Flame className="w-6 h-6 text-red-400 shrink-0 mt-0.5" />
                      <p className="text-red-200">
                        <strong className="text-red-400 font-bold block mb-1">WARNING: OVERLOAD PENALTY</strong>
                        If you don't spend your Energy, it becomes unstable! Ending your turn with more than 3 unspent Energy damages your Nexus for the exact difference. Don't hoard!
                      </p>
                    </div>
                  </div>
                </section>

                <section className="flex gap-6">
                  <div className="shrink-0 mt-1">
                    <div className="w-12 h-12 rounded-full bg-emerald-900/50 border border-emerald-500 flex items-center justify-center text-emerald-400">
                      <Shield className="w-6 h-6" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-3">3. Combat (Attacking & Blocking)</h3>
                    <p className="text-lg text-slate-400 leading-relaxed mb-4">
                      You can attack the opponent's rested cards or their Nexus directly. If you attack their Nexus, the opponent has the choice to <strong>intercept (block)</strong> the attack using one of their awake Vanguard entities.
                    </p>
                    <ul className="space-y-3 mt-4">
                      <li className="flex items-start gap-3 text-lg text-slate-400">
                        <ChevronRight className="w-6 h-6 text-cyan-500 shrink-0" />
                        <span>When two cards fight, they deal damage to each other at the exact same time.</span>
                      </li>
                      <li className="flex items-start gap-3 text-lg text-slate-400">
                        <ChevronRight className="w-6 h-6 text-cyan-500 shrink-0" />
                        <span>If an entity's Health drops to 0, it is destroyed and sent to the Crypt.</span>
                      </li>
                      <li className="flex items-start gap-3 text-lg text-slate-400">
                        <ChevronRight className="w-6 h-6 text-purple-400 shrink-0" />
                        <span><strong>Bleed-through:</strong> If your attacking card's Power is higher than the blocker's remaining Health, any leftover damage carries over and strikes the opponent's Nexus!</span>
                      </li>
                    </ul>
                  </div>
                </section>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-12">
                <section>
                  <div className="flex items-center gap-4 mb-6 pb-2 border-b border-purple-900/30">
                    <Grid className="w-8 h-8 text-purple-400" />
                    <h3 className="text-3xl font-black text-white tracking-wide">I. The 3x3 Grid Topology</h3>
                  </div>
                  <p className="text-lg text-slate-400 leading-relaxed mb-6">
                    Glimmerfall's battlefield is not a single line; it is a 3x3 Grid for each player. Positioning dictates mechanics and legal targets:
                  </p>
                  <div className="grid md:grid-cols-3 gap-6">
                    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-xl hover:border-purple-500/50 transition-colors">
                      <h4 className="text-xl font-bold text-white mb-2">Vanguard <span className="text-sm font-normal text-slate-500">(Front)</span></h4>
                      <p className="text-slate-400 text-sm">Entities here can attack the Nexus directly and can intercept incoming attacks. They are the frontline shield.</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-xl hover:border-purple-500/50 transition-colors">
                      <h4 className="text-xl font-bold text-white mb-2">Support <span className="text-sm font-normal text-slate-500">(Middle)</span></h4>
                      <p className="text-slate-400 text-sm">Entities here project auras and buffs to adjacent Vanguard units, but cannot attack the Nexus directly unless given the <em>Ranged</em> keyword.</p>
                    </div>
                    <div className="bg-slate-950/50 border border-slate-800 p-6 rounded-xl hover:border-purple-500/50 transition-colors">
                      <h4 className="text-xl font-bold text-white mb-2">Generator <span className="text-sm font-normal text-slate-500">(Back)</span></h4>
                      <p className="text-slate-400 text-sm">Entities here act passively to generate advantages (card draw, temporary glimmer) but are highly vulnerable if the Vanguard line falls.</p>
                    </div>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-4 mb-6 pb-2 border-b border-purple-900/30">
                    <Clock className="w-8 h-8 text-purple-400" />
                    <h3 className="text-3xl font-black text-white tracking-wide">II. The Combat Phase Resolution</h3>
                  </div>
                  <p className="text-lg text-slate-400 leading-relaxed mb-6">
                    Combat occurs in a strict deterministic step order. Neither player may bypass these priority checks:
                  </p>
                  <div className="space-y-4">
                    {[
                      { step: 1, title: "Declaration Step", desc: "The active player declares an attacking Vanguard Entity and a primary target (either a specific enemy Entity or the opponent's Nexus)." },
                      { step: 2, title: "Response Step", desc: "Both players may cast Fast Anomalies in priority order, starting with the defending player." },
                      { step: 3, title: "Intercept Step", desc: "If the Nexus was targeted, the defending player may declare exactly one ready Vanguard Entity to intercept the attack." },
                      { step: 4, title: "Damage Calculation", desc: "Damage is dealt simultaneously. Both Entities reduce their Health by the opposing Entity's Power." },
                      { step: 5, title: "Trample / Bleed-Through", desc: "If the attacking Entity's Power exceeds the interceptor's remaining Health, the excess Power (Delta) is dealt directly to the opponent's Nexus.", highlight: true }
                    ].map(item => (
                      <div key={item.step} className={`flex gap-4 p-4 rounded-xl border ${item.highlight ? 'bg-purple-900/20 border-purple-500/50' : 'bg-slate-950/30 border-slate-800'}`}>
                        <div className={`w-8 h-8 shrink-0 rounded flex items-center justify-center font-black ${item.highlight ? 'bg-purple-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
                          {item.step}
                        </div>
                        <div>
                          <h4 className={`font-bold ${item.highlight ? 'text-purple-300' : 'text-slate-200'}`}>{item.title}</h4>
                          <p className={`text-sm mt-1 ${item.highlight ? 'text-purple-200/70' : 'text-slate-400'}`}>{item.desc}</p>
                          {item.highlight && (
                            <code className="block mt-3 bg-black/40 text-purple-300 p-2 rounded text-xs font-mono border border-purple-900/50">
                              Nexus Damage = max(0, Attacker Power - Defender Health)
                            </code>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
                
                <section>
                  <div className="flex items-center gap-4 mb-6 pb-2 border-b border-purple-900/30">
                    <Flame className="w-8 h-8 text-red-500" />
                    <h3 className="text-3xl font-black text-white tracking-wide">III. The Overload Penalty</h3>
                  </div>
                  <div className="bg-red-950/20 border border-red-900/30 p-8 rounded-2xl relative overflow-hidden">
                    <div className="absolute -right-10 -top-10 opacity-10">
                      <Flame className="w-48 h-48 text-red-500" />
                    </div>
                    <p className="text-lg text-slate-300 leading-relaxed relative z-10">
                      The game engine strictly punishes hoarding. During the <strong className="text-white">End Phase</strong>, the state machine tallies the active player's <em>Unspent Glimmer</em>. 
                      If this integer exceeds 3, an Overload event is triggered. The active player's Nexus immediately takes damage equal to <code>Unspent Glimmer - 3</code>. 
                      Players must constantly weigh the tempo advantage of ramping resources against the lethal risk of unused potential.
                    </p>
                  </div>
                </section>

                <section>
                  <div className="flex items-center gap-4 mb-6 pb-2 border-b border-purple-900/30">
                    <BookOpen className="w-8 h-8 text-cyan-400" />
                    <h3 className="text-3xl font-black text-white tracking-wide">IV. Keyword Glossary</h3>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
                      <h4 className="text-lg font-bold text-red-400 mb-1">Lethal</h4>
                      <p className="text-slate-400 text-sm">Any amount of damage dealt by this entity to another entity is enough to instantly destroy it, regardless of the defender's remaining Health.</p>
                    </div>
                    <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
                      <h4 className="text-lg font-bold text-yellow-400 mb-1">Swift</h4>
                      <p className="text-slate-400 text-sm">This entity can attack on the exact same turn it is played, completely bypassing standard summoning sickness.</p>
                    </div>
                    <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
                      <h4 className="text-lg font-bold text-purple-400 mb-1">Overwhelm</h4>
                      <p className="text-slate-400 text-sm">If this entity attacks and is intercepted, any excess damage beyond the defending entity's Health is dealt directly to the opponent's Nexus (Bleed-through damage).</p>
                    </div>
                    <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl">
                      <h4 className="text-lg font-bold text-blue-400 mb-1">Ranged</h4>
                      <p className="text-slate-400 text-sm">This entity is permitted to declare attacks on the opponent's Vanguard or Nexus while stationed safely in the Support (Middle) row.</p>
                    </div>
                    <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-xl md:col-span-2">
                      <h4 className="text-lg font-bold text-emerald-400 mb-1">Shield</h4>
                      <p className="text-slate-400 text-sm">Prevents the very next instance of damage this entity would take from any source. Once damage is prevented, the shield is destroyed.</p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
