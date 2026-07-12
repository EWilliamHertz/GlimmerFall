import { useState } from 'react';
import { BookOpen, FastForward, Scale } from 'lucide-react';

export const Rulebook = () => {
  const [activeMode, setActiveMode] = useState<'relaxed' | 'indepth'>('relaxed');

  return (
    <div className="max-w-5xl mx-auto py-12 px-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-10 border-b border-cyan-900 pb-6">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-900/30 rounded-lg">
            <BookOpen className="w-8 h-8 text-cyan-400" />
          </div>
          <h2 className="text-4xl font-black text-white tracking-tight">OFFICIAL RULEBOOK</h2>
        </div>
        
        <div className="flex bg-slate-900 rounded-lg p-1 border border-slate-800">
          <button 
            onClick={() => setActiveMode('relaxed')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-bold transition-all ${
              activeMode === 'relaxed' ? 'bg-cyan-600 text-white shadow-[0_0_15px_rgba(6,182,212,0.4)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <FastForward className="w-4 h-4" /> Quick Start
          </button>
          <button 
            onClick={() => setActiveMode('indepth')}
            className={`flex items-center gap-2 px-6 py-3 rounded-md font-bold transition-all ${
              activeMode === 'indepth' ? 'bg-purple-600 text-white shadow-[0_0_15px_rgba(147,51,234,0.4)]' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Scale className="w-4 h-4" /> Comprehensive
          </button>
        </div>
      </div>

      <div className="space-y-12 text-slate-300 bg-slate-900/40 p-8 rounded-2xl border border-slate-800/50">
        {activeMode === 'relaxed' ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
            <section>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">1. How to Win</h3>
              <p className="text-lg">Bring your opponent's Nexus Health from 20 down to 0 by attacking it with your cards.</p>
            </section>
            
            <section>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">2. Glimmer & Resonance</h3>
              <p className="text-lg">Instead of lands or mana cards, you can play <strong>any card from your hand face-down</strong> once per turn into your Resonance Row. This card becomes a "Glimmer Node". Each Glimmer Node gives you 1 Energy to spend every turn.</p>
              <div className="mt-4 bg-red-900/20 border border-red-900/50 p-4 rounded-lg text-red-200">
                <strong>WARNING:</strong> If you don't spend your Energy, you take damage! Ending your turn with more than 3 unspent Energy damages your Nexus for the difference.
              </div>
            </section>

            <section>
              <h3 className="text-2xl font-bold text-cyan-400 mb-2">3. Combat (Attacking & Blocking)</h3>
              <p className="text-lg mb-2">You can attack the opponent's cards or their Nexus. If you attack their Nexus, the opponent has the choice to <strong>intercept (block)</strong> the attack with one of their awake cards.</p>
              <ul className="list-disc pl-6 space-y-2 text-lg">
                <li>When two cards fight, they deal damage to each other at the same time.</li>
                <li>If a card's Health drops to 0, it is destroyed.</li>
                <li><strong>Bleed-through:</strong> If your attacking card is much stronger than the blocker, any leftover damage carries over and hits the Nexus!</li>
              </ul>
            </section>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-10">
            <section>
              <h3 className="text-3xl font-bold text-purple-400 mb-4">I. The 3x3 Grid Topology</h3>
              <p className="leading-relaxed mb-4">Glimmerfall's battlefield is not a single line; it is a 3x3 Grid for each player. Positioning dictates mechanics:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Vanguard (Front Row):</strong> Entities here can attack the Nexus directly and can intercept incoming attacks.</li>
                <li><strong>Support (Middle Row):</strong> Entities here project auras and buffs to adjacent Vanguard units, but cannot attack the Nexus directly unless given the <em>Ranged</em> keyword.</li>
                <li><strong>Generator (Back Row):</strong> Entities here act passively to generate advantages (card draw, temporary glimmer) but are highly vulnerable if the Vanguard falls.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-3xl font-bold text-purple-400 mb-4">II. The Combat Phase Resolution</h3>
              <p className="leading-relaxed mb-4">Combat occurs in a strict deterministic step order:</p>
              <ol className="list-decimal pl-6 space-y-4">
                <li><strong>Declaration Step:</strong> The active player declares an attacking Vanguard Entity and a primary target (either a specific enemy Entity or the opponent's Nexus).</li>
                <li><strong>Response Step (Anomalies):</strong> Both players may cast <em>Fast Anomalies</em> in priority order.</li>
                <li><strong>Intercept Step:</strong> If the Nexus was targeted, the defending player may declare exactly one ready Vanguard Entity to intercept the attack. An intercepted attack redirects entirely to the intercepting Entity.</li>
                <li><strong>Damage Calculation:</strong> Damage is dealt simultaneously. Both Entities reduce their Health by the opposing Entity's Power.</li>
                <li>
                  <strong>Trample / Bleed-Through:</strong> If the attacking Entity's Power exceeds the interceptor's remaining Health, the excess Power (Delta) is dealt directly to the opponent's Nexus. 
                  <br/><span className="text-sm text-slate-500 italic">Formula: Nexus Damage = max(0, Attacker Power - Defender Health)</span>
                </li>
              </ol>
            </section>
            
            <section>
              <h3 className="text-3xl font-bold text-purple-400 mb-4">III. The Overload Penalty (Resource Economy)</h3>
              <p className="leading-relaxed">
                The game engine strictly punishes hoarding. During the <strong>End Phase</strong>, the state machine tallies the active player's <em>Unspent Glimmer</em>. If this integer exceeds 3, an Overload event is triggered. The active player's Nexus immediately takes damage equal to <code>Unspent Glimmer - 3</code>. Players must constantly weigh the tempo advantage of ramping resources against the lethal risk of unused potential.
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
