/**
 * Type definitions for the Interactive Grid System
 */

/**
 * Represents a box in the grid
 * @property id - Unique identifier for the box
 * @property col - Starting column (1-based index)
 * @property row - Starting row (1-based index)
 * @property colSpan - Number of columns the box spans
 * @property rowSpan - Number of rows the box spans
 */
export interface Box {
  id: string;
  col: number;
  row: number;
  colSpan: number;
  rowSpan: number;
}

/**
 * Grid measurement calculations
 * @property cellWidth - Calculated width of each grid cell
 * @property rowHeight - Fixed height of each row (60px)
 * @property gap - Space between grid cells (16px)
 * @property gridWidth - Total width of the grid container
 */
export interface GridMath {
  cellWidth: number;
  rowHeight: number;
  gap: number;
  gridWidth: number;
}

/**
 * Pixel-based position for absolute positioning
 * @property left - X coordinate from left edge
 * @property top - Y coordinate from top edge
 * @property width - Width in pixels
 * @property height - Height in pixels
 */
export interface BoxPosition {
  left: number;
  top: number;
  width: number;
  height: number;
}
