export type Tool = "pencil" | "eraser" | "fill";

export type PixelColor = string | null;

export type PixelGrid = PixelColor[][];

export const createPixelGrid = (
  rows: number,
  cols: number
): PixelGrid => {
  const safeRows = Math.max(1, Math.round(rows));
  const safeCols = Math.max(1, Math.round(cols));
  const grid: PixelGrid = [];
  for (let row = 0; row < safeRows; row += 1) {
    const rowData: PixelColor[] = [];
    for (let col = 0; col < safeCols; col += 1) {
      rowData.push(null);
    }
    grid.push(rowData);
  }
  return grid;
};

export const cloneGrid = (grid: PixelGrid): PixelGrid =>
  grid.map((row) => [...row]);

const inBounds = (
  grid: PixelGrid,
  row: number,
  col: number
): boolean =>
  row >= 0 &&
  col >= 0 &&
  row < grid.length &&
  col < grid[0].length;

export const applyPencil = (
  grid: PixelGrid,
  row: number,
  col: number,
  color: string
): PixelGrid => {
  if (!inBounds(grid, row, col)) {
    return grid;
  }
  const next = cloneGrid(grid);
  next[row][col] = color;
  return next;
};

export const applyEraser = (
  grid: PixelGrid,
  row: number,
  col: number
): PixelGrid => {
  if (!inBounds(grid, row, col)) {
    return grid;
  }
  const next = cloneGrid(grid);
  next[row][col] = null;
  return next;
};

export const applyFill = (
  grid: PixelGrid,
  row: number,
  col: number,
  newColor: string
): PixelGrid => {
  if (!inBounds(grid, row, col)) {
    return grid;
  }
  const targetColor = grid[row][col];
  if (targetColor === newColor) {
    return grid;
  }
  const next = cloneGrid(grid);
  const rows = next.length;
  const cols = next[0].length;
  const stack: { r: number; c: number }[] = [
    { r: row, c: col }
  ];
  while (stack.length > 0) {
    const cell = stack.pop();
    if (!cell) {
      continue;
    }
    const r = cell.r;
    const c = cell.c;
    if (
      r < 0 ||
      c < 0 ||
      r >= rows ||
      c >= cols
    ) {
      continue;
    }
    if (next[r][c] !== targetColor) {
      continue;
    }
    next[r][c] = newColor;
    stack.push({ r: r + 1, c });
    stack.push({ r: r - 1, c });
    stack.push({ r, c: c + 1 });
    stack.push({ r, c: c - 1 });
  }
  return next;
};

export const pushUndoState = (
  undoStack: PixelGrid[],
  currentGrid: PixelGrid
): PixelGrid[] => {
  const copy = cloneGrid(currentGrid);
  return [...undoStack, copy];
};

export const performUndo = (
  undoStack: PixelGrid[],
  redoStack: PixelGrid[],
  currentGrid: PixelGrid
): {
  grid: PixelGrid;
  undoStack: PixelGrid[];
  redoStack: PixelGrid[];
} => {
  if (undoStack.length === 0) {
    return {
      grid: currentGrid,
      undoStack,
      redoStack
    };
  }
  const nextUndo = [...undoStack];
  const previousGrid = nextUndo.pop();
  if (!previousGrid) {
    return {
      grid: currentGrid,
      undoStack,
      redoStack
    };
  }
  const nextRedo = [...redoStack, cloneGrid(currentGrid)];
  return {
    grid: previousGrid,
    undoStack: nextUndo,
    redoStack: nextRedo
  };
};

export const performRedo = (
  undoStack: PixelGrid[],
  redoStack: PixelGrid[],
  currentGrid: PixelGrid
): {
  grid: PixelGrid;
  undoStack: PixelGrid[];
  redoStack: PixelGrid[];
} => {
  if (redoStack.length === 0) {
    return {
      grid: currentGrid,
      undoStack,
      redoStack
    };
  }
  const nextRedo = [...redoStack];
  const restoredGrid = nextRedo.pop();
  if (!restoredGrid) {
    return {
      grid: currentGrid,
      undoStack,
      redoStack
    };
  }
  const nextUndo = [...undoStack, cloneGrid(currentGrid)];
  return {
    grid: restoredGrid,
    undoStack: nextUndo,
    redoStack: nextRedo
  };
};


