/**
 * GridBox Component
 * Renders an individual box that can be selected, dragged, and resized
 * When selected: Uses react-rnd for free positioning
 * When unselected: Uses calculated grid positioning
 */

'use client';

import React from 'react';
import { Rnd } from 'react-rnd';
import { Box, GridMath } from './types';
import { gridToPixel } from './snapping';

interface GridBoxProps {
  box: Box;
  isSelected: boolean;
  gridMath: GridMath;
  onSelect: (id: string, multiSelect: boolean) => void;
  onDragStop: (id: string, x: number, y: number) => void;
  onResizeStop: (id: string, x: number, y: number, width: number, height: number) => void;
}

export default function GridBox({
  box,
  isSelected,
  gridMath,
  onSelect,
  onDragStop,
  onResizeStop,
}: GridBoxProps) {
  // Calculate pixel position from grid coordinates
  const position = gridToPixel(box, gridMath);

  /**
   * Handle box click - supports multi-select with Shift key
   */
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(box.id, e.shiftKey);
  };

  // Box content - same for both selected and unselected states
  const boxContent = (
    <div
      className={`
        w-full h-full rounded-lg border-2 flex items-center justify-center text-sm font-semibold
        transition-all duration-200
        ${isSelected
          ? 'bg-blue-600 border-blue-500 text-white shadow-2xl shadow-blue-500/50 z-50'
          : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600 hover:bg-gray-750'
        }
      `}
      onClick={handleClick}
      style={{ cursor: isSelected ? 'move' : 'pointer' }}
    >
      <div className="text-center">
        <div className="font-bold">#{box.id}</div>
        <div className="text-xs opacity-80">
          {box.col},{box.row} ({box.colSpan}×{box.rowSpan})
        </div>
      </div>
    </div>
  );

  // If selected, wrap in Rnd for drag & resize with absolute positioning
  if (isSelected) {
    return (
      <Rnd
        // Set initial position and size from grid calculations
        position={{ x: position.left, y: position.top }}
        size={{ width: position.width, height: position.height }}
        // On drag stop, convert pixel position back to grid coordinates
        onDragStop={(e, d) => onDragStop(box.id, d.x, d.y)}
        // On resize stop, convert new size and position back to grid coordinates
        onResizeStop={(e, direction, ref, delta, pos) => {
          onResizeStop(
            box.id,
            pos.x,
            pos.y,
            parseInt(ref.style.width),
            parseInt(ref.style.height)
          );
        }}
        // Keep box within grid container
        bounds="parent"
        // Minimum size = one grid cell
        minWidth={gridMath.cellWidth}
        minHeight={gridMath.rowHeight}
        // Enable all resize directions
        enableResizing={{
          top: true,
          right: true,
          bottom: true,
          left: true,
          topRight: true,
          bottomRight: true,
          bottomLeft: true,
          topLeft: true,
        }}
        // Always render selected boxes on top
        style={{ zIndex: 50 }}
        // Custom cursor styles for resize handles
        resizeHandleStyles={{
          top: { cursor: 'ns-resize' },
          right: { cursor: 'ew-resize' },
          bottom: { cursor: 'ns-resize' },
          left: { cursor: 'ew-resize' },
          topRight: { cursor: 'nesw-resize' },
          bottomRight: { cursor: 'nwse-resize' },
          bottomLeft: { cursor: 'nesw-resize' },
          topLeft: { cursor: 'nwse-resize' },
        }}
        // CSS classes for handle styling (defined in globals.css)
        resizeHandleClasses={{
          top: 'resize-handle-edge',
          right: 'resize-handle-edge',
          bottom: 'resize-handle-edge',
          left: 'resize-handle-edge',
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

  // Unselected: render with absolute positioning using grid calculations
  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.left}px`,
        top: `${position.top}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
      }}
    >
      {boxContent}
    </div>
  );
}
