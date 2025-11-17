/**
 * Grid Math Hook
 * Calculates and tracks grid dimensions dynamically using ResizeObserver
 */

import { useState, useEffect, useCallback } from 'react';
import { GridMath } from './types';

// Grid constants as per spec
const ROW_HEIGHT = 60;  // Fixed row height in pixels
const GAP = 16;         // Gap between cells in pixels
const GRID_COLUMNS = 10; // Number of columns in the grid

/**
 * Custom hook to calculate grid math dynamically
 * Uses ResizeObserver to recalculate on container resize
 *
 * @param containerRef - Reference to the grid container element
 * @returns GridMath object with current grid measurements
 */
export function useGridMath(containerRef: React.RefObject<HTMLDivElement>): GridMath {
  // Initial state with default values
  const [gridMath, setGridMath] = useState<GridMath>({
    cellWidth: 80,
    rowHeight: ROW_HEIGHT,
    gap: GAP,
    gridWidth: 896,
  });

  /**
   * Calculate grid dimensions based on container width
   * Formula: cellWidth = (gridWidth - totalGaps) / GRID_COLUMNS
   */
  const calculateGridMath = useCallback(() => {
    if (!containerRef.current) return;

    const gridWidth = containerRef.current.offsetWidth;
    const totalGaps = (GRID_COLUMNS - 1) * GAP;
    const cellWidth = (gridWidth - totalGaps) / GRID_COLUMNS;

    setGridMath({
      cellWidth,
      rowHeight: ROW_HEIGHT,
      gap: GAP,
      gridWidth,
    });
  }, [containerRef]);

  useEffect(() => {
    // Calculate initial dimensions
    calculateGridMath();

    // Set up ResizeObserver to recalculate on container resize
    const resizeObserver = new ResizeObserver(() => {
      calculateGridMath();
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Cleanup
    return () => {
      resizeObserver.disconnect();
    };
  }, [calculateGridMath]);

  return gridMath;
}

// Export constants for use in other files
export { ROW_HEIGHT, GAP, GRID_COLUMNS };

export { ROW_HEIGHT, GAP, GRID_COLUMNS };
