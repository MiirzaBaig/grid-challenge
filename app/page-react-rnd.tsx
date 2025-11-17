'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import Grid from './grid/Grid';
import { BoxData, HistoryState } from './grid/types';
import { snapToGrid, clampToGrid } from './grid/utils/snapping';
import { calculateBoxPosition, calculateCellWidth } from './grid/utils/gridMath';

const initialBoxes: BoxData[] = [
  { id: 'box-1', col: 1, row: 1, colSpan: 2, rowSpan: 1 },
  { id: 'box-2', col: 3, row: 1, colSpan: 3, rowSpan: 2 },
  { id: 'box-3', col: 6, row: 1, colSpan: 3, rowSpan: 1 },
  { id: 'box-4', col: 1, row: 2, colSpan: 2, rowSpan: 2 },
];

export default function Home() {
  const [boxes, setBoxes] = useState<BoxData[]>(initialBoxes);
  const [selectedBoxIds, setSelectedBoxIds] = useState<Set<string>>(new Set());
  const [history, setHistory] = useState<HistoryState[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [darkMode, setDarkMode] = useState(false);
  const [containerWidth, setContainerWidth] = useState(800);
  const boxIdCounter = useRef(4);

  // Initialize dark mode
  useEffect(() => {
    const isDark =
      localStorage.getItem('darkMode') === 'true' ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches &&
        !localStorage.getItem('darkMode'));
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    localStorage.setItem('darkMode', String(newDarkMode));
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Save state to history
  const saveToHistory = useCallback(
    (newBoxes: BoxData[], newSelectedIds: Set<string>) => {
      const newHistory = history.slice(0, historyIndex + 1);
      newHistory.push({
        boxes: JSON.parse(JSON.stringify(newBoxes)),
        selectedBoxIds: new Set(newSelectedIds),
      });
      setHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    },
    [history, historyIndex]
  );

  // Undo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setBoxes(prevState.boxes);
      setSelectedBoxIds(new Set(prevState.selectedBoxIds));
      setHistoryIndex(historyIndex - 1);
    }
  }, [history, historyIndex]);

  // Redo
  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setBoxes(nextState.boxes);
      setSelectedBoxIds(new Set(nextState.selectedBoxIds));
      setHistoryIndex(historyIndex + 1);
    }
  }, [history, historyIndex]);

  // Add new box
  const handleAddBox = useCallback(() => {
    const maxRow = boxes.length > 0 ? Math.max(...boxes.map((b) => b.row + b.rowSpan - 1)) : 0;

    const newBox: BoxData = {
      id: `box-${++boxIdCounter.current}`,
      col: 1,
      row: maxRow + 1,
      colSpan: 2,
      rowSpan: 1,
    };

    const newBoxes = [...boxes, newBox];
    setBoxes(newBoxes);
    saveToHistory(newBoxes, selectedBoxIds);
  }, [boxes, selectedBoxIds, saveToHistory]);

  // Handle box selection
  const handleBoxSelect = useCallback(
    (id: string, multiSelect: boolean) => {
      setSelectedBoxIds((prev) => {
        const newSet = new Set(prev);

        if (multiSelect) {
          if (newSet.has(id)) {
            newSet.delete(id);
          } else {
            newSet.add(id);
          }
        } else {
          newSet.clear();
          newSet.add(id);
        }

        // Convert selected boxes to absolute positioning
        setBoxes((prevBoxes) => {
          const cellWidth = calculateCellWidth(containerWidth);
          return prevBoxes.map((box) => {
            if (newSet.has(box.id) && !box.absolutePosition) {
              // Convert grid position to absolute
              const absPos = calculateBoxPosition(
                box.col,
                box.row,
                box.colSpan,
                box.rowSpan,
                cellWidth
              );
              return { ...box, absolutePosition: absPos };
            }
            return box;
          });
        });

        return newSet;
      });
    },
    [containerWidth]
  );

  // Handle box deselect
  const handleBoxDeselect = useCallback(() => {
    // Snap selected boxes to grid before deselecting
    setBoxes((prevBoxes) => {
      const cellWidth = calculateCellWidth(containerWidth);
      const updatedBoxes = prevBoxes.map((box) => {
        if (box.isSelected && box.absolutePosition) {
          // Calculate grid position from absolute position
          const snapped = snapToGrid(
            box.absolutePosition.x,
            box.absolutePosition.y,
            box.absolutePosition.width,
            box.absolutePosition.height,
            cellWidth
          );
          const clamped = clampToGrid(snapped.col, snapped.row, snapped.colSpan, snapped.rowSpan);
          return {
            ...box,
            ...clamped,
            absolutePosition: undefined,
          };
        }
        return box;
      });

      // Save to history when deselecting
      setTimeout(() => {
        saveToHistory(updatedBoxes, new Set());
      }, 0);

      return updatedBoxes;
    });
    setSelectedBoxIds(new Set());
  }, [containerWidth, saveToHistory]);

  // Handle box update
  const handleBoxUpdate = useCallback(
    (id: string, data: Partial<BoxData>) => {
      setBoxes((prevBoxes) => {
        return prevBoxes.map((box) => {
          if (box.id === id) {
            return {
              ...box,
              ...data,
              isSelected: selectedBoxIds.has(id),
            };
          }
          return box;
        });
      });
    },
    [selectedBoxIds]
  );

  // Handle box delete
  const handleBoxDelete = useCallback(
    (id: string) => {
      setBoxes((prevBoxes) => {
        const newBoxes = prevBoxes.filter((box) => box.id !== id);
        const newSelectedIds = new Set(selectedBoxIds);
        newSelectedIds.delete(id);
        setSelectedBoxIds(newSelectedIds);
        saveToHistory(newBoxes, newSelectedIds);
        return newBoxes;
      });
    },
    [selectedBoxIds, saveToHistory]
  );

  // Clear all boxes
  const handleClearAll = useCallback(() => {
    if (boxes.length === 0) return;
    if (confirm('Are you sure you want to clear all boxes?')) {
      setBoxes([]);
      setSelectedBoxIds(new Set());
      saveToHistory([], new Set());
    }
  }, [boxes.length, saveToHistory]);

  // Export layout
  const handleExport = useCallback(() => {
    const exportData = {
      boxes: boxes.map((box) => ({
        id: box.id,
        col: box.col,
        row: box.row,
        colSpan: box.colSpan,
        rowSpan: box.rowSpan,
      })),
      version: '2.0',
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [boxes]);

  // Import layout
  const handleImport = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target?.result as string);
          if (data.boxes && Array.isArray(data.boxes)) {
            const importedBoxes: BoxData[] = data.boxes.map((boxData: any) => ({
              id: boxData.id || `box-${++boxIdCounter.current}`,
              col: boxData.col,
              row: boxData.row,
              colSpan: boxData.colSpan,
              rowSpan: boxData.rowSpan,
            }));

            setBoxes(importedBoxes);
            setSelectedBoxIds(new Set());
            saveToHistory(importedBoxes, new Set());
          }
        } catch (error) {
          alert('Failed to import layout. Please check the file format.');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
      e.target.value = '';
    },
    [saveToHistory]
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Undo/Redo
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (
        (e.metaKey || e.ctrlKey) &&
        (e.key === 'y' || (e.key === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Delete selected boxes
      else if (
        (e.key === 'Delete' || e.key === 'Backspace') &&
        selectedBoxIds.size > 0
      ) {
        if (document.activeElement?.tagName !== 'INPUT') {
          e.preventDefault();
          selectedBoxIds.forEach((id) => handleBoxDelete(id));
        }
      }
      // Add box with 'A' key
      else if (
        e.key === 'a' &&
        !e.metaKey &&
        !e.ctrlKey &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        handleAddBox();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo, selectedBoxIds, handleBoxDelete, handleAddBox]);

  // Initialize history
  useEffect(() => {
    if (history.length === 0 && boxes.length >= 0) {
      saveToHistory(boxes, new Set());
    }
  }, []);

  // Track container width for snapping calculations
  useEffect(() => {
    const handleResize = () => {
      const container = document.querySelector('[data-grid-container]');
      if (container) {
        setContainerWidth(container.clientWidth);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex flex-col">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl shadow-lg border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zM14 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                  Interactive Grid System
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                  10-column grid • Drag, resize & arrange
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110"
                aria-label="Toggle dark mode"
              >
                {darkMode ? (
                  <svg
                    className="w-5 h-5 text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 text-indigo-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Toolbar */}
      <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 flex-wrap">
            {/* Add Box Button */}
            <button
              onClick={handleAddBox}
              className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold flex items-center gap-2 hover:scale-105"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add Box
            </button>

            {/* Clear All Button */}
            <button
              onClick={handleClearAll}
              disabled={boxes.length === 0}
              className="px-4 py-2.5 bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 hover:scale-105"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear All
            </button>

            {/* Undo/Redo */}
            <div className="flex items-center gap-2 border-l border-gray-300/50 dark:border-gray-600/50 pl-3 ml-1">
              <button
                onClick={handleUndo}
                disabled={historyIndex <= 0}
                className="p-2.5 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 shadow-md"
                title="Undo (Ctrl+Z)"
              >
                <svg
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                  />
                </svg>
              </button>
              <button
                onClick={handleRedo}
                disabled={historyIndex >= history.length - 1}
                className="p-2.5 rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed hover:scale-110 shadow-md"
                title="Redo (Ctrl+Y)"
              >
                <svg
                  className="w-5 h-5 text-gray-700 dark:text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 10h-10a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6"
                  />
                </svg>
              </button>
            </div>

            {/* Export/Import */}
            <div className="flex items-center gap-2 border-l border-gray-300/50 dark:border-gray-600/50 pl-3 ml-1">
              <button
                onClick={handleExport}
                className="px-4 py-2 text-sm rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 text-gray-700 dark:text-gray-300 font-medium shadow-md hover:scale-105"
                title="Export layout"
              >
                Export
              </button>
              <label className="px-4 py-2 text-sm rounded-xl hover:bg-white/80 dark:hover:bg-gray-700/80 transition-all duration-200 text-gray-700 dark:text-gray-300 cursor-pointer font-medium shadow-md hover:scale-105">
                Import
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="hidden"
                />
              </label>
            </div>

            {/* Info */}
            <div className="ml-auto text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white/60 dark:bg-gray-700/60 px-4 py-2 rounded-xl backdrop-blur-sm shadow-md">
              {boxes.length} box{boxes.length !== 1 ? 'es' : ''} • {selectedBoxIds.size} selected
            </div>
          </div>
        </div>
      </div>

      {/* Grid Container */}
      <main className="flex-1 overflow-hidden" data-grid-container>
        <Grid
          boxes={boxes}
          selectedBoxIds={selectedBoxIds}
          onBoxSelect={handleBoxSelect}
          onBoxDeselect={handleBoxDeselect}
          onBoxUpdate={handleBoxUpdate}
          onBoxDelete={handleBoxDelete}
        />
      </main>

      {/* Keyboard Shortcuts Help */}
      <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-t border-gray-200/50 dark:border-gray-700/50 px-4 py-2">
        <div className="max-w-7xl mx-auto">
          <details className="text-xs text-gray-500 dark:text-gray-400">
            <summary className="cursor-pointer hover:text-gray-700 dark:hover:text-gray-300">
              Keyboard Shortcuts
            </summary>
            <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2">
              <div>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">A</kbd> Add box
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Delete</kbd> Remove
                selected
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Z</kbd> Undo
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Ctrl+Y</kbd> Redo
              </div>
              <div>
                <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">Shift+Click</kbd>{' '}
                Multi-select
              </div>
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}
