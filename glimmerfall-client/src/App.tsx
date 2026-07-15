import { useState, useEffect, useRef } from 'react';
import { Layers, Book, ShieldAlert, LogIn, Database, TrendingUp, LibraryBig, Menu, X, User } from 'lucide-react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Landing } from './pages/Landing';
import { Auth } from './pages/Auth';
import { Rulebook } from './pages/Rulebook';
import { BoosterOpener } from './pages/BoosterOpener';
import { CardDatabase } from './pages/CardDatabase';
import { Market } from './pages/Market';
import { DeckBuilder } from './pages/DeckBuilder';
import { DeveloperResources } from './pages/DeveloperResources';
import { CardTemplate } from './components/CardTemplate';
import GameEngine from './pages/GameEngine';
import TutorialEngine from './pages/TutorialEngine';
import { PrintDecks } from './pages/PrintDecks';
import { AdminDashboard } from './pages/AdminDashboard';

function App() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(localStorage.getItem('glimmerfall_user'));
  
  const [zoomedCard, setZoomedCard] = useState<any>(null);
  const hoverTimer = useRef<number | null>(null);

  // Sidebar collapse state
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const sidebarTimer = useRef<number | null>(null);

  useEffect(() => {
    if (isSidebarHovered) {
      if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
      setIsSidebarExpanded(true);
    } else {
      sidebarTimer.current = window.setTimeout(() => {
        setIsSidebarExpanded(false);
      }, 2000);
    }
    return () => {
      if (sidebarTimer.current) clearTimeout(sidebarTimer.current);
    };
  }, [isSidebarHovered]);

  useEffect(() => {
    const handleAuthChange = () => setCurrentUser(localStorage.getItem('glimmerfall_user'));
    const handleZoomIn = (e: any) => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      hoverTimer.current = window.setTimeout(() => setZoomedCard(e.detail), 3000);
    };
    const handleZoomOut = () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
      setZoomedCard(null);
    };

    window.addEventListener('auth-change', handleAuthChange);
    window.addEventListener('card-hover-in', handleZoomIn);
    window.addEventListener('card-hover-out', handleZoomOut);
    
    return () => {
      window.removeEventListener('auth-change', handleAuthChange);
      window.removeEventListener('card-hover-in', handleZoomIn);
      window.removeEventListener('card-hover-out', handleZoomOut);
    };
  }, []);

  const navItems = [
    { id: '/', label: 'Home', icon: <Layers className="w-5 h-5 shrink-0" /> },
    { id: '/rulebook', label: 'Rulebook', icon: <Book className="w-5 h-5 shrink-0" /> },
    { id: '/database', label: 'Cards', icon: <Database className="w-5 h-5 shrink-0" /> },
    { id: '/market', label: 'Market', icon: <TrendingUp className="w-5 h-5 text-green-400 shrink-0" /> },
    { id: '/booster', label: 'Boosters', icon: <ShieldAlert className="w-5 h-5 shrink-0" /> },
    { id: '/decks', label: 'Deck Builder', icon: <LibraryBig className="w-5 h-5 text-purple-400 shrink-0" /> },
    { id: '/play', label: 'Play (Alpha)', icon: <Layers className="w-5 h-5 text-cyan-400 shrink-0" /> },
    { id: '/admin', label: 'Admin Hub', icon: <Database className="w-5 h-5 text-red-400 shrink-0" /> },
    ...(currentUser ? [] : [{ id: '/auth', label: 'Login', icon: <LogIn className="w-5 h-5 shrink-0" /> }]),
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-cyan-900 md:flex">
      
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 p-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-2 cursor-pointer" onClick={() => setIsMobileMenuOpen(false)}>
          <img src="/logo.png" className="w-8 h-8 object-contain mix-blend-screen" alt="Logo" />
          <span className="font-bold text-xl tracking-tighter">GLIMMERFALL</span>
        </Link>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-300 hover:text-white">
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Navigation Sidebar (Desktop) / Dropdown (Mobile) */}
      <nav 
        onMouseEnter={() => setIsSidebarHovered(true)}
        onMouseLeave={() => setIsSidebarHovered(false)}
        className={`
        ${isMobileMenuOpen ? 'block' : 'hidden'} 
        md:block sticky top-0 z-40 
        w-full ${isSidebarExpanded ? 'md:w-64' : 'md:w-20'} md:h-screen md:shrink-0
        bg-slate-950 md:bg-slate-950/50 md:backdrop-blur-xl 
        border-b md:border-b-0 md:border-r border-slate-800 
        flex flex-col transition-all duration-300 ease-in-out
      `}>
        {/* Desktop Logo */}
        <div className="hidden md:flex items-center gap-3 p-6 border-b border-slate-800/50 h-[88px] overflow-hidden">
          <img src="/logo.png" className="w-10 h-10 shrink-0 object-contain drop-shadow-[0_0_15px_rgba(6,182,212,0.5)] mix-blend-screen" alt="Logo" />
          <span className={`font-bold text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
            GLIMMERFALL
          </span>
        </div>

        {/* Nav Links */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden py-4 px-3 flex flex-col gap-2">
          {navItems.map(item => (
            <Link
              key={item.id}
              to={item.id}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                location.pathname === item.id 
                  ? 'bg-slate-800 text-white shadow-lg shadow-slate-900/50 border border-slate-700' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
              } ${!isSidebarExpanded ? 'justify-center px-0' : ''}`}
              title={!isSidebarExpanded ? item.label : undefined}
            >
              {item.icon}
              <span className={`whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {item.label}
              </span>
            </Link>
          ))}
        </div>
        
        {/* User Profile / Status */}
        <div className="hidden md:block p-4 border-t border-slate-800/50 overflow-hidden">
          <Link to="/auth" className={`flex items-center gap-3 rounded-xl bg-slate-900/50 border border-slate-800 hover:border-cyan-500/50 transition-all group cursor-pointer ${isSidebarExpanded ? 'px-4 py-3' : 'justify-center py-3'}`}>
            <div className="w-8 h-8 shrink-0 rounded-full bg-slate-700 flex items-center justify-center group-hover:bg-cyan-900 transition-colors">
              <User className="w-4 h-4 text-slate-400 group-hover:text-cyan-400" />
            </div>
            <div className={`flex flex-col whitespace-nowrap transition-opacity duration-300 ${isSidebarExpanded ? 'opacity-100' : 'opacity-0 hidden'}`}>
              <span className="text-xs text-slate-500 font-bold uppercase">Status</span>
              <span className="text-sm font-semibold text-slate-300">{currentUser || 'Guest Player'}</span>
            </div>
          </Link>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 relative overflow-x-hidden flex flex-col">
        <div className="w-full flex-1">
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/rulebook" element={<Rulebook />} />
            <Route path="/database" element={<CardDatabase />} />
            <Route path="/market" element={<Market />} />
            <Route path="/booster" element={<BoosterOpener />} />
            <Route path="/decks" element={<DeckBuilder />} />
            <Route path="/print-decks" element={<PrintDecks />} />
            <Route path="/play" element={<GameEngine />} />
            <Route path="/tutorial" element={<TutorialEngine />} />
            <Route path="/resources" element={<DeveloperResources />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Routes>
        </div>

        {/* Global Footer */}
        <footer className="w-full border-t border-slate-800/50 bg-slate-950/80 backdrop-blur-md p-6 flex flex-col md:flex-row justify-between items-center text-slate-500 text-sm z-30">
          <div>© 2026 Glimmerfall TCG. All rights reserved.</div>
          <div className="flex gap-6 mt-4 md:mt-0 font-semibold">
            <Link to="/resources" className="hover:text-cyan-400 transition-colors">Developer API / Resources</Link>
            <Link to="/rulebook" className="hover:text-purple-400 transition-colors">Rulebook</Link>
            <a href="#" className="hover:text-slate-300 transition-colors">Terms of Service</a>
          </div>
        </footer>
      </main>

      {/* Global Card Zoom Overlay */}
      {zoomedCard && (
        <div 
          className="fixed z-[100] pointer-events-none animate-in zoom-in-75 duration-200 shadow-[0_0_50px_rgba(0,0,0,0.8)] rounded-xl"
          style={{ 
            left: `${Math.min(window.innerWidth - 320, zoomedCard.x + 20)}px`, 
            top: `${Math.max(20, Math.min(window.innerHeight - 450, zoomedCard.y - 200))}px`,
            width: '300px'
          }}
        >
          <CardTemplate card={zoomedCard.card} />
        </div>
      )}
    </div>
  );
}

export default App;
