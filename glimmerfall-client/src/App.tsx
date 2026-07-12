import { useState } from 'react';
import { Layers, Book, ShieldAlert, LogIn, Database, TrendingUp } from 'lucide-react';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Rulebook } from './pages/Rulebook';
import { BoosterOpener } from './pages/BoosterOpener';
import { CardDatabase } from './pages/CardDatabase';
import { Market } from './pages/Market';
import GameEngine from './pages/GameEngine';

function App() {
  const [activeTab, setActiveTab] = useState('landing');

  const navItems = [
    { id: 'landing', label: 'Home', icon: <Layers className="w-4 h-4" /> },
    { id: 'rulebook', label: 'Rulebook', icon: <Book className="w-4 h-4" /> },
    { id: 'database', label: 'Cards', icon: <Database className="w-4 h-4" /> },
    { id: 'market', label: 'Market', icon: <TrendingUp className="w-4 h-4 text-green-400" /> },
    { id: 'booster', label: 'Boosters', icon: <ShieldAlert className="w-4 h-4" /> },
    { id: 'play', label: 'Play (Alpha)', icon: <Layers className="w-4 h-4 text-cyan-400" /> },
    { id: 'auth', label: 'Login', icon: <LogIn className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-900">
      {/* Top Navigation */}
      <nav className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('landing')}>
              <div className="w-8 h-8 rounded bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center font-black">
                G
              </div>
              <span className="font-bold text-xl tracking-tighter">GLIMMERFALL</span>
            </div>
            
            <div className="hidden md:flex space-x-1 bg-slate-900/50 p-1 rounded-lg border border-slate-800">
              {navItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                    activeTab === item.id 
                      ? 'bg-slate-800 text-white shadow' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="relative">
        {activeTab === 'landing' && <Landing setTab={setActiveTab} />}
        {activeTab === 'auth' && <Auth />}
        {activeTab === 'rulebook' && <Rulebook />}
        {activeTab === 'database' && <CardDatabase />}
        {activeTab === 'market' && <Market />}
        {activeTab === 'booster' && <BoosterOpener />}
        {activeTab === 'play' && <GameEngine />}
      </main>
    </div>
  );
}

export default App;
