/**
 * Interactive Grid System - Main Page
 *
 * A 10-column responsive grid system where boxes can be:
 * - Selected and dragged freely with react-rnd
 * - Resized in any direction
 * - Snapped back to grid coordinates on deselect
 *
 * Features:
 * - Dynamic grid sizing with ResizeObserver
 * - Multi-select with Shift key
 * - Export/Import layouts as JSON
 * - Professional dark UI
 */

'use client';

import React, { useState, useCallback, useRef } from 'react';
import Grid from './grid/Grid';
import Toolbar from '../components/Toolbar';
import { Box } from './grid/types';
import { pixelToGrid } from './grid/snapping';
import { useGridMath } from './grid/useGridMath';

// Initial demo boxes
const initialBoxes: Box[] = [
  { id: '1', col: 1, row: 1, colSpan: 2, rowSpan: 1 },
  { id: '2', col: 3, row: 1, colSpan: 3, rowSpan: 2 },
  { id: '3', col: 6, row: 1, colSpan: 2, rowSpan: 1 },
  { id: '4', col: 1, row: 2, colSpan: 2, rowSpan: 2 },
];

export default function Home() {
  // State management
  const [boxes, setBoxes] = useState<Box[]>(initialBoxes);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);
  const gridMath = useGridMath(containerRef);
  const nextId = useRef(5); // ID counter for new boxes

  /**
   * Add a new box to the grid
   * Places it at the next available row
   */
  const handleAddBox = useCallback(() => {
    // Find the next available row
    const maxRow = boxes.length > 0 ? Math.max(...boxes.map(b => b.row + b.rowSpan - 1)) : 0;

    const newBox: Box = {
      id: String(nextId.current++),
      col: 1,              // Start at column 1
      row: maxRow + 1,     // Place below existing boxes
      colSpan: 2,          // Span 2 columns
      rowSpan: 1,          // Span 1 row
    };
    setBoxes(prev => [...prev, newBox]);
  }, [boxes]);

  /**
   * Clear all boxes and reset ID counter
   */
  const handleClearAll = useCallback(() => {
    if (confirm('Clear all boxes?')) {
      setBoxes([]);
      setSelectedIds(new Set());
      nextId.current = 1; // Reset ID counter so new boxes start from #1
    }
  }, []);

  /**
   * Handle box selection
   * Supports multi-select with Shift key
   */
  const handleSelect = useCallback((id: string, multiSelect: boolean) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (multiSelect) {
        // Toggle selection if Shift is held
        if (newSet.has(id)) {
          newSet.delete(id);
        } else {
          newSet.add(id);
        }
      } else {
        // Single selection - clear others
        newSet.clear();
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  /**
   * Deselect all boxes (click outside)
   */
  const handleDeselect = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  /**
   * Handle drag stop - snap box to grid
   * Converts pixel position back to grid coordinates
   */
  const handleDragStop = useCallback((id: string, x: number, y: number) => {
    setBoxes(prev => prev.map(box => {
      if (box.id !== id) return box;

      const currentBox = prev.find(b => b.id === id);
      if (!currentBox) return box;

      // Calculate current dimensions for snapping
      const snapped = pixelToGrid(
        x,
        y,
        box.colSpan * gridMath.cellWidth + (box.colSpan - 1) * gridMath.gap,
        box.rowSpan * gridMath.rowHeight + (box.rowSpan - 1) * gridMath.gap,
        gridMath
      );

      // Update box with new grid coordinates
      return { ...box, ...snapped };
    }));
  }, [gridMath]);

  /**
   * Handle resize stop - snap box to grid
   * Converts new size and position back to grid coordinates
   */
  const handleResizeStop = useCallback((
    id: string,
    x: number,
    y: number,
    width: number,
    height: number
  ) => {
    setBoxes(prev => prev.map(box => {
      if (box.id !== id) return box;

      // Snap new dimensions to grid
      const snapped = pixelToGrid(x, y, width, height, gridMath);
      return { ...box, ...snapped };
    }));
  }, [gridMath]);

  /**
   * Export grid layout as JSON file
   */
  const handleExport = useCallback(() => {
    // Create JSON file and trigger download
    const data = JSON.stringify(boxes, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [boxes]);

  /**
   * Import grid layout from JSON file
   */
  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read and parse JSON file
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setBoxes(imported);
          setSelectedIds(new Set()); // Clear selection
        }
      } catch (error) {
        alert('Invalid JSON file');
      }
    };
    reader.readAsText(file);

    // Reset input so same file can be selected again
    e.target.value = '';
  }, []);

  return (
    <div ref={containerRef} className="min-h-screen bg-gray-950 flex flex-col">
      <header className="bg-gradient-to-b from-gray-900 to-gray-900/95 border-b border-gray-800/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl flex items-center justify-center shadow-lg shadow-blue-900/50">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                  Interactive Grid System
                </h1>
                <p className="text-gray-500 mt-0.5 text-sm font-medium">
                  10-column responsive grid • Drag, resize & snap to grid
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="text-xs text-gray-500 uppercase tracking-wider mb-0.5">Grid Size</div>
                <div className="text-sm font-bold text-white">10 × Dynamic</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <Toolbar
        onAddBox={handleAddBox}
        onClearAll={handleClearAll}
        onExport={handleExport}
        onImport={handleImport}
        boxCount={boxes.length}
        selectedCount={selectedIds.size}
      />

      <main className="flex-1">
        <Grid
          boxes={boxes}
          selectedIds={selectedIds}
          onSelect={handleSelect}
          onDeselect={handleDeselect}
          onDragStop={handleDragStop}
          onResizeStop={handleResizeStop}
        />
      </main>
    </div>
  );
}
