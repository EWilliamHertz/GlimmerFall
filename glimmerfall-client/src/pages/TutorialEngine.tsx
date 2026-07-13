import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { DropZone } from '../components/DropZone'
import { Card } from '../components/Card'
import { User, ShieldAlert, Zap, Loader2, Swords } from 'lucide-react'

export default function TutorialEngine() {
  const [username] = useState(() => {
    let u = localStorage.getItem('glimmerfall_user');
    if (!u) {
      u = `Player_${Math.floor(Math.random()*10000)}`;
      localStorage.setItem('glimmerfall_user', u);
    }
    return u;
  });

  const [matchStatus, setMatchStatus] = useState<string>('IDLE');

  // Sync State
  const [turn, setTurn] = useState(1);
  const [activePlayer, setActivePlayer] = useState<string>('');
  const [playerHp, setPlayerHp] = useState(20);
  const [opponentHp, setOpponentHp] = useState(20);
  const [turnLog, setTurnLog] = useState<string[]>([]);
  
  const [hand, setHand] = useState<any[]>([
    { id: 'c3', name: 'Aether Sprite', cost: 1, power: 1, health: 1, rarity: 'Common', card_type: 'Entity' },
    { id: 'c4', name: 'Solar Flare', cost: 3, card_type: 'Spell', description: 'Deal 3 damage to any target.' },
    { id: 'c5', name: 'Dawnblade Templar', cost: 4, power: 5, health: 4, rarity: 'Rare', card_type: 'Entity' }
  ]);
  const [deckIndex, setDeckIndex] = useState(0);

  const [battlefield, setBattlefield] = useState<any[]>([]);
  const [resonanceRow, setResonanceRow] = useState<any[]>([]);
  
  const [opponentBattlefield, setOpponentBattlefield] = useState<any[]>([]);
  const [opponentResonance, setOpponentResonance] = useState<any[]>([]);

  const [energy, setEnergy] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [hasResonatedThisTurn, setHasResonatedThisTurn] = useState(false);
  const [aiIsThinking, setAiIsThinking] = useState(false);

  const isPlayerTurn = matchStatus === 'PLAYING' && activePlayer === username;

  // Reset energy on turn start
  useEffect(() => {
    if (isPlayerTurn) {
      setEnergy(resonanceRow.length);
      setHasDrawnThisTurn(false);
      setHasResonatedThisTurn(false);
    }
  }, [activePlayer, isPlayerTurn]);

  const findDuel = () => {
    setMatchStatus('PLAYING');
    setActivePlayer(username);
    setTurnLog(['Welcome to the Tutorial! Drag cards to play.']);
  };

  const sendAction = (action: string, payload: any = {}) => {
    if (action === 'PLAY_CARD') {
      if (payload.zone === 'battlefield') {
        setBattlefield(prev => [...prev, payload.card]);
        setTurnLog(prev => [...prev, `${username} played ${payload.card.name}.`]);
      } else if (payload.zone === 'resonanceRow') {
        setResonanceRow(prev => [...prev, payload.card]);
        setTurnLog(prev => [...prev, `${username} placed ${payload.card.name} as a Node.`]);
      }
    } else if (action === 'ATTACK_VANGUARD') {
      setOpponentHp(h => {
        const newHp = h - payload.power;
        if (newHp <= 0) {
          setMatchStatus('YOU WIN!');
        }
        return newHp;
      });
      setTurnLog(prev => [...prev, `${username} attacked the Vanguard for ${payload.power} damage!`]);
    } else if (action === 'END_TURN') {
      setActivePlayer('AI');
      setAiIsThinking(true);
      setTurnLog(prev => [...prev, `Turn passed to opponent.`]);
      
      setTimeout(() => {
        setTurn(t => t + 1);
        setActivePlayer(username);
        setAiIsThinking(false);
        setTurnLog(prev => [...prev, `Opponent passes. It's your turn!`]);
      }, 3000);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    if (!isPlayerTurn) return;
    setActiveId(event.active.id as string);
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null);
    if (!isPlayerTurn) return;
    const { active, over } = event;
    if (!over) return;

    const card = hand.find(c => c.id === active.id) || battlefield.find(c => c.id === active.id);
    if (!card) return;

    // Play from Hand
    if (hand.find(c => c.id === card.id)) {
      if (over.id === 'battlefield') {
        if (card.card_type === 'Spell') return;
        if (energy >= card.cost) {
          setHand(hand.filter(c => c.id !== card.id));
          setEnergy(e => e - card.cost);
          sendAction('PLAY_CARD', { zone: 'battlefield', card });
        }
      } else if (over.id === 'resonance') {
        if (hasResonatedThisTurn) return;
        setHand(hand.filter(c => c.id !== card.id));
        setEnergy(e => e + 1);
        setHasResonatedThisTurn(true);
        sendAction('PLAY_CARD', { zone: 'resonanceRow', card });
      } else if (over.id === 'opponent_vanguard') {
        if (card.card_type === 'Spell' && energy >= card.cost) {
          setHand(hand.filter(c => c.id !== card.id));
          setEnergy(e => e - card.cost);
          sendAction('ATTACK_VANGUARD', { power: 3 }); // Hardcoded for spell MVP
        }
      }
    } 
    // Attack from Battlefield
    else if (battlefield.find(c => c.id === card.id)) {
      if (over.id === 'opponent_vanguard') {
        if (!card.power) return;
        sendAction('ATTACK_VANGUARD', { power: card.power });
      }
    }
  }

  const passTurn = () => {
    sendAction('END_TURN');
  }

  const drawCard = () => {
    if (hasDrawnThisTurn || !isPlayerTurn) return;
    const possibleDraws = [
      { id: 'd1'+Math.random(), name: 'Eclipse Ritual', cost: 5, power: 5, health: 5, rarity: 'Epic', card_type: 'Entity' },
      { id: 'd2'+Math.random(), name: 'Gilded Pegasus', cost: 3, power: 3, health: 4, rarity: 'Rare', card_type: 'Entity' }
    ];
    setHand(prev => [...prev, possibleDraws[deckIndex % 2]]);
    setDeckIndex(d => d + 1);
    setHasDrawnThisTurn(true);
  }

  if (matchStatus === 'IDLE') {
    return (
      <div className="min-h-full bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="bg-slate-900 border-2 border-cyan-500 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.5)] max-w-md w-full text-center">
          <h2 className="text-3xl font-black text-cyan-400 mb-2">Beginner Tutorial</h2>
          <p className="text-slate-400 mb-8 font-mono">Logged in as: {username}</p>
          
          <div className="flex flex-col gap-3">
            <button 
              onClick={findDuel}
              className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105 flex items-center justify-center gap-3"
            >
              <Swords className="w-6 h-6" />
              START TUTORIAL
            </button>
            <Link to="/play" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold tracking-widest text-sm rounded-xl transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2 mt-2">
              GO TO PVP ARENA
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (matchStatus.includes('WIN')) {
    return (
      <div className="min-h-full bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-900 border-2 border-yellow-500 p-12 rounded-2xl shadow-[0_0_100px_rgba(234,179,8,0.5)] text-center">
          <h1 className="text-6xl font-black text-yellow-400 mb-4">{matchStatus}</h1>
          <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700">Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-10px) rotate(-1deg); }
          20%, 40%, 60%, 80% { transform: translateX(10px) rotate(1deg); }
        }
        .animate-shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
          border: 4px solid rgba(220,38,38,0.8);
        }
      `}</style>
      <div className={`min-h-full bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-slate-950 flex flex-col justify-between p-4 lg:p-8 transition-colors duration-100`}>
        
        {/* Opponent Area (Top) */}
        <div className="flex flex-col gap-4">
          <DropZone id="opponent_vanguard" title="">
            <div className={`flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border ${activeId && battlefield.find(c=>c.id===activeId) ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-red-900/30'} shadow-[0_0_30px_rgba(220,38,38,0.05)] transition-all w-full`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-950 border border-red-800 rounded-lg flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-red-400 text-lg">Enemy Vanguard (AI)</h3>
                  <p className="text-sm text-slate-400 font-mono">{opponentHp} Nexus HP</p>
                </div>
              </div>
            </div>
          </DropZone>

          {/* Opponent Resonance Row */}
          <div className="w-full bg-slate-900/30 border border-slate-800 rounded-xl min-h-[120px] p-4 flex gap-4 opacity-70">
            {opponentResonance.map(c => (
              <div key={c.id} className="w-24 h-24 rounded-full relative overflow-hidden border-2 border-red-700 shadow-[0_0_15px_rgba(220,38,38,0.3)] animate-in spin-in-12 duration-500">
                <img src="/baked_cardback.png" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/40">
                  <span className="text-[10px] font-black tracking-widest text-red-300">NODE</span>
                </div>
              </div>
            ))}
          </div>

          {/* Opponent Battlefield */}
          <div className="w-full bg-red-900/10 border border-red-900/30 rounded-xl min-h-[180px] p-4 flex gap-4 overflow-x-auto">
            {opponentBattlefield.map(c => (
              <div key={c.id} className="animate-in slide-in-from-top-8 fade-in zoom-in-75 duration-500">
                <Card {...c} />
              </div>
            ))}
          </div>
        </div>

        {/* Center Divider / Combat Zone */}
        <div className="w-full flex items-center justify-between py-8 opacity-90 px-4">
          <div className="h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent flex-1"></div>
          
          <div className="flex flex-col items-center mx-6 gap-2">
            <button 
              onClick={passTurn}
              disabled={!isPlayerTurn}
              className={`px-8 py-3 rounded-full font-black tracking-widest border-2 transition-all shadow-lg ${
                isPlayerTurn 
                  ? 'bg-cyan-600 border-cyan-400 text-white hover:bg-cyan-500 hover:scale-105 shadow-[0_0_20px_rgba(6,182,212,0.5)]' 
                  : 'bg-slate-800 border-slate-600 text-slate-400 cursor-not-allowed'
              }`}
            >
              {aiIsThinking ? 'OPPONENT THINKING...' : (isPlayerTurn ? 'PASS TURN' : 'OPPONENT TURN')}
            </button>
            <div className="text-xs text-cyan-500 font-mono font-bold bg-slate-900 px-3 py-1 rounded border border-cyan-900/50">
              TURN {turn}
            </div>
          </div>

          <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-cyan-500 to-transparent flex-1"></div>
        </div>

        {/* Player Area (Bottom) */}
        <div className="flex flex-col gap-4">
          <DropZone id="battlefield" title="Your Battlefield">
            {battlefield.map(c => (
              <div key={c.id} className="animate-in slide-in-from-bottom-8 fade-in zoom-in-75 duration-500">
                <Card {...c} />
              </div>
            ))}
          </DropZone>

          <DropZone id="resonance" title="Your Resonance Row (Drag here to play as Node)">
            {resonanceRow.map(c => (
              <div key={c.id} className="w-24 h-24 rounded-full relative overflow-hidden border-2 border-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.6)] animate-in spin-in-12 duration-500">
                <img src="/baked_cardback.png" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-cyan-900/60 p-2">
                  <span className="text-[10px] font-bold text-white text-center truncate w-full">{c.name}</span>
                  <span className="text-[10px] font-black tracking-widest text-cyan-300 mt-1">NODE</span>
                </div>
              </div>
            ))}
          </DropZone>

          <div className="flex flex-col xl:flex-row justify-between items-end mt-4 gap-6">
            <div className="flex flex-col gap-2 shrink-0 w-64">
              <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-cyan-900/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="w-14 h-14 bg-cyan-950 border border-cyan-500 rounded-lg flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-cyan-400 text-xl">{username}</h3>
                  <p className="text-sm text-cyan-600 font-mono font-bold">{playerHp} Nexus HP</p>
                </div>
              </div>
              <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-yellow-600/50">
                <div className="w-10 h-10 bg-yellow-900/50 rounded-full flex items-center justify-center text-yellow-400 border border-yellow-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Energy</h3>
                  <p className="text-xl font-black text-yellow-400 font-mono">{energy} / {resonanceRow.length}</p>
                </div>
              </div>

              {/* Combat Log */}
              <div className="h-24 bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-y-auto mt-2 flex flex-col-reverse">
                <div className="flex flex-col gap-1">
                  {turnLog.map((log, i) => (
                    <span key={i} className={`text-xs ${i === turnLog.length - 1 ? 'text-cyan-300 font-bold' : 'text-slate-600'}`}>{log}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-slate-900/60 rounded-2xl min-h-[240px] border border-slate-800 flex-1 justify-center relative shadow-inner overflow-x-auto">
              <div className="absolute top-2 left-4 text-xs font-bold text-slate-500 tracking-widest uppercase">Your Hand</div>
              {hand.map(c => (
                <div key={c.id} className="animate-in slide-in-from-bottom-12 fade-in duration-500">
                  <Card {...c} />
                </div>
              ))}
              <button 
                onClick={drawCard}
                disabled={hasDrawnThisTurn || !isPlayerTurn}
                className={`ml-8 w-24 h-[134px] bg-slate-800 rounded-lg border-2 border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-pointer group shrink-0 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <img src="/baked_cardback.png" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-70 transition-opacity" alt="Deck" />
                <div className="relative z-10 flex flex-col items-center bg-black/60 w-full py-2">
                  <div className="font-black tracking-widest text-sm mb-1 text-white">DECK</div>
                  <div className="text-[10px] text-cyan-300 font-bold">DRAW</div>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>

      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="animate-in zoom-in-105 duration-200 shadow-[0_0_50px_rgba(6,182,212,0.8)] rounded-xl z-[9999] pointer-events-none relative">
            <Card {...(hand.find(c => c.id === activeId) || battlefield.find(c => c.id === activeId) || hand[0])!} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
