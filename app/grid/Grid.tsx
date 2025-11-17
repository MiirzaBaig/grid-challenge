/**
 * Grid Component
 * Main grid container that renders all boxes and handles grid dimensions
 * Uses ResizeObserver to dynamically calculate grid cell sizes
 */

'use client';

import React, { useRef } from 'react';
import GridBox from './GridBox';
import { Box, GridMath } from './types';
import { useGridMath, GRID_COLUMNS } from './useGridMath';

interface GridProps {
  boxes: Box[];
  selectedIds: Set<string>;
  onSelect: (id: string, multiSelect: boolean) => void;
  onDeselect: () => void;
  onDragStop: (id: string, x: number, y: number) => void;
  onResizeStop: (id: string, x: number, y: number, width: number, height: number) => void;
}

export default function Grid({
  boxes,
  selectedIds,
  onSelect,
  onDeselect,
  onDragStop,
  onResizeStop,
}: GridProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate grid dimensions dynamically
  const gridMath = useGridMath(containerRef);

  // Calculate required height based on boxes
  const maxRow = Math.max(...boxes.map(b => b.row + b.rowSpan - 1), 10);
  const gridHeight = maxRow * (gridMath.rowHeight + gridMath.gap) - gridMath.gap;

  return (
    <div className="w-full h-full overflow-auto bg-gray-950 p-8">
      <div
        ref={containerRef}
        className="relative mx-auto bg-gray-900 rounded-2xl shadow-2xl border border-gray-800"
        style={{
          width: '100%',
          maxWidth: '1200px',
          height: `${gridHeight}px`,
          minHeight: '600px',
          // Grid lines background - updates dynamically with cell size
          backgroundImage: `
            linear-gradient(to right, rgba(75, 85, 99, 0.3) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(75, 85, 99, 0.3) 1px, transparent 1px)
          `,
          backgroundSize: `${gridMath.cellWidth + gridMath.gap}px ${gridMath.rowHeight + gridMath.gap}px`,
        }}
        onClick={onDeselect} // Click outside boxes to deselect
      >
        {/* Render all boxes */}
        {boxes.map(box => (
          <GridBox
            key={box.id}
            box={box}
            isSelected={selectedIds.has(box.id)}
            gridMath={gridMath}
            onSelect={onSelect}
            onDragStop={onDragStop}
            onResizeStop={onResizeStop}
          />
        ))}
      </div>
    </div>
  );
}
