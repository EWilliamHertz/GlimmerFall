import React, { useState, useRef } from 'react';

interface CardProps {
  name: string;
  card_type: string;
  cost: number;
  power?: number;
  health?: number;
  description: string;
  rarity: string;
  set_name?: string;
  collector_number?: number;
}

export const CardTemplate: React.FC<{ card: CardProps; minimal?: boolean }> = ({ card, minimal }) => {
  const [transform, setTransform] = useState('');
  const [sheen, setSheen] = useState('');
  const cardRef = useRef<HTMLDivElement>(null);

  const rarityConfig = {
    'Common': { border: 'border-slate-500 shadow-slate-900', color: '#94a3b8' },
    'Uncommon': { border: 'border-sky-400 shadow-sky-900/50', color: '#38bdf8' },
    'Rare': { border: 'border-purple-500 shadow-purple-900/50', color: '#a855f7' },
    'Mythic': { border: 'border-yellow-500 shadow-yellow-900/50', color: '#eab308' },
    'Founders Foil': { border: 'border-pink-500 shadow-pink-900/50', color: '#ec4899' }
  };

  const config = rarityConfig[card.rarity as keyof typeof rarityConfig] || rarityConfig['Common'];

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate 3D tilt
    const rotateX = ((y - centerY) / centerY) * -15; // Max 15 degree tilt
    const rotateY = ((x - centerX) / centerX) * 15;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`);
    
    // Dynamic Holographic Foil Sheen
    if (card.rarity === 'Mythic' || card.rarity === 'Founders Foil') {
      const percentageX = (x / rect.width) * 100;
      const percentageY = (y / rect.height) * 100;
      setSheen(`
        radial-gradient(
          circle at ${percentageX}% ${percentageY}%, 
          rgba(255, 255, 255, 0.9) 0%, 
          rgba(255, 100, 255, 0.5) 20%, 
          rgba(100, 255, 255, 0.5) 40%, 
          rgba(255, 255, 100, 0.3) 60%, 
          transparent 80%
        )
      `);
    } else if (card.rarity === 'Rare' || card.rarity === 'Uncommon') {
      // Standard glossy glare for lower rarities
      setSheen(`radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.4) 0%, transparent 60%)`);
    }
  };

  const handleMouseLeave = () => {
    setTransform('');
    setSheen('');
    window.dispatchEvent(new CustomEvent('card-hover-out'));
  };

  // HD Inline SVG Diamond Icon for Rarity
  const RarityIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" style={{ filter: `drop-shadow(0 0 6px ${config.color})` }}>
      <defs>
        <linearGradient id={`grad-${card.name.replace(/ /g, '')}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor={config.color} />
          <stop offset="100%" stopColor="#000000" />
        </linearGradient>
      </defs>
      <path d="M12 1L23 12L12 23L1 12Z" fill={`url(#grad-${card.name.replace(/ /g, '')})`} stroke="rgba(255,255,255,0.7)" strokeWidth="1.5"/>
      <path d="M12 1L12 23M1 12L23 12" stroke="rgba(255,255,255,0.4)" strokeWidth="1"/>
      <circle cx="12" cy="12" r="3" fill="#ffffff" opacity="0.4" />
    </svg>
  );

  return (
    <div 
      ref={cardRef}
      className={`relative w-full aspect-[2.5/3.5] rounded-xl print:rounded-none overflow-hidden border-2 print:border-none ${config.border} shadow-xl print:shadow-none flex flex-col justify-end group bg-black cursor-pointer`}
      style={{ 
        transform, 
        transition: transform ? 'none' : 'transform 0.5s cubic-bezier(0.25, 1, 0.5, 1)',
        zIndex: transform ? 50 : 'auto' 
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={(e) => window.dispatchEvent(new CustomEvent('card-hover-in', { detail: { card, x: e.clientX, y: e.clientY } }))}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Dynamic Glare/Foil Overlay */}
      <div 
        className="absolute inset-0 z-[60] pointer-events-none mix-blend-color-dodge opacity-80"
        style={{ background: sheen, transition: transform ? 'none' : 'background 0.5s ease' }}
      ></div>
      
      {/* Background Full Art Image */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`https://res.cloudinary.com/dfyh7cs1g/image/upload/v8/glimmerfall/card_renders/${card.name.toLowerCase().replace(/[,']/g, '').replace(/ /g, '_')}.png`}
          alt={card.name} 
          className="w-full h-full object-cover object-center"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://www.transparenttextures.com/patterns/black-scales.png';
            (e.target as HTMLImageElement).className = 'w-full h-full object-cover bg-slate-900 opacity-50';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
      </div>

      {/* Card Header (Cost & Name) */}
      <div className={`absolute top-0 left-0 right-0 ${minimal ? 'p-1.5' : 'p-3'} flex justify-between items-start z-10 pointer-events-none gap-1`}>
        <div className={`bg-black/60 backdrop-blur-md ${minimal ? 'px-1.5 py-0.5' : 'px-3 py-1'} rounded-br-lg rounded-tl-sm border-b border-r border-white/20 shadow-lg print:shadow-none max-w-[85%]`}>
          <h3 className={`font-black text-white tracking-wide truncate ${minimal ? 'text-[9px]' : 'text-sm'}`} title={card.name}>{card.name}</h3>
        </div>
        <div className={`${minimal ? 'w-6 h-6 text-xs' : 'w-8 h-8 text-base'} shrink-0 rounded-full bg-cyan-900/80 backdrop-blur-md border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.5)]`}>
          <span className="font-black text-white">{card.cost}</span>
        </div>
      </div>

      {/* Card Footer (Type, Description, Stats) */}
      <div className={`relative z-10 ${minimal ? 'p-1.5 mx-1 mb-2' : 'p-3 mx-2 mb-4'} bg-slate-950/70 backdrop-blur-xl border border-slate-400/30 rounded-lg flex flex-col pointer-events-none shadow-inner print:shadow-none`}>
        <div className={`flex justify-between items-center mb-1 ${minimal ? 'pb-0.5' : 'pb-1'} border-b border-slate-400/20`}>
          <span className={`${minimal ? 'text-[8px]' : 'text-[10px]'} font-bold text-cyan-100 uppercase tracking-widest drop-shadow-md`}>{card.card_type}</span>
          <RarityIcon />
        </div>
        
        <div className="flex-grow relative h-full">
          {card.power != null && card.health != null && (
             <div style={{ float: 'right', width: minimal ? '35px' : '65px', height: minimal ? '20px' : '40px', shapeOutside: 'inset(0)' }}></div>
          )}
          <div className={`${minimal ? 'text-[8px] leading-tight line-clamp-4' : (card.description && card.description.length > 100 ? 'text-[10px] leading-tight line-clamp-[6]' : 'text-xs leading-snug line-clamp-[6]')} text-slate-200 italic drop-shadow-md`}>
            {card.description ? (
              card.description.includes(' — ') ? (
                <>
                  <span className={`font-bold not-italic block ${minimal ? 'mb-0.5' : 'mb-1'} text-cyan-200`}>
                    {card.description.split(' — ')[0]}
                  </span>
                  <span>{card.description.split(' — ').slice(1).join(' — ')}</span>
                </>
              ) : (
                card.description
              )
            ) : null}
          </div>
        </div>

        {/* Collector Info */}
        <div className={`mt-2 flex flex-col justify-start items-start border-t border-white/5 pt-1 ${minimal ? 'pr-8' : 'pr-14'}`}>
          <span className={`${minimal ? 'text-[6px]' : 'text-[8px]'} text-slate-500 uppercase tracking-widest font-semibold leading-none mb-0.5`}>
            {card.set_name || 'The Awakening'}
          </span>
          <span className={`${minimal ? 'text-[5px]' : 'text-[7px]'} text-slate-400 font-bold tracking-wider leading-none`}>
            {card.collector_number ? card.collector_number.toString().padStart(3, '0') : ''}
          </span>
        </div>

        {(card.power != null && card.health != null) && (
          <div className={`absolute ${minimal ? '-bottom-1.5 -right-1 px-2 py-0.5 border' : '-bottom-3 -right-2 px-3 py-1 border-2'} bg-slate-900 border-slate-600 rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.8)] print:shadow-none`}>
            <span className={`font-black text-white ${minimal ? 'text-[10px]' : 'text-sm'}`}>{card.power} / {card.health}</span>
          </div>
        )}
      </div>
    </div>
  );
};
