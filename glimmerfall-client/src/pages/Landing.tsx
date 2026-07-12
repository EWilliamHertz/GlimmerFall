
import { ArrowRight, Sparkles } from 'lucide-react';

export const Landing = ({ setTab }: { setTab: (tab: string) => void }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 bg-slate-950">
        <div className="absolute top-[20%] left-[50%] -translate-x-1/2 w-[800px] h-[400px] bg-cyan-600/20 blur-[120px] rounded-full"></div>
      </div>
      
      <h1 className="text-6xl md:text-8xl font-black tracking-tighter mb-6">
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
          GLIMMERFALL
        </span>
      </h1>
      
      <p className="text-xl md:text-2xl text-slate-400 max-w-2xl mb-12 font-light">
        A hyper-modern cyber-magic trading card game. Command the resonance, build your nodes, and destroy the enemy nexus.
      </p>
      
      <div className="flex gap-6">
        <button 
          onClick={() => setTab('auth')}
          className="group relative px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(6,182,212,0.6)] flex items-center gap-2"
        >
          Join the Beta <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </button>
        <button 
          onClick={() => setTab('booster')}
          className="px-8 py-4 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-800 font-bold rounded-lg transition-all flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5" /> Open Boosters
        </button>
      </div>
    </div>
  );
};
