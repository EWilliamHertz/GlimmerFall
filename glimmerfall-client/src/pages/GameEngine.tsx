import { useState } from 'react'
import { DndContext, type DragEndEvent } from '@dnd-kit/core'
import { useWebSocket } from '../WebSocketContext'
import { DropZone } from '../components/DropZone'
import { Card } from '../components/Card'

function App() {
  const { gameState, sendIntent } = useWebSocket()
  
  // Local state for demo purposes until backend is fully connected
  const [hand, setHand] = useState([
    { id: 'c1', name: 'Neon Blademaster', cost: 3, power: 4, health: 3 },
    { id: 'c2', name: 'Cyber-Priest', cost: 2, power: 1, health: 4 }
  ])
  const [battlefield, setBattlefield] = useState<any[]>([])
  const [resonanceRow, setResonanceRow] = useState<any[]>([])

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (!over) return

    const card = hand.find(c => c.id === active.id)
    if (!card) return

    if (over.id === 'battlefield') {
      sendIntent('PLAY_CARD', { cardId: active.id, zone: 'battlefield' })
      setHand(hand.filter(c => c.id !== active.id))
      setBattlefield([...battlefield, card])
    } else if (over.id === 'resonance') {
      sendIntent('PLAY_GLIMMER_NODE', { cardId: active.id })
      setHand(hand.filter(c => c.id !== active.id))
      setResonanceRow([...resonanceRow, card])
    }
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-slate-950 text-white p-8 font-sans selection:bg-cyan-900">
        <header className="mb-8 border-b border-cyan-900 pb-4 flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-600">
              GLIMMERFALL
            </h1>
            <p className="text-cyan-600 text-sm font-mono mt-1">TCG ENGINE PROTOCOL v0.1</p>
          </div>
          
          <div className="font-mono text-sm">
            Status: <span className={gameState ? "text-green-400" : "text-yellow-500"}>
              {gameState ? "CONNECTED" : "WAITING FOR BACKEND"}
            </span>
          </div>
        </header>

        <main className="max-w-5xl mx-auto space-y-6">
          <DropZone id="battlefield" title="Battlefield">
            {battlefield.map(c => (
              <Card key={c.id} {...c} />
            ))}
          </DropZone>

          <DropZone id="resonance" title="Resonance Row (Glimmer Nodes)">
            {resonanceRow.map(c => (
              <Card key={c.id} {...c} name="GLIMMER NODE" power={0} health={0} />
            ))}
          </DropZone>
          
          <div className="pt-12">
            <h2 className="text-slate-500 font-bold mb-4">YOUR HAND</h2>
            <div className="flex gap-4 p-6 bg-slate-900/40 rounded-xl min-h-[220px]">
              {hand.map(c => (
                <Card key={c.id} {...c} />
              ))}
            </div>
          </div>
        </main>
      </div>
    </DndContext>
  )
}

export default App
