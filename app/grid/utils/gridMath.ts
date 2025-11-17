/**
 * Grid Math Utilities
 * Handles all grid calculation logic
 */

export const GRID_COLUMNS = 10;
export const GRID_GAP = 16; // pixels
export const ROW_HEIGHT = 80; // pixels (increased from 64 for better visibility)

/**
 * Calculate cell width dynamically based on container width
 */
export function calculateCellWidth(containerWidth: number): number {
  const totalGaps = (GRID_COLUMNS - 1) * GRID_GAP;
  return (containerWidth - totalGaps) / GRID_COLUMNS;
}

/**
 * Calculate box position when in grid mode
 */
export function calculateBoxPosition(
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number,
  cellWidth: number
): {
  left: number;
  top: number;
  width: number;
  height: number;
} {
  return {
    left: (col - 1) * (cellWidth + GRID_GAP),
    top: (row - 1) * (ROW_HEIGHT + GRID_GAP),
    width: colSpan * cellWidth + (colSpan - 1) * GRID_GAP,
    height: rowSpan * ROW_HEIGHT + (rowSpan - 1) * GRID_GAP,
  };
}

/**
 * Calculate grid dimensions
 */
export function calculateGridDimensions(
  containerWidth: number,
  maxRows: number
): {
  width: number;
  height: number;
  cellWidth: number;
} {
  const cellWidth = calculateCellWidth(containerWidth);
  const totalGaps = (GRID_COLUMNS - 1) * GRID_GAP;

  return {
    width: cellWidth * GRID_COLUMNS + totalGaps,
    height: ROW_HEIGHT * maxRows + (maxRows - 1) * GRID_GAP,
    cellWidth,
  };
}
