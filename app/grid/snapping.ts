/**
 * Snapping Logic
 * Converts between pixel positions and grid coordinates
 */

import { Box, GridMath } from './types';
import { GRID_COLUMNS } from './useGridMath';

/**
 * Convert pixel position to grid coordinates (snapping logic)
 * Implements the exact formula from spec:
 * - col = round(x / (cellWidth + gap)) + 1
 * - row = round(y / (rowHeight + gap)) + 1
 * - colSpan = round(width / (cellWidth + gap))
 * - rowSpan = round(height / (rowHeight + gap))
 *
 * @param x - X position in pixels
 * @param y - Y position in pixels
 * @param width - Width in pixels
 * @param height - Height in pixels
 * @param gridMath - Current grid measurements
 * @returns Grid coordinates (col, row, colSpan, rowSpan)
 */
export function pixelToGrid(
  x: number,
  y: number,
  width: number,
  height: number,
  gridMath: GridMath
): Pick<Box, 'col' | 'row' | 'colSpan' | 'rowSpan'> {
  const { cellWidth, rowHeight, gap } = gridMath;

  // Apply snapping formulas
  let col = Math.round(x / (cellWidth + gap)) + 1;
  let row = Math.round(y / (rowHeight + gap)) + 1;
  let colSpan = Math.max(1, Math.round(width / (cellWidth + gap)));
  let rowSpan = Math.max(1, Math.round(height / (rowHeight + gap)));

  // Clamp column to grid boundaries
  col = Math.max(1, col);
  if (col + colSpan > GRID_COLUMNS + 1) {
    colSpan = GRID_COLUMNS + 1 - col;
  }

  // Clamp row to grid boundaries (minimum 1)
  row = Math.max(1, row);

  // Ensure minimum size (at least 1 cell)
  colSpan = Math.max(1, colSpan);
  rowSpan = Math.max(1, rowSpan);

  return { col, row, colSpan, rowSpan };
}

/**
 * Convert grid coordinates to pixel position
 * Implements the exact formula from spec:
 * - left = (col - 1) × (cellWidth + gap)
 * - top = (row - 1) × (rowHeight + gap)
 * - width = colSpan × cellWidth + (colSpan - 1) × gap
 * - height = rowSpan × rowHeight + (rowSpan - 1) × gap
 *
 * @param box - Box with grid coordinates
 * @param gridMath - Current grid measurements
 * @returns Pixel position (left, top, width, height)
 */
export function gridToPixel(
  box: Pick<Box, 'col' | 'row' | 'colSpan' | 'rowSpan'>,
  gridMath: GridMath
): { left: number; top: number; width: number; height: number } {
  const { cellWidth, rowHeight, gap } = gridMath;

  // Apply positioning formulas
  const left = (box.col - 1) * (cellWidth + gap);
  const top = (box.row - 1) * (rowHeight + gap);
  const width = box.colSpan * cellWidth + (box.colSpan - 1) * gap;
  const height = box.rowSpan * rowHeight + (box.rowSpan - 1) * gap;

  return { left, top, width, height };
}
