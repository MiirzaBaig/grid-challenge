'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Rnd } from 'react-rnd';
import { GridPosition, BoxPosition, pixelToGrid, gridToPixel, constrainToGrid, CELL_SIZE, GRID_COLUMNS } from '../lib/gridUtils';

export interface Box {
  id: string;
  gridPosition: GridPosition;
  absolutePosition?: BoxPosition;
  isSelected: boolean;
}

interface GridBoxProps {
  box: Box;
  onSelect: (id: string, multiSelect: boolean) => void;
  onDeselect: () => void;
  onUpdate: (id: string, gridPosition: GridPosition, absolutePosition?: BoxPosition) => void;
  onDelete: (id: string) => void;
}

export default function GridBox({
  box,
  onSelect,
  onDeselect,
  onUpdate,
  onDelete,
}: GridBoxProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  // Get current position (absolute if selected, grid if not)
  const getCurrentPosition = (): BoxPosition => {
    if (box.isSelected && box.absolutePosition) {
      return box.absolutePosition;
    }
    return gridToPixel(box.gridPosition);
  };

  const currentPos = getCurrentPosition();
  const paddingOffset = 24; // p-6 = 24px
  const gridContainerOffset = 0; // Grid container is now the parent, no extra offset needed

  // Handle click
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (e.shiftKey) {
      onSelect(box.id, true);
    } else {
      onSelect(box.id, false);
    }
  };

  // Handle drag start
  const handleDragStart = () => {
    if (!box.isSelected) return;
    setIsDragging(true);
    
    // Convert grid position to absolute if needed
    if (!box.absolutePosition) {
      const absPos = gridToPixel(box.gridPosition);
      onUpdate(box.id, box.gridPosition, absPos);
    }
  };

  // Handle drag
  const handleDrag = (e: any, d: { x: number; y: number }) => {
    if (!box.isSelected || !box.absolutePosition) return;
    
    const newPosition: BoxPosition = {
      x: d.x - paddingOffset - gridContainerOffset,
      y: d.y - paddingOffset - gridContainerOffset,
      width: box.absolutePosition.width,
      height: box.absolutePosition.height,
    };
    
    onUpdate(box.id, box.gridPosition, newPosition);
  };

  // Handle drag stop - DON'T snap to grid here, keep absolute position while selected
  const handleDragStop = (e: any, d: { x: number; y: number }) => {
    setIsDragging(false);
    if (!box.isSelected || !box.absolutePosition) return;

    // Update absolute position but keep it selected (don't snap to grid yet)
    const newPosition: BoxPosition = {
      x: d.x - paddingOffset - gridContainerOffset,
      y: d.y - paddingOffset - gridContainerOffset,
      width: box.absolutePosition.width,
      height: box.absolutePosition.height,
    };
    
    // Calculate grid position for reference but keep absolute position
    const newGridPos = pixelToGrid(
      d.x - paddingOffset - gridContainerOffset,
      d.y - paddingOffset - gridContainerOffset,
      box.absolutePosition.width,
      box.absolutePosition.height
    );

    // Update with new absolute position and grid position, but keep absolutePosition
    onUpdate(box.id, newGridPos, newPosition);
  };

  // Handle resize start
  const handleResizeStart = () => {
    if (!box.isSelected || !box.absolutePosition) return;
    setIsResizing(true);
  };

  // Handle resize
  const handleResize = (e: any, direction: string, ref: HTMLElement, delta: { width: number; height: number }, position: { x: number; y: number }) => {
    if (!box.isSelected || !box.absolutePosition) return;

    const newWidth = parseInt(ref.style.width);
    const newHeight = parseInt(ref.style.height);

    // Constrain to grid
    const constrained = constrainToGrid(newWidth, newHeight);

    const newPosition: BoxPosition = {
      x: position.x - paddingOffset,
      y: position.y - paddingOffset,
      width: constrained.width,
      height: constrained.height,
    };

    onUpdate(box.id, box.gridPosition, newPosition);
  };

  // Handle resize stop - DON'T snap to grid here, keep absolute position while selected
  const handleResizeStop = (e: any, direction: string, ref: HTMLElement, delta: { width: number; height: number }, position: { x: number; y: number }) => {
    setIsResizing(false);
    if (!box.isSelected || !box.absolutePosition) return;

    const newWidth = parseInt(ref.style.width);
    const newHeight = parseInt(ref.style.height);

    // Constrain to grid
    const constrained = constrainToGrid(newWidth, newHeight);

    const newPosition: BoxPosition = {
      x: position.x - paddingOffset - gridContainerOffset,
      y: position.y - paddingOffset - gridContainerOffset,
      width: constrained.width,
      height: constrained.height,
    };

    // Calculate grid position for reference but keep absolute position
    const newGridPos = pixelToGrid(
      position.x - paddingOffset - gridContainerOffset,
      position.y - paddingOffset - gridContainerOffset,
      constrained.width,
      constrained.height
    );

    // Update with new absolute position and grid position, but keep absolutePosition
    onUpdate(box.id, newGridPos, newPosition);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    if (!box.isSelected) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (document.activeElement?.tagName !== 'INPUT') {
          onDelete(box.id);
        }
      } else if (e.key.startsWith('Arrow')) {
        if (!box.absolutePosition) return;
        
        e.preventDefault();
        const step = e.shiftKey ? CELL_SIZE : CELL_SIZE / 2;
        let newX = box.absolutePosition.x;
        let newY = box.absolutePosition.y;

        switch (e.key) {
          case 'ArrowUp':
            newY = Math.max(0, box.absolutePosition.y - step);
            break;
          case 'ArrowDown':
            newY = box.absolutePosition.y + step;
            break;
          case 'ArrowLeft':
            newX = Math.max(0, box.absolutePosition.x - step);
            break;
          case 'ArrowRight':
            newX = box.absolutePosition.x + step;
            break;
        }

        const newPosition: BoxPosition = {
          ...box.absolutePosition,
          x: newX,
          y: newY,
        };

        onUpdate(box.id, box.gridPosition, newPosition);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [box, onDelete, onUpdate]);

  // Get grid position text
  const getPositionText = () => {
    if (box.isSelected && box.absolutePosition) {
      const gridPos = pixelToGrid(
        box.absolutePosition.x,
        box.absolutePosition.y,
        box.absolutePosition.width,
        box.absolutePosition.height
      );
      return `Col ${gridPos.colStart}-${gridPos.colEnd - 1}, Row ${gridPos.rowStart}-${gridPos.rowEnd - 1}`;
    }
    return `Col ${box.gridPosition.colStart}-${box.gridPosition.colEnd - 1}, Row ${box.gridPosition.rowStart}-${box.gridPosition.rowEnd - 1}`;
  };

  const boxContent = (
    <div
      className={`
        w-full h-full overflow-hidden rounded-xl border-2 shadow-lg
        ${box.isSelected
          ? 'border-blue-500 shadow-blue-500/50 shadow-2xl scale-[1.02]'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-xl'
        }
        ${isDragging || isResizing ? 'cursor-grabbing' : 'cursor-grab'}
        ${!(isDragging || isResizing) ? 'transition-all duration-150' : ''}
      `}
      style={{
        willChange: isDragging || isResizing ? 'transform' : 'auto',
        background: box.isSelected
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      }}
      onClick={handleClick}
    >
      {/* Box content */}
      <div className={`w-full h-full p-3 flex flex-col justify-between text-sm ${box.isSelected ? 'text-white' : 'text-gray-700 dark:text-gray-300'}`}>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${box.isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>
          <div className="font-bold">Box {box.id.replace('box-', '#')}</div>
        </div>
        <div className="text-[10px] opacity-80">{getPositionText()}</div>
        {box.isSelected && (
          <div className="text-[10px] font-semibold bg-white/20 backdrop-blur-sm px-2 py-1 rounded-md">
            {Math.round(currentPos.width / CELL_SIZE)}×{Math.round(currentPos.height / CELL_SIZE)} cells
          </div>
        )}
      </div>
    </div>
  );

  // If selected, wrap in Rnd for drag and resize; otherwise render directly
  if (box.isSelected && box.absolutePosition) {
    return (
      <Rnd
        position={{ x: currentPos.x + paddingOffset + gridContainerOffset, y: currentPos.y + paddingOffset + gridContainerOffset }}
        size={{ width: currentPos.width, height: currentPos.height }}
        onDragStart={handleDragStart}
        onDrag={handleDrag}
        onDragStop={handleDragStop}
        onResizeStart={handleResizeStart}
        onResize={handleResize}
        onResizeStop={handleResizeStop}
        bounds="parent"
        minWidth={CELL_SIZE}
        minHeight={CELL_SIZE}
        maxWidth={GRID_COLUMNS * CELL_SIZE}
        maxHeight={5 * CELL_SIZE}
        enableResizing={box.isSelected ? {
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        } : false}
        disableDragging={!box.isSelected}
        style={{
          zIndex: 10,
        }}
        resizeHandleStyles={{
          top: { cursor: 'ns-resize', height: '8px' },
          right: { cursor: 'ew-resize', width: '8px' },
          bottom: { cursor: 'ns-resize', height: '8px' },
          left: { cursor: 'ew-resize', width: '8px' },
          topRight: { cursor: 'nesw-resize', width: '12px', height: '12px' },
          bottomRight: { cursor: 'nwse-resize', width: '12px', height: '12px' },
          bottomLeft: { cursor: 'nesw-resize', width: '12px', height: '12px' },
          topLeft: { cursor: 'nwse-resize', width: '12px', height: '12px' },
        }}
        resizeHandleClasses={{
          top: 'resize-handle-top',
          right: 'resize-handle-right',
          bottom: 'resize-handle-bottom',
          left: 'resize-handle-left',
          topRight: 'resize-handle-corner',
          bottomRight: 'resize-handle-corner',
          bottomLeft: 'resize-handle-corner',
          topLeft: 'resize-handle-corner',
        }}
      >
        {boxContent}
      </Rnd>
    );
  }

  return boxContent;
}
