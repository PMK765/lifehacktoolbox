export type Matrix = number[][];

export type MatrixShape = {
  rows: number;
  cols: number;
};

export type SolveResult = {
  solution: number[];
};

const clampInt = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) {
    return min;
  }
  const rounded = Math.round(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
};

export const createMatrix = (rows: number, cols: number, fill = 0): Matrix => {
  const r = clampInt(rows, 1, 6);
  const c = clampInt(cols, 1, 6);
  const m: Matrix = [];
  for (let i = 0; i < r; i += 1) {
    const row: number[] = [];
    for (let j = 0; j < c; j += 1) {
      row.push(fill);
    }
    m.push(row);
  }
  return m;
};

export const cloneMatrix = (matrix: Matrix): Matrix => matrix.map((row) => [...row]);

export const shapeOf = (matrix: Matrix): MatrixShape => ({
  rows: matrix.length,
  cols: matrix.length > 0 ? matrix[0].length : 0
});

export const isRectangular = (matrix: Matrix): boolean => {
  if (matrix.length === 0) return false;
  const cols = matrix[0].length;
  if (cols === 0) return false;
  return matrix.every((row) => row.length === cols);
};

export const isSquare = (matrix: Matrix): boolean => {
  const s = shapeOf(matrix);
  return s.rows > 0 && s.rows === s.cols && isRectangular(matrix);
};

export const addMatrices = (a: Matrix, b: Matrix): Matrix | null => {
  const sa = shapeOf(a);
  const sb = shapeOf(b);
  if (sa.rows !== sb.rows || sa.cols !== sb.cols || !isRectangular(a) || !isRectangular(b)) {
    return null;
  }
  const out = createMatrix(sa.rows, sa.cols, 0);
  for (let i = 0; i < sa.rows; i += 1) {
    for (let j = 0; j < sa.cols; j += 1) {
      out[i][j] = a[i][j] + b[i][j];
    }
  }
  return out;
};

export const subtractMatrices = (a: Matrix, b: Matrix): Matrix | null => {
  const sa = shapeOf(a);
  const sb = shapeOf(b);
  if (sa.rows !== sb.rows || sa.cols !== sb.cols || !isRectangular(a) || !isRectangular(b)) {
    return null;
  }
  const out = createMatrix(sa.rows, sa.cols, 0);
  for (let i = 0; i < sa.rows; i += 1) {
    for (let j = 0; j < sa.cols; j += 1) {
      out[i][j] = a[i][j] - b[i][j];
    }
  }
  return out;
};

export const scalarMultiply = (matrix: Matrix, scalar: number): Matrix | null => {
  if (!isRectangular(matrix) || !Number.isFinite(scalar)) {
    return null;
  }
  const s = shapeOf(matrix);
  const out = createMatrix(s.rows, s.cols, 0);
  for (let i = 0; i < s.rows; i += 1) {
    for (let j = 0; j < s.cols; j += 1) {
      out[i][j] = matrix[i][j] * scalar;
    }
  }
  return out;
};

export const transpose = (matrix: Matrix): Matrix | null => {
  if (!isRectangular(matrix)) {
    return null;
  }
  const s = shapeOf(matrix);
  const out = createMatrix(s.cols, s.rows, 0);
  for (let i = 0; i < s.rows; i += 1) {
    for (let j = 0; j < s.cols; j += 1) {
      out[j][i] = matrix[i][j];
    }
  }
  return out;
};

export const multiplyMatrices = (a: Matrix, b: Matrix): Matrix | null => {
  if (!isRectangular(a) || !isRectangular(b)) {
    return null;
  }
  const sa = shapeOf(a);
  const sb = shapeOf(b);
  if (sa.cols !== sb.rows) {
    return null;
  }
  const out = createMatrix(sa.rows, sb.cols, 0);
  for (let i = 0; i < sa.rows; i += 1) {
    for (let j = 0; j < sb.cols; j += 1) {
      let sum = 0;
      for (let k = 0; k < sa.cols; k += 1) {
        sum += a[i][k] * b[k][j];
      }
      out[i][j] = sum;
    }
  }
  return out;
};

const swapRows = (m: Matrix, i: number, j: number): void => {
  const tmp = m[i];
  m[i] = m[j];
  m[j] = tmp;
};

const identityMatrix = (n: number): Matrix => {
  const out = createMatrix(n, n, 0);
  for (let i = 0; i < n; i += 1) {
    out[i][i] = 1;
  }
  return out;
};

export const determinant = (matrix: Matrix): number | null => {
  if (!isSquare(matrix)) {
    return null;
  }
  const n = matrix.length;
  const a = cloneMatrix(matrix);
  let det = 1;
  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    let pivotValue = Math.abs(a[pivotRow][col]);
    for (let row = col + 1; row < n; row += 1) {
      const v = Math.abs(a[row][col]);
      if (v > pivotValue) {
        pivotValue = v;
        pivotRow = row;
      }
    }
    if (pivotValue === 0) {
      return 0;
    }
    if (pivotRow !== col) {
      swapRows(a, pivotRow, col);
      det *= -1;
    }
    const pivot = a[col][col];
    det *= pivot;
    for (let row = col + 1; row < n; row += 1) {
      const factor = a[row][col] / pivot;
      for (let k = col; k < n; k += 1) {
        a[row][k] -= factor * a[col][k];
      }
    }
  }
  return det;
};

export const inverse = (matrix: Matrix): Matrix | null => {
  if (!isSquare(matrix)) {
    return null;
  }
  const n = matrix.length;
  const a = cloneMatrix(matrix);
  const inv = identityMatrix(n);
  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    let best = Math.abs(a[pivotRow][col]);
    for (let row = col + 1; row < n; row += 1) {
      const v = Math.abs(a[row][col]);
      if (v > best) {
        best = v;
        pivotRow = row;
      }
    }
    if (best === 0) {
      return null;
    }
    if (pivotRow !== col) {
      swapRows(a, pivotRow, col);
      swapRows(inv, pivotRow, col);
    }
    const pivot = a[col][col];
    for (let k = 0; k < n; k += 1) {
      a[col][k] /= pivot;
      inv[col][k] /= pivot;
    }
    for (let row = 0; row < n; row += 1) {
      if (row === col) continue;
      const factor = a[row][col];
      if (factor === 0) continue;
      for (let k = 0; k < n; k += 1) {
        a[row][k] -= factor * a[col][k];
        inv[row][k] -= factor * inv[col][k];
      }
    }
  }
  return inv;
};

export const solveLinearSystem = (aMatrix: Matrix, bVector: number[]): SolveResult | null => {
  if (!isSquare(aMatrix)) {
    return null;
  }
  const n = aMatrix.length;
  if (bVector.length !== n) {
    return null;
  }
  const a = cloneMatrix(aMatrix);
  const b = [...bVector];
  for (let col = 0; col < n; col += 1) {
    let pivotRow = col;
    let best = Math.abs(a[pivotRow][col]);
    for (let row = col + 1; row < n; row += 1) {
      const v = Math.abs(a[row][col]);
      if (v > best) {
        best = v;
        pivotRow = row;
      }
    }
    if (best === 0) {
      return null;
    }
    if (pivotRow !== col) {
      swapRows(a, pivotRow, col);
      const tmp = b[pivotRow];
      b[pivotRow] = b[col];
      b[col] = tmp;
    }
    const pivot = a[col][col];
    for (let k = col; k < n; k += 1) {
      a[col][k] /= pivot;
    }
    b[col] /= pivot;
    for (let row = col + 1; row < n; row += 1) {
      const factor = a[row][col];
      if (factor === 0) continue;
      for (let k = col; k < n; k += 1) {
        a[row][k] -= factor * a[col][k];
      }
      b[row] -= factor * b[col];
    }
  }
  const x = new Array<number>(n).fill(0);
  for (let row = n - 1; row >= 0; row -= 1) {
    let sum = b[row];
    for (let col = row + 1; col < n; col += 1) {
      sum -= a[row][col] * x[col];
    }
    x[row] = sum;
  }
  return { solution: x };
};

export const matrixToCsv = (matrix: Matrix): string => {
  if (!isRectangular(matrix)) {
    return "";
  }
  return matrix
    .map((row) => row.map((value) => String(value)).join(","))
    .join("\n");
};


