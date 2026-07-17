import { useState, useEffect, useRef } from 'react'
import { DndContext, type DragEndEvent, type DragStartEvent, DragOverlay, useDroppable } from '@dnd-kit/core'
import { DropZone } from '../components/DropZone'
import { Card } from '../components/Card'
import { CardTemplate } from '../components/CardTemplate'
import { User, ShieldAlert, Zap, Loader2, Swords, Book } from 'lucide-react'
import { Link } from 'react-router-dom'
import { STARTER_DECK_KEYS } from '../constants/starterDecks';
import { playSound } from '../utils/sounds';

// Helper to generate unique ids
const generateId = (prefix: string) => `${prefix}_${Math.random().toString(36).substr(2, 9)}`;

// Custom dropzone for targeting opponent entities
function EntityDropZone({ id, children }: { id: string, children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div ref={setNodeRef} className={`relative rounded-xl transition-all ${isOver ? 'ring-4 ring-red-500 scale-105 shadow-[0_0_30px_rgba(239,68,68,0.8)] z-10' : ''}`}>
      {children}
    </div>
  );
}

const isSpell = (card: any) => card?.card_type === 'Hex' || card?.card_type === 'Flash' || card?.card_type === 'Relic';
const isRelic = (card: any) => card?.card_type === 'Relic' || card?.card_type === 'Artifact';

// A spell "requires a target" if its text talks about an entity/creature —
// otherwise it can be cast by dropping it on your own battlefield with no target.
const spellRequiresEntityTarget = (card: any) => {
  const desc = card.description || '';
  return /target (entity|creature)|enemy (entity|creature)|an ally|allied (entity|creature)/i.test(desc);
}

export default function GameEngine() {
  const [username, setUsername] = useState(() => {
    let u = localStorage.getItem('glimmerfall_user');
    if (!u) {
      u = `Player_${Math.floor(Math.random()*10000)}`;
    }
    return u;
  });
  
  const [lobbyCode, setLobbyCode] = useState('');
  const [matchId, setMatchId] = useState<number | null>(null);
  const [playerNum, setPlayerNum] = useState<number>(1);
  const [matchStatus, setMatchStatus] = useState<string>('IDLE');
  const [isSearching, setIsSearching] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Deck Selection
  const [userDecks, setUserDecks] = useState<any[]>([]);
  const [activeDeckName, setActiveDeckName] = useState<string>(localStorage.getItem('glimmerfall_active_deck') || "Nature's Wrath");

  // Sync State
  const [turn, setTurn] = useState(1);
  const [activePlayer, setActivePlayer] = useState<string>('');
  const [playerHp, setPlayerHp] = useState(20);
  const [opponentHp, setOpponentHp] = useState(20);
  const [turnLog, setTurnLog] = useState<string[]>([]);
  const [fullDeck, setFullDeck] = useState<any[]>([]);
  
  const [opponentHandSize, setOpponentHandSize] = useState(5);
  const [hand, setHand] = useState<any[]>([]);
  const [deckIndex, setDeckIndex] = useState(0);

  const [battlefield, setBattlefield] = useState<any[]>([]);
  const [resonanceRow, setResonanceRow] = useState<any[]>([]);
  
  const [opponentBattlefield, setOpponentBattlefield] = useState<any[]>([]);
  const [opponentResonance, setOpponentResonance] = useState<any[]>([]);
  const [voidZone, setVoidZone] = useState<any[]>([]);
  const [opponentVoidZone, setOpponentVoidZone] = useState<any[]>([]);
  const [viewingVoid, setViewingVoid] = useState<{type: string, cards: any[]} | null>(null);

  const [energy, setEnergy] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [hasDrawnThisTurn, setHasDrawnThisTurn] = useState(false);
  const [hasResonatedThisTurn, setHasResonatedThisTurn] = useState(false);
  const [attackedThisTurn, setAttackedThisTurn] = useState<string[]>([]);

  const [mulliganCount, setMulliganCount] = useState(0);
  const [hasKeptHand, setHasKeptHand] = useState(false);
  const [scryingCard, setScryingCard] = useState<any>(null);

  const isPlayerTurn = matchStatus === 'PLAYING' && activePlayer === username;

  // Load User Decks for Lobby
  useEffect(() => {
    if (matchStatus === 'IDLE' && username && username.trim() !== '') {
      fetch(`/api/decks?username=${encodeURIComponent(username)}`)
        .then(res => res.json())
        .then(data => {
          if (data.decks) setUserDecks(data.decks);
        }).catch(err => console.error(err));
    }
  }, [matchStatus, username]);

  // Load Active Deck into Game
  useEffect(() => {
    if (activeDeckName && (matchStatus === 'PLAYING' || matchStatus === 'MULLIGAN') && fullDeck.length === 0) {
      Promise.all([
        fetch(`/api/decks?username=${encodeURIComponent(username)}`).then(r => r.json()),
        fetch('/api/cards').then(r => r.json()),
        fetch('/api/starter-decks').then(r => r.json())
      ]).then(([decksData, cardsData, starterData]) => {
        const allCards = cardsData.cards || cardsData || [];
        
        let targetDeck = (decksData.decks || []).find((d: any) => d.deck_name === activeDeckName);
        
        // Handle starter decks (from Neon) if no user-saved deck found
        let deckArray: any[] = [];
        if (targetDeck) {
          targetDeck.cards.forEach((c: any) => {
            const cardObj = allCards.find((dbCard: any) => dbCard.name === c.card_name);
            if (cardObj) {
              for (let i=0; i<c.count; i++) deckArray.push({ ...cardObj, id: generateId('d') });
            }
          });
        } else if (STARTER_DECK_KEYS[activeDeckName]) {
            const starterKey = STARTER_DECK_KEYS[activeDeckName];
            const starterDeck = (starterData.starter_decks || []).find((d: any) => d.deck_key === starterKey);
            (starterDeck?.cards || []).forEach((c: any) => {
              const cardObj = allCards.find((dbCard: any) => dbCard.name === c.card_name);
              if (cardObj) {
                for (let i=0; i<c.count; i++) deckArray.push({ ...cardObj, id: generateId('d') });
              }
            });
        }
        
        if (deckArray.length > 0) {
          deckArray = deckArray.sort(() => Math.random() - 0.5);
          setFullDeck(deckArray);
          setHand(deckArray.slice(0, 5));
          setDeckIndex(5);
        }
      });
    }
  }, [matchStatus]);

  const claimedReturnIds = useRef<Set<string>>(new Set());
  const claimedHintIds = useRef<Set<string>>(new Set());

  const syncStateFromServer = (data: any) => {
    if (data.error) return;
    setMatchStatus(data.status);
    setActivePlayer(data.active_player);
    if (data.current_turn !== undefined) setTurn(data.current_turn);

    const state = data.state || {};
    if (playerNum === 1) {
      setPlayerHp(state.player1_hp);
      setOpponentHp(state.player2_hp);
      setOpponentHandSize(state.player2_hand ?? 5);
    } else {
      setPlayerHp(state.player2_hp);
      setOpponentHp(state.player1_hp);
      setOpponentHandSize(state.player1_hand ?? 5);
    }

    if (state.log) setTurnLog(state.log);

    if (state.battlefield) {
      setBattlefield(state.battlefield.filter((c: any) => c.owner === playerNum));
      setOpponentBattlefield(state.battlefield.filter((c: any) => c.owner !== playerNum));
    }
    if (state.resonanceRow) {
      setResonanceRow(state.resonanceRow.filter((c: any) => c.owner === playerNum));
      setOpponentResonance(state.resonanceRow.filter((c: any) => c.owner !== playerNum));
    }
    if (state.voidZone) {
      setVoidZone(state.voidZone.filter((c: any) => c.owner === playerNum));
      setOpponentVoidZone(state.voidZone.filter((c: any) => c.owner !== playerNum));
    }

    // Claim any cards a spell (e.g. Chrono Shift) has returned to our hand
    if (state.pendingReturns) {
      const mine = state.pendingReturns.filter((r: any) => r.owner === playerNum && !claimedReturnIds.current.has(r.returnId));
      mine.forEach((r: any) => {
        claimedReturnIds.current.add(r.returnId);
        setHand(prev => [...prev, { ...r.card, id: `${r.card.id}_${r.returnId}` }]);
        sendAction('CLAIM_RETURN', { returnId: r.returnId });
      });
    }

    if (state.pendingHints) {
      const myHints = state.pendingHints.filter((h: any) => !claimedHintIds.current.has(h.id));
      myHints.forEach((h: any) => {
        claimedHintIds.current.add(h.id);
        
        let shouldDraw = 0;
        let shouldDiscard = 0;
        
        if (h.sourcePlayer === playerNum && h.draw > 0) shouldDraw += h.draw;
        if (h.sourcePlayer === playerNum && h.discard > 0) shouldDiscard += h.discard;
        if (h.sourcePlayer !== playerNum && h.opponentDiscard > 0) shouldDiscard += h.opponentDiscard;
        
        if (shouldDraw > 0) {
          setDeckIndex(currentIndex => {
            const drawn = fullDeck.slice(currentIndex, currentIndex + shouldDraw);
            setHand(prev => [...prev, ...drawn]);
            return currentIndex + drawn.length;
          });
        }
        if (shouldDiscard > 0) {
          setHand(prev => {
            const toDiscard = prev.slice(0, shouldDiscard);
            if (toDiscard.length > 0) {
              setTurnLog(log => [`Discarded ${toDiscard.map((c: any) => c.name).join(', ')}.`, ...log]);
            }
            return prev.slice(shouldDiscard);
          });
        }
        if (h.sourcePlayer === playerNum && h.putGlimmerNode > 0) {
          setDeckIndex(currentIndex => {
            const nodeCards = fullDeck.slice(currentIndex, currentIndex + h.putGlimmerNode);
            nodeCards.forEach((nc, i) => {
               setTimeout(() => sendAction('PLAY_CARD', { zone: 'resonanceRow', card: { id: nc.id, isFacedownNode: true } }), i * 100);
            });
            return currentIndex + h.putGlimmerNode;
          });
        }
        if (h.sourcePlayer === playerNum && h.returnedCardToHand) {
          setHand(prev => [...prev, { ...h.returnedCardToHand, id: `${h.returnedCardToHand.id}_reclaimed_${Date.now()}` }]);
        }
        if (h.sourcePlayer === playerNum && h.scry > 0) {
          setDeckIndex(currentIndex => {
            const topCard = fullDeck[currentIndex];
            if (topCard) setScryingCard(topCard);
            return currentIndex;
          });
        }
        
        sendAction('CLAIM_HINT', { hintId: h.id });
      });
    }
  };

  // Poll Match State
  useEffect(() => {
    if (!matchId) return;
    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/match?id=${matchId}`);
        const data = await res.json();
        syncStateFromServer(data);
      } catch (err) {
        console.error(err);
      }
    }, 2000);
    return () => clearInterval(interval);
  }, [matchId, playerNum]);

  // Reset energy and attack states on turn start
  useEffect(() => {
    if (isPlayerTurn) {
      setEnergy(resonanceRow.length);
      setHasDrawnThisTurn(false);
      setHasResonatedThisTurn(false);
      setAttackedThisTurn([]);
    }
  }, [activePlayer, isPlayerTurn]);

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUsername(e.target.value);
    localStorage.setItem('glimmerfall_user', e.target.value); // Sync to global username
  }

  const findDuel = async () => {
    setIsSearching(true);
    setErrorMsg('');
    try {
      const res = await fetch('/api/matchmaking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, lobbyCode: lobbyCode || undefined })
      });
      const data = await res.json();
      if (data.error) {
        setErrorMsg(data.error);
        setIsSearching(false);
        return;
      }
      setMatchId(data.matchId);
      setPlayerNum(data.player);
      setMatchStatus(data.status || 'PLAYING');
      if (data.player === 1) {
        setActivePlayer(username); // P1 starts
      }
    } catch (err) {
      console.error(err);
      setIsSearching(false);
    }
  };


  // Send hand size updates to server when it changes
  useEffect(() => {
    if (matchStatus === 'PLAYING') {
      sendAction('UPDATE_HAND_SIZE', { size: hand.length });
    }
  }, [hand.length, matchStatus]);

  const sendAction = async (action: string, payload: any = {}) => {
    try {
      const postRes = await fetch('/api/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ matchId, player: playerNum, action, payload })
      });
      if (!postRes.ok) throw new Error(`Server returned ${postRes.status}`);
      const postData = await postRes.json();
      if (postData.error) {
        setTurnLog(prev => [postData.error, ...prev]);
      }
      // Optimistically fetch state immediately
      const res = await fetch(`/api/match?id=${matchId}`);
      const data = await res.json();
      syncStateFromServer(data);
      return data;
    } catch (err: any) {
      console.error(err);
      setTurnLog(prev => [`Network error: action failed (${err.message}). If stuck, try refreshing.`, ...prev]);
    }
  };

  const entityRequiresDeployTarget = (card: any) => {
    return ['Sunspear Adept', 'Avalanche Herd', 'Skyrail Saboteur'].includes(card.name);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const cardId = event.active.id as string;
    const card = hand.find(c => c.id === cardId) || battlefield.find(c => c.id === cardId);
    if (!isPlayerTurn && card?.card_type !== 'Flash') return;
    setActiveId(cardId);
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveId(null);
    const { active, over } = event;
    if (!over) return;

    const card = hand.find(c => c.id === active.id) || battlefield.find(c => c.id === active.id);
    if (!card) return;
    
    if (!isPlayerTurn && card.card_type !== 'Flash') return;

    // Play from Hand
    if (hand.find(c => c.id === card.id)) {
      if (over.id === 'battlefield') {
        if (isSpell(card)) {
          if (spellRequiresEntityTarget(card)) {
            setTurnLog(prev => [`${card.name} needs a target — drop it on an entity or the enemy Nexus.`, ...prev]);
            return;
          }
          if (energy < card.cost) {
            setTurnLog(prev => [`Not enough energy to cast ${card.name}.`, ...prev]);
            return;
          }
          const handSizeAfterCast = hand.length - 1;
          setHand(hand.filter(c => c.id !== card.id));
          setEnergy(e => e - card.cost);
          await sendAction('CAST_SPELL', { card, targetId: null, casterHandSize: handSizeAfterCast });
          return;
        }
        if (entityRequiresDeployTarget(card)) {
           setTurnLog(prev => [`${card.name} requires a target. Drag it directly onto an entity or the enemy Nexus.`, ...prev]);
           return;
        }
        if (energy >= card.cost) {
          playSound('entity');
          setHand(hand.filter(c => c.id !== card.id));
          setEnergy(e => e - card.cost);
          await sendAction('PLAY_CARD', { zone: 'battlefield', card: { ...card, turnSummoned: turn } });
        } else {
           setTurnLog(prev => [`Not enough energy to play ${card.name}.`, ...prev]);
        }
      } else if (over.id === 'resonance') {
        if (hasResonatedThisTurn) return;
        playSound('node');
        setHand(hand.filter(c => c.id !== card.id));
        setEnergy(e => e + 1);
        setHasResonatedThisTurn(true);
        await sendAction('PLAY_CARD', { zone: 'resonanceRow', card });
      } else if (
        over.id === 'opponent_vanguard' ||
        opponentBattlefield.find(c => c.id === over.id) ||
        battlefield.find(c => c.id === over.id)
      ) {
        if (isSpell(card)) {
          const spellTarget = opponentBattlefield.find(c => c.id === over.id) || battlefield.find(c => c.id === over.id);
          if (spellTarget?.keywords?.stealth && spellTarget.owner !== playerNum) {
            setTurnLog(prev => [`${spellTarget.name} has Stealth and can't be targeted.`, ...prev]);
            return;
          }
          if (energy < card.cost) {
            setTurnLog(prev => [`Not enough energy to cast ${card.name}.`, ...prev]);
            return;
          }
          const handSizeAfterCast = hand.length - 1;
          playSound('spell');
          setHand(hand.filter(c => c.id !== card.id));
          setEnergy(e => e - card.cost);
          await sendAction('CAST_SPELL', { card, targetId: over.id as string, casterHandSize: handSizeAfterCast });
          return;
        } else if (entityRequiresDeployTarget(card)) {
          if (energy < card.cost) {
            setTurnLog(prev => [`Not enough energy to play ${card.name}.`, ...prev]);
            return;
          }
          playSound('entity');
          setHand(hand.filter(c => c.id !== card.id));
          setEnergy(e => e - card.cost);
          await sendAction('PLAY_CARD', { zone: 'battlefield', card: { ...card, turnSummoned: turn }, targetId: over.id as string });
          return;
        }
      }
    } 
    // Attack from Battlefield
    else if (battlefield.find(c => c.id === card.id)) {
      if (!card.power) return;
      if (attackedThisTurn.includes(card.id)) {
         setTurnLog(prev => [`${card.name} has already attacked this turn.`, ...prev]);
         return;
      }

      if (over.id === 'opponent_vanguard') {
        const guardians = opponentBattlefield.filter(c => c.keywords?.guard);
        if (guardians.length > 0 && !card.keywords?.evasive) {
          setTurnLog(prev => [`${card.name} must attack a Guard Entity — the opponent has one in play!`, ...prev]);
          return;
        }
        playSound('attack_nexus');
        setAttackedThisTurn(prev => [...prev, card.id]);
        await sendAction('ATTACK_VANGUARD', { power: card.power, attackerId: card.id });
      } else if (opponentBattlefield.find(c => c.id === over.id)) {
        const target = opponentBattlefield.find(c => c.id === over.id);
        if (isRelic(target)) {
          setTurnLog(prev => [`${target.name} is an Artifact and cannot be attacked.`, ...prev]);
          return;
        }
        if (target?.keywords?.stealth) {
          setTurnLog(prev => [`${target.name} has Stealth and can't be targeted.`, ...prev]);
          return;
        }
        const guardians = opponentBattlefield.filter(c => c.keywords?.guard);
        if (guardians.length > 0 && !target?.keywords?.guard && !card.keywords?.evasive) {
          setTurnLog(prev => [`${card.name} must attack a Guard Entity — the opponent has one in play!`, ...prev]);
          return;
        }
        playSound('attack_entity');
        setAttackedThisTurn(prev => [...prev, card.id]);
        await sendAction('ATTACK_ENTITY', { targetId: over.id, power: card.power, attackerId: card.id });
      }
    }
  }

  const passTurn = async () => {
    await sendAction('END_TURN');
  }

  const drawCard = () => {
    if (hasDrawnThisTurn || !isPlayerTurn) return;
    if (deckIndex < fullDeck.length) {
      setHand(prev => [...prev, fullDeck[deckIndex]]);
      setDeckIndex(d => d + 1);
      setHasDrawnThisTurn(true);
    }
  }

  const handleMulligan = () => {
    const nextCount = mulliganCount + 1;
    setMulliganCount(nextCount);
    const newDeck = [...fullDeck].sort(() => Math.random() - 0.5);
    setFullDeck(newDeck);
    const drawCount = Math.max(0, 5 - nextCount);
    setHand(newDeck.slice(0, drawCount));
    setDeckIndex(drawCount);
  };

  const handleKeepHand = () => {
    setHasKeptHand(true);
    sendAction('READY_MULLIGAN');
  };

  if (matchStatus === 'IDLE' || matchStatus === 'WAITING') {
    return (
      <div className="min-h-full bg-slate-950 flex flex-col items-center justify-center p-8">
        <div className="bg-slate-900 border-2 border-cyan-500 p-8 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.5)] max-w-md w-full text-center">
          <h2 className="text-3xl font-black text-cyan-400 mb-6">PvP Arena</h2>
          
          {matchStatus === 'IDLE' && (
            <div className="flex flex-col gap-4 mb-8 text-left">
              <div>
                <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-1 block">Player Name</label>
                <input 
                  type="text" 
                  value={username} 
                  onChange={handleUsernameChange}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-3 focus:border-cyan-400 outline-none transition-colors"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-1 block">Select Deck</label>
                <select 
                  value={activeDeckName} 
                  onChange={e => { setActiveDeckName(e.target.value); localStorage.setItem('glimmerfall_active_deck', e.target.value); }}
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-3 focus:border-cyan-400 outline-none transition-colors"
                >
                  <option value="Nature's Wrath">Nature's Wrath (Starter)</option>
                  <option value="Cinder Ignition">Cinder Ignition (Starter)</option>
                  <option value="Solar Singularity">Solar Singularity (Tournament)</option>
                  <option value="Gaia's Loop">Gaia's Loop (Tournament)</option>
                  {userDecks.map(d => (
                    <option key={d.deck_name} value={d.deck_name}>{d.deck_name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest mb-1 block">Lobby Code (Optional)</label>
                <input 
                  type="text" 
                  value={lobbyCode} 
                  onChange={e => setLobbyCode(e.target.value)}
                  placeholder="Leave empty for random duel"
                  className="w-full bg-slate-800 border border-slate-700 text-white rounded p-3 focus:border-cyan-400 outline-none transition-colors"
                />
              </div>
              {errorMsg && <p className="text-red-500 text-sm font-bold">{errorMsg}</p>}
            </div>
          )}
          
          {matchStatus === 'WAITING' ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="w-12 h-12 text-cyan-500 animate-spin" />
              <p className="text-cyan-300 font-bold tracking-widest animate-pulse">SEARCHING FOR OPPONENT...</p>
              {lobbyCode && <p className="text-slate-500 text-sm mt-2">Waiting in Lobby: {lobbyCode}</p>}
            </div>
          ) : (
            <div className="flex flex-col gap-4 w-full">
              <button 
                onClick={findDuel}
                disabled={isSearching}
                className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-xl rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] hover:scale-105 flex items-center justify-center gap-3"
              >
                <Swords className="w-6 h-6" />
                {lobbyCode ? 'JOIN / CREATE LOBBY' : 'FIND DUEL'}
              </button>

              <Link to="/tutorial" className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold tracking-widest text-sm rounded-xl transition-all border border-slate-700 hover:border-slate-500 flex items-center justify-center gap-2">
                <Book className="w-4 h-4" />
                PLAY OFFLINE TUTORIAL
              </Link>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (matchStatus.includes('WINS')) {
    return (
      <div className="min-h-full bg-slate-950 flex items-center justify-center p-8">
        <div className="bg-slate-900 border-2 border-yellow-500 p-12 rounded-2xl shadow-[0_0_100px_rgba(234,179,8,0.5)] text-center">
          <h1 className="text-6xl font-black text-yellow-400 mb-4">{matchStatus}</h1>
          <button onClick={() => window.location.reload()} className="mt-8 px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold tracking-widest border border-slate-600">PLAY AGAIN</button>
        </div>
      </div>
    );
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      {matchStatus === 'MULLIGAN' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8">
          <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-8 max-w-4xl w-full text-center">
            <h2 className="text-4xl font-black text-cyan-400 mb-2">Mulligan Phase</h2>
            {hasKeptHand ? (
              <p className="text-slate-400 mb-8 text-lg">Waiting for opponent...</p>
            ) : (
              <>
                <p className="text-slate-400 mb-8 text-lg">
                  {mulliganCount > 0 ? `You have mulliganed ${mulliganCount} time(s) and drawn ${Math.max(0, 5 - mulliganCount)} cards.` : 'Review your opening hand. You may reshuffle and redraw 1 less card.'}
                </p>
                <div className="flex justify-center gap-4 mb-8 scale-90">
                  {hand.map(c => (
                    <div key={c.id} className="w-32 h-48 flex-shrink-0">
                      <CardTemplate card={c} minimal={true} />
                    </div>
                  ))}
                </div>
                <div className="flex gap-4 justify-center">
                  <button onClick={handleMulligan} className="px-8 py-3 bg-slate-800 text-white rounded-lg hover:bg-slate-700 font-bold tracking-widest border border-slate-600">MULLIGAN</button>
                  <button onClick={handleKeepHand} className="px-8 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 font-bold tracking-widest border border-cyan-400">KEEP HAND</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
      {scryingCard && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center p-8">
          <div className="bg-slate-900 border border-cyan-500 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(6,182,212,0.4)] animate-in fade-in zoom-in">
            <h2 className="text-2xl font-black text-cyan-400 mb-2 uppercase tracking-widest">Scry</h2>
            <p className="text-slate-400 mb-6 font-mono text-sm">Review the top card of your deck.</p>
            <div className="flex justify-center mb-8">
              <div className="scale-125 transform transition-transform">
                <Card {...scryingCard} />
              </div>
            </div>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={() => {
                  setScryingCard(null);
                  setTurnLog(prev => ["You left the card on top of your deck.", ...prev]);
                }} 
                className="px-6 py-3 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 font-bold border border-slate-600 transition-colors tracking-wider text-sm"
              >
                LEAVE ON TOP
              </button>
              
              <button 
                onClick={() => {
                  setFullDeck(d => {
                    const newDeck = [...d];
                    newDeck.push(scryingCard);
                    return newDeck;
                  });
                  setDeckIndex(i => i + 1);
                  setScryingCard(null);
                  setTurnLog(prev => ["You put the card on the bottom of your deck.", ...prev]);
                }} 
                className="px-6 py-3 bg-cyan-600 text-cyan-50 rounded-lg hover:bg-cyan-500 font-bold border border-cyan-400 transition-colors tracking-wider text-sm shadow-[0_0_15px_rgba(6,182,212,0.5)]"
              >
                PUT ON BOTTOM
              </button>
            </div>
          </div>
        </div>
      )}
      <div className={`min-h-full bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] bg-slate-950 flex flex-col justify-between p-4 lg:p-8 transition-colors duration-100`}>
        
        {/* Opponent Area (Top) */}
        <div className="flex flex-col gap-4">
          <DropZone id="opponent_vanguard" title="">
            <div className={`flex justify-between items-center bg-slate-900/50 p-4 rounded-xl border ${activeId && (isSpell(hand.find(c=>c.id===activeId)) || battlefield.find(c=>c.id===activeId)) ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'border-red-900/30'} shadow-[0_0_30px_rgba(220,38,38,0.05)] transition-all w-full`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-950 border border-red-800 rounded-lg flex items-center justify-center text-red-500 shadow-[0_0_15px_rgba(220,38,38,0.2)]">
                  <ShieldAlert className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="font-bold text-red-400 text-lg">Enemy Nexus</h3>
                  <p className="text-sm text-slate-400 font-mono">{opponentHp} Nexus HP</p>
                </div>
              </div>
              <div className="flex gap-4 items-center">
                <div onClick={() => setViewingVoid({ type: 'Enemy', cards: opponentVoidZone })} className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-900 hover:border-cyan-500 transition-colors">
                  <img src="/baked_cardback.png" className="w-6 h-8 rounded object-cover opacity-60 grayscale" />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Void</p>
                    <p className="text-sm text-slate-300 font-mono font-bold">{opponentVoidZone.length}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800">
                  <img src="/baked_cardback.png" className="w-6 h-8 rounded object-cover" />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Hand</p>
                    <p className="text-sm text-slate-300 font-mono font-bold">{opponentHandSize}</p>
                  </div>
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
          <div className="w-full bg-red-900/10 border border-red-900/30 rounded-xl min-h-[180px] p-4 flex gap-4 overflow-x-auto relative z-10">
            {opponentBattlefield.map(c => (
              <EntityDropZone key={c.id} id={c.id}>
                <div className="animate-in slide-in-from-top-8 fade-in zoom-in-75 duration-500 relative cursor-crosshair">
                  <Card {...c} health={c.currentHealth ?? c.health} />
                  {c.exhausted && (
                     <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center border-2 border-red-900 pointer-events-none">
                       <span className="text-red-500 font-black tracking-widest rotate-[-15deg] bg-black/80 px-2 py-1 rounded">EXHAUSTED</span>
                     </div>
                  )}
                </div>
              </EntityDropZone>
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
          <DropZone id="battlefield" title="Your Battlefield">
            {battlefield.map(c => (
              <EntityDropZone key={c.id} id={c.id}>
                <div className="animate-in slide-in-from-bottom-8 fade-in zoom-in-75 duration-500 relative">
                  <Card {...c} health={c.currentHealth ?? c.health} />
                  {(attackedThisTurn.includes(c.id) || c.exhausted) && (
                     <div className="absolute inset-0 bg-black/60 rounded-xl flex items-center justify-center border-2 border-slate-800 pointer-events-none">
                       <span className="text-red-500 font-black tracking-widest rotate-[-15deg] bg-black/80 px-2 py-1 rounded">EXHAUSTED</span>
                     </div>
                  )}
                  </div>
              </EntityDropZone>
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
                <button 
                  onClick={() => {
                    if (window.confirm("Are you sure you want to concede this match?")) {
                      sendAction('SURRENDER');
                    }
                  }} 
                  className="ml-auto text-xs bg-red-950 hover:bg-red-900 text-red-400 font-bold px-3 py-1 rounded border border-red-900 transition-colors"
                >
                  CONCEDE
                </button>
              </div>
              <div className="flex items-center gap-4 bg-slate-900/80 p-3 rounded-xl border border-yellow-600/50">
                <div className="w-10 h-10 bg-yellow-900/50 rounded-full flex items-center justify-center text-yellow-400 border border-yellow-500">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Energy</h3>
                  <p className="text-xl font-black text-yellow-400 font-mono">{energy} / {resonanceRow.length}</p>
                </div>
                <div onClick={() => setViewingVoid({ type: 'Your', cards: voidZone })} className="ml-auto flex items-center gap-2 bg-slate-950/60 px-3 py-2 rounded-lg border border-slate-800 cursor-pointer hover:bg-slate-900 hover:border-cyan-500 transition-colors">
                  <img src="/baked_cardback.png" className="w-6 h-8 rounded object-cover opacity-60 grayscale" />
                  <div className="text-left">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Void</p>
                    <p className="text-sm text-slate-300 font-mono font-bold">{voidZone.length}</p>
                  </div>
                </div>
              </div>

              {/* Combat Log */}
              <div className="h-24 bg-slate-950 rounded-lg border border-slate-800 p-2 overflow-y-auto mt-2">
                <div className="flex flex-col gap-1">
                  {turnLog.map((log, i) => (
                    <span key={i} className={`text-xs ${i === 0 ? 'text-cyan-300' : 'text-slate-600'}`}>{log}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-4 p-6 bg-slate-900/60 rounded-2xl min-h-[240px] border border-slate-800 flex-1 justify-start overflow-x-auto relative shadow-inner">
              <div className="absolute top-2 left-4 text-xs font-bold text-slate-500 tracking-widest uppercase sticky left-0 z-20">Your Hand</div>
              {hand.map(c => (
                <div key={c.id} className="animate-in slide-in-from-bottom-12 fade-in duration-500 flex-shrink-0">
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
                  <div className="text-[9px] text-slate-400 font-bold mt-1">{fullDeck.length - deckIndex} Left</div>
                </div>
              </button>
              <div className="min-w-[1rem] flex-shrink-0"></div>
            </div>
          </div>
        </div>

      </div>

      {viewingVoid && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-8" onClick={() => setViewingVoid(null)}>
          <div className="bg-slate-900 border border-purple-900/50 p-6 rounded-2xl max-w-5xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-purple-900/30">
              <h2 className="text-2xl font-black text-white tracking-widest uppercase">{viewingVoid.type} Void ({viewingVoid.cards.length})</h2>
              <button onClick={() => setViewingVoid(null)} className="text-slate-400 hover:text-white px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg font-bold transition-colors">CLOSE</button>
            </div>
            <div className="flex flex-wrap gap-6 justify-center">
              {viewingVoid.cards.length === 0 && <p className="text-slate-500 italic">The void is empty.</p>}
              {viewingVoid.cards.map((c, i) => (
                <div key={i} className="transform scale-90 -m-4">
                  <Card {...c} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
