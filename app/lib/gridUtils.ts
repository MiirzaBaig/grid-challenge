export const GRID_COLUMNS = 10;
export const CELL_SIZE = 80; // pixels

export interface GridPosition {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
}

export interface BoxPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Convert absolute pixel position to grid position
 */
export function pixelToGrid(
  x: number,
  y: number,
  width: number,
  height: number
): GridPosition {
  const colStart = Math.max(1, Math.round(x / CELL_SIZE) + 1);
  const colEnd = Math.min(
    GRID_COLUMNS + 1,
    colStart + Math.max(1, Math.round(width / CELL_SIZE))
  );
  const rowStart = Math.max(1, Math.round(y / CELL_SIZE) + 1);
  const rowEnd = rowStart + Math.max(1, Math.round(height / CELL_SIZE));

  return {
    colStart: Math.max(1, colStart),
    colEnd: Math.min(GRID_COLUMNS + 1, colEnd),
    rowStart: Math.max(1, rowStart),
    rowEnd: rowEnd,
  };
}

/**
 * Convert grid position to absolute pixel position
 */
export function gridToPixel(gridPos: GridPosition): BoxPosition {
  return {
    x: (gridPos.colStart - 1) * CELL_SIZE,
    y: (gridPos.rowStart - 1) * CELL_SIZE,
    width: (gridPos.colEnd - gridPos.colStart) * CELL_SIZE,
    height: (gridPos.rowEnd - gridPos.rowStart) * CELL_SIZE,
  };
}

/**
 * Check if two grid positions overlap
 */
export function doGridPositionsOverlap(
  pos1: GridPosition,
  pos2: GridPosition
): boolean {
  return (
    pos1.colStart < pos2.colEnd &&
    pos1.colEnd > pos2.colStart &&
    pos1.rowStart < pos2.rowEnd &&
    pos1.rowEnd > pos2.rowStart
  );
}

/**
 * Check if a grid position is valid (within bounds)
 */
export function isValidGridPosition(pos: GridPosition): boolean {
  return (
    pos.colStart >= 1 &&
    pos.colStart <= GRID_COLUMNS &&
    pos.colEnd > pos.colStart &&
    pos.colEnd <= GRID_COLUMNS + 1 &&
    pos.rowStart >= 1 &&
    pos.rowEnd > pos.rowStart
  );
}

/**
 * Constrain dimensions to grid cell boundaries
 */
export function constrainToGrid(
  width: number,
  height: number
): { width: number; height: number } {
  const minSize = CELL_SIZE;
  const maxWidth = GRID_COLUMNS * CELL_SIZE;
  const maxHeight = 5 * CELL_SIZE; // Max 5 rows as per spec

  return {
    width: Math.max(minSize, Math.min(maxWidth, Math.round(width / CELL_SIZE) * CELL_SIZE)),
    height: Math.max(minSize, Math.min(maxHeight, Math.round(height / CELL_SIZE) * CELL_SIZE)),
  };
}

