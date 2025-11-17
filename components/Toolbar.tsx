/**
 * Toolbar Component
 * Contains controls for:
 * - Adding boxes
 * - Clearing all boxes
 * - Exporting/importing layouts
 * - Displaying box count and selection info
 */

'use client';

import React from 'react';

interface ToolbarProps {
  onAddBox: () => void;
  onClearAll: () => void;
  onExport: () => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
  boxCount: number;
  selectedCount: number;
}

export default function Toolbar({
  onAddBox,
  onClearAll,
  onExport,
  onImport,
  boxCount,
  selectedCount,
}: ToolbarProps) {
  return (
    <div className="bg-gray-900/50 border-b border-gray-800/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onAddBox}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-semibold transition-all shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Add Box
            </button>

            <button
              onClick={onClearAll}
              disabled={boxCount === 0}
              className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg shadow-red-900/30 hover:shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Clear All
            </button>

            <div className="h-8 w-px bg-gray-700/50" />

            <button
              onClick={onExport}
              className="px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 rounded-lg font-medium transition-all border border-gray-700/50 hover:border-gray-600/50 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
              </svg>
              Export
            </button>

            <label className="px-4 py-2.5 bg-gray-800/80 hover:bg-gray-700/80 text-gray-200 rounded-lg font-medium transition-all cursor-pointer border border-gray-700/50 hover:border-gray-600/50 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              Import
              <input
                type="file"
                accept=".json"
                onChange={onImport}
                className="hidden"
              />
            </label>
          </div>

          <div className="flex items-center gap-4">
            <div className="px-4 py-2 bg-gray-800/50 rounded-lg border border-gray-700/30">
              <span className="text-sm font-semibold text-white">{boxCount}</span>
              <span className="text-xs text-gray-500 ml-1">boxes</span>
            </div>
            <div className="px-4 py-2 bg-blue-900/20 rounded-lg border border-blue-800/30">
              <span className="text-sm font-semibold text-blue-400">{selectedCount}</span>
              <span className="text-xs text-blue-500/70 ml-1">selected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
