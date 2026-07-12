import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CardTemplate } from './CardTemplate';

interface CardProps {
  id: string;
  name: string;
  cost: number;
  power?: number;
  health?: number;
  rarity?: string;
  card_type?: string;
  description?: string;
}

export const Card: React.FC<CardProps> = ({ 
  id, name, cost, power = 1, health = 1, 
  rarity = 'Common', card_type = 'Entity', description = 'Simulated resonance data.' 
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: id,
    data: { name, cost, power, health }
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0) scale(${isDragging ? 1.05 : 1})`,
    zIndex: isDragging ? 100 : 'auto',
  } : undefined;

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (isDragging) return;
    const rect = e.currentTarget.getBoundingClientRect();
    window.dispatchEvent(new CustomEvent('card-hover-in', { 
      detail: { 
        card: { name, cost, power, health, rarity, card_type, description }, 
        x: rect.right + 20, 
        y: rect.top 
      } 
    }));
  };

  const handleMouseLeave = () => {
    window.dispatchEvent(new Event('card-hover-out'));
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-32 md:w-40 shrink-0 cursor-grab active:cursor-grabbing ${isDragging ? 'shadow-[0_0_40px_rgba(6,182,212,0.6)] rounded-xl' : ''}`}
    >
      <div className="pointer-events-none w-full h-full">
        <CardTemplate card={{ name, cost, power, health, rarity, card_type, description }} minimal={true} />
      </div>
    </div>
  );
};

