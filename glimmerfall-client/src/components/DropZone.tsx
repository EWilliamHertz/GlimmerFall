import React from 'react';
import { useDroppable } from '@dnd-kit/core';

interface DropZoneProps {
  id: string;
  title: string;
  children?: React.ReactNode;
}

export const DropZone: React.FC<DropZoneProps> = ({ id, title, children }) => {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
  });

  return (
    <div 
      ref={setNodeRef} 
      className={`min-h-[200px] p-4 rounded-xl border-2 border-dashed transition-colors flex flex-wrap gap-4
        ${isOver ? 'border-cyan-400 bg-cyan-900/20' : 'border-slate-600 bg-slate-900/50'}`}
    >
      <div className="w-full text-slate-400 text-sm font-bold uppercase tracking-widest mb-2">
        {title}
      </div>
      {children}
    </div>
  );
};
