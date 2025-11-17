/**
 * Snapping Logic Utilities
 * Converts pixel positions to grid coordinates
 */

import { GRID_COLUMNS, GRID_GAP, ROW_HEIGHT } from './gridMath';

/**
 * Snap pixel position to grid coordinates
 */
export function snapToGrid(
  x: number,
  y: number,
  width: number,
  height: number,
  cellWidth: number
): {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
} {
  // Calculate grid position using the formula from spec
  const col = Math.max(1, Math.round(x / (cellWidth + GRID_GAP)) + 1);
  const row = Math.max(1, Math.round(y / (ROW_HEIGHT + GRID_GAP)) + 1);

  // Calculate spans
  let colSpan = Math.max(1, Math.round(width / (cellWidth + GRID_GAP)));
  let rowSpan = Math.max(1, Math.round(height / (ROW_HEIGHT + GRID_GAP)));

  // Clamp values to stay within grid boundaries
  const maxColSpan = GRID_COLUMNS - col + 1;
  colSpan = Math.min(colSpan, maxColSpan);

  return {
    col: Math.min(col, GRID_COLUMNS),
    row,
    colSpan: Math.max(1, colSpan),
    rowSpan: Math.max(1, rowSpan),
  };
}

/**
 * Check if a box is within grid boundaries
 */
export function isWithinBounds(
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number
): boolean {
  return (
    col >= 1 &&
    row >= 1 &&
    col + colSpan - 1 <= GRID_COLUMNS &&
    colSpan > 0 &&
    rowSpan > 0
  );
}

/**
 * Clamp box to grid boundaries
 */
export function clampToGrid(
  col: number,
  row: number,
  colSpan: number,
  rowSpan: number
): {
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
} {
  // Ensure minimum values
  col = Math.max(1, col);
  row = Math.max(1, row);
  colSpan = Math.max(1, colSpan);
  rowSpan = Math.max(1, rowSpan);

  // Ensure box doesn't exceed grid width
  if (col + colSpan - 1 > GRID_COLUMNS) {
    colSpan = GRID_COLUMNS - col + 1;
  }

  // If still invalid, move the box
  if (col > GRID_COLUMNS) {
    col = GRID_COLUMNS;
    colSpan = 1;
  }

  return { col, row, colSpan, rowSpan };
}
