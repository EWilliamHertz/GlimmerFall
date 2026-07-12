import { ArrowRight, Sparkles, Shield, Coins, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-start min-h-screen text-center px-4 overflow-hidden relative pb-24">
      {/* Background glow & textures */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-20 bg-slate-950 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')]">
        <div className="absolute top-[10%] left-[20%] w-[600px] h-[600px] bg-cyan-600/20 blur-[150px] rounded-full"></div>
        <div className="absolute top-[40%] right-[10%] w-[500px] h-[500px] bg-purple-600/20 blur-[150px] rounded-full"></div>
      </div>
      
      {/* Hero Section */}
      <div className="pt-20 lg:pt-32 pb-20 w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-left">
          <div className="inline-block px-4 py-1.5 rounded-full border border-cyan-500/30 bg-cyan-900/30 text-cyan-400 font-bold text-sm tracking-widest mb-6 backdrop-blur-sm">
            ALPHA EDITION LAUNCHING SOON
          </div>
          <h1 className="text-6xl lg:text-8xl font-black tracking-tighter mb-4 leading-[1.1]">
            COMMAND THE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              RESONANCE
            </span>
          </h1>
          <p className="text-xl text-cyan-300 font-bold mb-4 tracking-wider uppercase">
            For more strategic TCG gameplay.
          </p>
          <p className="text-xl text-slate-300 max-w-xl mb-10 font-light leading-relaxed">
            Welcome to GlimmerFall, the hyper-modern cyber-magic TCG. Manage your resources, build complex Resonance Nodes, and shatter the enemy Vanguard.
          </p>
          <div className="flex flex-wrap gap-4">
            <button 
              onClick={() => navigate('/auth')}
              className="group relative px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg rounded-xl transition-all shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_50px_rgba(6,182,212,0.6)] flex items-center gap-3 hover:scale-105"
            >
              REGISTER TO PLAY <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => navigate('/booster')}
              className="px-8 py-4 bg-slate-900/50 hover:bg-slate-800 text-cyan-400 border border-cyan-800 font-bold text-lg rounded-xl transition-all shadow-lg backdrop-blur-md flex items-center gap-3 hover:scale-105"
            >
              <Sparkles className="w-5 h-5" /> SIMULATE BOOSTER
            </button>
          </div>
          <p className="mt-4 text-slate-500 text-sm italic">* Play the interactive Introduction Game immediately after registering.</p>
        </div>

        {/* Hero Image / Gaia */}
        <div className="flex-1 relative w-full max-w-md lg:max-w-none perspective-1000">
          <div className="relative animate-in slide-in-from-right duration-1000 [transform:rotateY(-15deg)_rotateX(10deg)] hover:[transform:rotateY(0deg)_rotateX(0deg)] transition-transform duration-700">
            <img 
              src="/card_renders/gaia_the_world-soul.png" 
              alt="Gaia, The World-Soul" 
              className="w-full h-auto rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.5)] border border-cyan-500/50"
            />
            <div className="absolute -inset-4 bg-cyan-500/20 blur-2xl -z-10 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Feature Pillars */}
      <div className="w-full max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-md text-left hover:border-cyan-500/50 transition-colors group">
          <div className="w-14 h-14 bg-cyan-900/50 rounded-xl flex items-center justify-center text-cyan-400 mb-6 group-hover:scale-110 transition-transform">
            <Zap className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Resource Mastery</h3>
          <p className="text-slate-400 leading-relaxed">
            In GlimmerFall, you must strategically manage your resources. Every card can be played as an Entity, or sacrificed into the Resonance Row to permanently generate Energy for future turns.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-md text-left hover:border-purple-500/50 transition-colors group">
          <div className="w-14 h-14 bg-purple-900/50 rounded-xl flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
            <Shield className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Instant Introduction</h3>
          <p className="text-slate-400 leading-relaxed">
            Don't just read the rulebook. The moment you register an account, you will be thrown into a fully scripted, interactive tutorial match to learn the mechanics firsthand.
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-8 rounded-2xl backdrop-blur-md text-left hover:border-green-500/50 transition-colors group">
          <div className="w-14 h-14 bg-green-900/50 rounded-xl flex items-center justify-center text-green-400 mb-6 group-hover:scale-110 transition-transform">
            <Coins className="w-7 h-7" />
          </div>
          <h3 className="text-2xl font-black text-white mb-3">Stable MSRP</h3>
          <p className="text-slate-400 leading-relaxed">
            We are committed to a healthy player economy. We guarantee a stable, fixed MSRP for all Booster boxes that will be strictly kept. No price gouging. We will always supply you.
          </p>
        </div>
      </div>
    </div>
  );
};
