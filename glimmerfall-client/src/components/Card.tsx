import React from 'react';
import { useDraggable } from '@dnd-kit/core';

interface CardProps {
  id: string;
  name: string;
  cost: number;
  power: number;
  health: number;
}

export const Card: React.FC<CardProps> = ({ id, name, cost, power, health }) => {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: id,
    data: { name, cost, power, health }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="w-32 h-44 bg-slate-800 border-2 border-cyan-500 rounded-lg p-2 text-white flex flex-col justify-between shadow-[0_0_15px_rgba(6,182,212,0.5)] cursor-grab active:cursor-grabbing"
    >
      <div className="flex justify-between items-start">
        <span className="text-xs font-bold truncate max-w-[80%]">{name}</span>
        <span className="bg-cyan-600 rounded-full w-5 h-5 flex items-center justify-center text-xs">{cost}</span>
      </div>
      
      <div className="flex justify-between mt-auto">
        <span className="bg-red-900 px-1 rounded text-xs">{power}</span>
        <span className="bg-green-900 px-1 rounded text-xs">{health}</span>
      </div>
    </div>
  );
};
