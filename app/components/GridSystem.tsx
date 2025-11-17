'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import GridBox, { Box } from './GridBox';
import { GridPosition, BoxPosition, doGridPositionsOverlap, GRID_COLUMNS, CELL_SIZE } from '../lib/gridUtils';

interface GridSystemProps {
  boxes: Box[];
  selectedBoxIds: Set<string>;
  onBoxSelect: (id: string, multiSelect: boolean) => void;
  onBoxDeselect: () => void;
  onBoxUpdate: (id: string, gridPosition: GridPosition, absolutePosition?: BoxPosition) => void;
  onBoxDelete: (id: string) => void;
}

export default function GridSystem({
  boxes,
  selectedBoxIds,
  onBoxSelect,
  onBoxDeselect,
  onBoxUpdate,
  onBoxDelete,
}: GridSystemProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [maxRows, setMaxRows] = useState(10);

  // Calculate maximum rows needed based on boxes
  useEffect(() => {
    const maxRow = Math.max(
      ...boxes.map((box) => box.gridPosition.rowEnd),
      10
    );
    setMaxRows(Math.max(maxRow + 2, 10));
  }, [boxes]);

  // Handle click outside to deselect
  const handleGridClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onBoxDeselect();
    }
  };

  // Check for collisions when updating box position
  const checkCollision = useCallback(
    (boxId: string, newGridPos: GridPosition): boolean => {
      return boxes.some(
        (box) =>
          box.id !== boxId &&
          !selectedBoxIds.has(box.id) &&
          doGridPositionsOverlap(box.gridPosition, newGridPos)
      );
    },
    [boxes, selectedBoxIds]
  );

  // Handle box update with collision detection
  const handleBoxUpdate = useCallback(
    (id: string, gridPosition: GridPosition, absolutePosition?: BoxPosition) => {
      // Only check collision when snapping to grid (no absolute position)
      if (!absolutePosition && checkCollision(id, gridPosition)) {
        // Find a non-overlapping position
        let attempts = 0;
        let newPos = { ...gridPosition };
        
        while (checkCollision(id, newPos) && attempts < 100) {
          newPos.rowStart += 1;
          newPos.rowEnd += 1;
          attempts++;
        }
        
        if (attempts < 100) {
          onBoxUpdate(id, newPos, absolutePosition);
        } else {
          // Couldn't find a position, keep current
          const currentBox = boxes.find((b) => b.id === id);
          if (currentBox) {
            onBoxUpdate(id, currentBox.gridPosition, absolutePosition);
          }
        }
      } else {
        onBoxUpdate(id, gridPosition, absolutePosition);
      }
    },
    [checkCollision, boxes, onBoxUpdate]
  );

  return (
    <div
      ref={gridRef}
      className="relative w-full h-full overflow-auto bg-transparent"
      style={{
        scrollBehavior: 'smooth',
        WebkitOverflowScrolling: 'touch',
      }}
      onClick={handleGridClick}
    >
      <div className="p-6">
        {/* Grid Container with relative positioning for absolute boxes */}
        <div className="relative mx-auto" style={{ width: `${GRID_COLUMNS * CELL_SIZE}px` }}>
          {/* Grid Container */}
          <div
            className="relative bg-white/60 dark:bg-gray-800/60 backdrop-blur-md rounded-3xl shadow-2xl border border-indigo-200/30 dark:border-indigo-500/20 overflow-hidden"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${GRID_COLUMNS}, ${CELL_SIZE}px)`,
              gridAutoRows: `${CELL_SIZE}px`,
              gap: '0',
              width: `${GRID_COLUMNS * CELL_SIZE}px`,
              minHeight: `${maxRows * CELL_SIZE}px`,
              padding: '0px',
            }}
          >
            {/* Grid Lines Overlay */}
            <div
              className="absolute inset-0 pointer-events-none z-0"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(99, 102, 241, 0.15) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(99, 102, 241, 0.15) 1px, transparent 1px)
                `,
                backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
                width: `${GRID_COLUMNS * CELL_SIZE}px`,
                height: `${maxRows * CELL_SIZE}px`,
              }}
            />

            {/* Render unselected boxes (in grid) */}
            {boxes
              .filter((box) => !box.isSelected || !box.absolutePosition)
              .map((box) => {
                const isSelected = selectedBoxIds.has(box.id);
                const boxWithSelection = { ...box, isSelected };
                
                return (
                  <div
                    key={box.id}
                    className="contents"
                    style={{
                      gridColumn: `${box.gridPosition.colStart} / ${box.gridPosition.colEnd}`,
                      gridRow: `${box.gridPosition.rowStart} / ${box.gridPosition.rowEnd}`,
                    }}
                  >
                    <GridBox
                      box={boxWithSelection}
                      onSelect={onBoxSelect}
                      onDeselect={onBoxDeselect}
                      onUpdate={handleBoxUpdate}
                      onDelete={onBoxDelete}
                    />
                  </div>
                );
              })}
          </div>

          {/* Render selected boxes with absolute positioning (relative to grid container wrapper) */}
          {boxes
            .filter((box) => box.isSelected && box.absolutePosition)
            .map((box) => {
              const boxWithSelection = { ...box, isSelected: true };
              
              return (
                <GridBox
                  key={box.id}
                  box={boxWithSelection}
                  onSelect={onBoxSelect}
                  onDeselect={onBoxDeselect}
                  onUpdate={handleBoxUpdate}
                  onDelete={onBoxDelete}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
}

