import { useState, useEffect } from 'react'
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay } from '@dnd-kit/core'
import { useWebSocket } from '../WebSocketContext'
import { DropZone } from '../components/DropZone'
import { Card } from '../components/Card'
import { User, ShieldAlert, Zap } from 'lucide-react'

export default function GameEngine() {
  const { gameState, sendIntent } = useWebSocket()
  
  // Interactive Game State
  const [isPlayerTurn, setIsPlayerTurn] = useState(true)
  const [energy, setEnergy] = useState(0)
  const [turn, setTurn] = useState(1)
  const [playerHp, setPlayerHp] = useState(20)
  const [opponentHp, setOpponentHp] = useState(20)
  const [shake, setShake] = useState(false)
  const [deckIndex, setDeckIndex] = useState(0)
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false)
  const [hasResonatedThisTurn, setHasResonatedThisTurn] = useState(false)
  const [turnLog, setTurnLog] = useState<string[]>(['Match started! Your turn. Drag a card to the Resonance Row to gain Energy!'])
  
  // Local state for demo purposes until backend is fully connected
  const [hand, setHand] = useState<any[]>([
    { id: 'c3', name: 'Aether Sprite', cost: 1, power: 1, health: 1, rarity: 'Common' },
    { id: 'c4', name: 'Solar Flare', cost: 3, card_type: 'Spell', description: 'Deal 3 damage to any target.' }
  ])
  const [battlefield, setBattlefield] = useState<any[]>([])
  const [resonanceRow, setResonanceRow] = useState<any[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)
  const [showTutorial, setShowTutorial] = useState(true)

  // Mock Opponent State
  const [opponentHandCount, setOpponentHandCount] = useState(4)
  const [opponentBattlefield, setOpponentBattlefield] = useState<any[]>([])
  const [opponentResonance, setOpponentResonance] = useState<any[]>([])

  // Listen for websocket state updates
  useEffect(() => {
    if (gameState && gameState.type === 'BOARD_UPDATE') {
      setOpponentHandCount(gameState.payload.handCount);
      setOpponentBattlefield(gameState.payload.battlefield);
      setOpponentResonance(gameState.payload.resonanceRow);
    }
  }, [gameState]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveId(null)
    const { active, over } = event
    if (!over) return

    const card = hand.find(c => c.id === active.id) || battlefield.find(c => c.id === active.id)
    if (!card) return

    let newHand = [...hand];
    let newBattlefield = [...battlefield];
    let newResonance = [...resonanceRow];
    let newEnergy = energy;
    let newOpponentHp = opponentHp;

    // Play from Hand
    if (hand.find(c => c.id === card.id)) {
      if (over.id === 'battlefield') {
        if (card.card_type === 'Spell') {
          setTurnLog(prev => [`Spells cannot be played on the Battlefield. Drag them to a valid target!`, ...prev]);
          return;
        }
        if (energy >= card.cost) {
          newHand = newHand.filter(c => c.id !== card.id);
          newBattlefield.push(card);
          newEnergy -= card.cost;
          setTurnLog(prev => [`You summoned ${card.name}.`, ...prev]);
        } else {
          setTurnLog(prev => [`Not enough energy to play ${card.name}.`, ...prev]);
          return;
        }
      } else if (over.id === 'resonance') {
        if (hasResonatedThisTurn) {
          setTurnLog(prev => [`You can only crystallize one card per turn.`, ...prev]);
          return;
        }
        newHand = newHand.filter(c => c.id !== card.id);
        newResonance.push(card);
        newEnergy += 1; // Gain energy immediately
        setHasResonatedThisTurn(true);
        setTurnLog(prev => [`You crystallized ${card.name} and gained 1 Energy.`, ...prev]);
      } else if (over.id === 'opponent_vanguard') {
        if (card.card_type === 'Spell') {
          if (energy >= card.cost) {
            newHand = newHand.filter(c => c.id !== card.id);
            newEnergy -= card.cost;
            if (card.name === 'Solar Flare') {
              newOpponentHp -= 3;
              setTurnLog(prev => [`You cast Solar Flare! It blasted the Vanguard for 3 damage.`, ...prev]);
              setShake(true);
              setTimeout(() => setShake(false), 500);
            } else {
              setTurnLog(prev => [`You cast ${card.name}!`, ...prev]);
            }
            if (newOpponentHp <= 0) {
              setTurnLog(prev => [`VICTORY! You have shattered the enemy Vanguard!`, ...prev]);
            }
          } else {
            setTurnLog(prev => [`Not enough energy to cast ${card.name}.`, ...prev]);
            return;
          }
        } else {
          setTurnLog(prev => [`You must play Entities to the Battlefield first!`, ...prev]);
          return;
        }
      }
    } 
    // Attack from Battlefield
    else if (battlefield.find(c => c.id === card.id)) {
      if (over.id === 'opponent_vanguard') {
        if (!card.power) {
          setTurnLog(prev => [`${card.name} cannot attack.`, ...prev]);
          return;
        }
        newOpponentHp -= card.power;
        setTurnLog(prev => [`${card.name} attacked the Vanguard for ${card.power} damage!`, ...prev]);
        
        if (newOpponentHp <= 0) {
          setTurnLog(prev => [`VICTORY! You have shattered the enemy Vanguard!`, ...prev]);
        }
      }
    }

    setHand(newHand);
    setBattlefield(newBattlefield);
    setResonanceRow(newResonance);
    setEnergy(newEnergy);
    setOpponentHp(newOpponentHp);

    // Broadcast our updated state to the opponent
    sendIntent('BOARD_UPDATE', {
      handCount: newHand.length,
      battlefield: newBattlefield,
      resonanceRow: newResonance
    });
  }

  const passTurn = () => {
    setIsPlayerTurn(false)
    setTurnLog(prev => ['You passed the turn.', ...prev])
    
    // Simulate scripted opponent turn
    setTimeout(() => {
      if (turn === 1) {
        setTurnLog(prev => ['Opponent played Void Stalker and passed.', ...prev])
        setOpponentBattlefield(prev => [...prev, { id: 'opp_c1', name: 'Void Stalker', cost: 2, power: 3, health: 2, rarity: 'Uncommon', card_type: 'Entity' }])
      } else if (turn === 2) {
        setTurnLog(prev => ['Opponent attacked with Void Stalker! You take 3 damage.', ...prev])
        setPlayerHp(hp => hp - 3);
        setShake(true);
        setTimeout(() => setShake(false), 500);
      } else {
        setTurnLog(prev => ['Opponent is intimidated and passed.', ...prev])
      }

      setIsPlayerTurn(true)
      setHasDrawnThisTurn(false)
      setHasResonatedThisTurn(false)
      setTurn(t => t + 1)
      
      const newEnergy = resonanceRow.length;
      setEnergy(newEnergy) 

      // Scripted draw
      if (turn === 1) {
        setHand(prev => [...prev, { id: 'c2', name: 'Dawnblade Templar', cost: 4, power: 5, health: 4, rarity: 'Rare', card_type: 'Entity', description: 'A holy warrior.' }])
        setTurnLog(prev => [`Turn 2 begins. You drew Dawnblade Templar! Energy: ${newEnergy}.`, ...prev])
      } else if (turn === 2) {
        setHand(prev => [...prev, { id: 'c1', name: 'Gaia, The World-Soul', cost: 7, power: 8, health: 8, rarity: 'Mythic', card_type: 'Entity', description: 'The planet incarnate.' }])
        setTurnLog(prev => [`Turn 3 begins. You drew Gaia! Energy: ${newEnergy}.`, ...prev])
      } else {
        setTurnLog(prev => [`Turn ${turn + 1} begins. Energy: ${newEnergy}.`, ...prev])
      }
    }, 2000)
  }

  const drawCard = () => {
    if (hasDrawnThisTurn) return;
    const possibleDraws = [
      { id: 'd1', name: 'Eclipse Ritual', cost: 5, power: 5, health: 5, rarity: 'Epic', card_type: 'Entity', description: 'Draw mechanic.' },
      { id: 'd2', name: 'Gilded Pegasus', cost: 3, power: 3, health: 4, rarity: 'Rare', card_type: 'Entity', description: 'Draw mechanic.' },
      { id: 'd3', name: 'Crypt Lantern', cost: 2, power: 1, health: 3, rarity: 'Common', card_type: 'Entity', description: 'Draw mechanic.' },
      { id: 'd4', name: 'Sunfire Colossus', cost: 8, power: 9, health: 9, rarity: 'Mythic', card_type: 'Entity', description: 'Draw mechanic.' }
    ];
    if (deckIndex < possibleDraws.length) {
      setHand(prev => [...prev, possibleDraws[deckIndex]]);
      setDeckIndex(d => d + 1);
      setHasDrawnThisTurn(true);
      setTurnLog(prev => [`You manually drew ${possibleDraws[deckIndex].name}.`, ...prev]);
    } else {
      setTurnLog(prev => [`Your deck is empty!`, ...prev]);
    }
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
      <div className={`min-h-full bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-slate-950 flex flex-col justify-between p-4 lg:p-8 transition-colors duration-100 ${shake ? 'animate-shake bg-red-950' : ''}`}>
        
        {/* Tutorial Modal */}
        {showTutorial && (
          <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="max-w-md w-full bg-slate-900 border-2 border-cyan-500 p-6 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.5)] animate-in zoom-in-95 duration-500">
              <h2 className="text-2xl font-black text-cyan-400 mb-4">Tutorial: The Arena</h2>
              <ul className="space-y-3 text-slate-300 mb-6">
                <li><strong className="text-cyan-300">1. Resonating:</strong> Drag a card from your hand to the Resonance Row (the blue dropzone) to use it as a Node. Nodes generate Energy each turn.</li>
                <li><strong className="text-cyan-300">2. Deploying:</strong> Drag a card to the Battlefield to summon an Entity. It costs Energy equal to the top right number.</li>
                <li><strong className="text-cyan-300">3. Attacking:</strong> Entities have "summoning sickness" the turn they are played. Next turn, you can drag them to attack the Enemy Vanguard (their Nexus HP) or their Entities!</li>
              </ul>
              <button onClick={() => setShowTutorial(false)} className="w-full py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors">Start Duel</button>
            </div>
          </div>
        )}
        
        {/* Opponent Area (Top) */}
        <div className="flex flex-col gap-4">
          {/* Opponent Info & Hand */}
          <DropZone id="opponent_vanguard" title="">
            <div className={`flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border ${activeId && battlefield.find(c=>c.id===activeId) ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-red-900/30'} shadow-[0_0_30px_rgba(220,38,38,0.05)] transition-all w-full`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-950 border border-red-800 rounded-lg flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-red-400 text-lg">Enemy Vanguard</h3>
                  <p className="text-sm text-slate-400 font-mono">{opponentHp} Nexus HP</p>
                </div>
              </div>
              
              <div className="flex gap-[-40px]">
              {Array.from({ length: opponentHandCount }).map((_, i) => (
                <div key={i} className="w-24 h-[134px] rounded-lg -ml-12 shadow-[0_0_15px_rgba(0,0,0,0.8)] border-2 border-slate-700 relative overflow-hidden transform hover:-translate-y-2 transition-transform z-10 hover:z-20">
                  <img src="/baked_cardback.png" className="absolute inset-0 w-full h-full object-cover" alt="Cardback" />
                </div>
              ))}
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
              {isPlayerTurn ? 'PASS TURN' : 'OPPONENT TURN'}
            </button>
            <div className="text-xs text-cyan-500 font-mono font-bold bg-slate-900 px-3 py-1 rounded border border-cyan-900/50">
              TURN {turn}
            </div>
          </div>

          <div className="h-[2px] bg-gradient-to-r from-cyan-500 via-cyan-500 to-transparent flex-1"></div>
        </div>

        {/* Player Area (Bottom) */}
        <div className="flex flex-col gap-4">
          {/* Player Battlefield */}
          <DropZone id="battlefield" title="Your Battlefield">
            {battlefield.map(c => (
              <div key={c.id} className="animate-in slide-in-from-bottom-8 fade-in zoom-in-75 duration-500">
                <Card {...c} />
              </div>
            ))}
          </DropZone>

          {/* Player Resonance Row */}
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

          {/* Player Info & Hand */}
          <div className="flex flex-col xl:flex-row justify-between items-end mt-4 gap-6">
            <div className="flex flex-col gap-2 shrink-0 w-64">
              <div className="flex items-center gap-4 bg-slate-900/80 p-4 rounded-xl border border-cyan-900/50 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
                <div className="w-14 h-14 bg-cyan-950 border border-cyan-500 rounded-lg flex items-center justify-center text-cyan-400 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
                  <User className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="font-bold text-cyan-400 text-xl">You</h3>
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
              <div className="h-24 bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-y-auto mt-2">
                <h4 className="text-[10px] text-slate-500 uppercase font-bold tracking-widest mb-1 border-b border-slate-800 pb-1">Combat Log</h4>
                <div className="flex flex-col gap-1">
                  {turnLog.map((log, i) => (
                    <span key={i} className={`text-xs ${i === 0 ? 'text-cyan-300' : 'text-slate-600'}`}>{log}</span>
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
              {hand.length === 0 && deckIndex >= 4 && <span className="text-slate-600 m-auto font-bold tracking-widest">HAND IS EMPTY</span>}
              <button 
                onClick={drawCard}
                disabled={deckIndex >= 4 || hasDrawnThisTurn || !isPlayerTurn}
                className={`ml-8 w-24 h-[134px] bg-slate-800 rounded-lg border-2 border-slate-700 flex flex-col items-center justify-center text-slate-400 hover:border-cyan-500 hover:text-cyan-400 transition-colors shadow-[0_0_15px_rgba(0,0,0,0.8)] cursor-pointer group shrink-0 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                <img src="/baked_cardback.png" className="absolute inset-0 w-full h-full object-cover group-hover:opacity-70 transition-opacity" alt="Deck" />
                <div className="relative z-10 flex flex-col items-center bg-black/60 w-full py-2">
                  <div className="font-black tracking-widest text-sm mb-1 text-white">DECK</div>
                  <div className="text-[10px] text-cyan-300 font-bold">{4 - deckIndex} CARDS LEFT</div>
                </div>
              </button>
            </div>
          </div>
        </div>

      </div>

      <DragOverlay dropAnimation={null}>
        {activeId ? (
          <div className="animate-in zoom-in-105 duration-200 shadow-[0_0_50px_rgba(6,182,212,0.8)] rounded-xl">
            <Card {...(hand.find(c => c.id === activeId) || battlefield.find(c => c.id === activeId) || hand[0])!} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
