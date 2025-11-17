'use client';

import React from 'react';

interface ResizeHandleProps {
  position: 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw';
  onResizeStart: (e: React.MouseEvent, position: string) => void;
}

export default function ResizeHandle({ position, onResizeStart }: ResizeHandleProps) {
  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    onResizeStart(e, position);
  };

  const getPositionClasses = () => {
    const baseClasses = 'absolute bg-primary border-2 border-white rounded-full cursor-pointer z-50 hover:scale-110 transition-transform';
    const size = 'w-4 h-4';
    
    const positionClasses: Record<string, string> = {
      n: 'top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize',
      s: 'bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 cursor-ns-resize',
      e: 'right-0 top-1/2 -translate-y-1/2 translate-x-1/2 cursor-ew-resize',
      w: 'left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 cursor-ew-resize',
      ne: 'top-0 right-0 -translate-x-1/2 -translate-y-1/2 cursor-nesw-resize',
      nw: 'top-0 left-0 translate-x-1/2 -translate-y-1/2 cursor-nwse-resize',
      se: 'bottom-0 right-0 -translate-x-1/2 translate-y-1/2 cursor-nwse-resize',
      sw: 'bottom-0 left-0 translate-x-1/2 translate-y-1/2 cursor-nesw-resize',
    };

    return `${baseClasses} ${size} ${positionClasses[position]}`;
  };

  return (
    <div
      className={getPositionClasses()}
      onMouseDown={handleMouseDown}
      role="button"
      aria-label={`Resize handle ${position}`}
    />
  );
}

