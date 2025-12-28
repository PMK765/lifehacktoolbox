"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Matrix } from "@/lib/matrixLogic";
import {
  addMatrices,
  createMatrix,
  determinant,
  inverse,
  matrixToCsv,
  multiplyMatrices,
  scalarMultiply,
  solveLinearSystem,
  subtractMatrices,
  transpose
} from "@/lib/matrixLogic";

type MatrixId = "A" | "B";
type OperationId =
  | "add"
  | "subtract"
  | "multiply"
  | "scalarA"
  | "scalarB"
  | "transposeA"
  | "transposeB"
  | "detA"
  | "detB"
  | "invA"
  | "invB"
  | "solveAxEqb";

type StoredState = {
  rowsA: number;
  colsA: number;
  rowsB: number;
  colsB: number;
  matrixA: Matrix;
  matrixB: Matrix;
  operation: OperationId;
  scalar: number;
  vectorB: number[];
};

const STORAGE_KEY = "lht_matrix_calculator_state_v1";

const clampInt = (value: number, min: number, max: number): number => {
  if (!Number.isFinite(value)) return min;
  const rounded = Math.round(value);
  if (rounded < min) return min;
  if (rounded > max) return max;
  return rounded;
};

const formatNumber = (value: number): string => {
  if (!Number.isFinite(value)) return "—";
  const abs = Math.abs(value);
  if (abs >= 1000 || (abs > 0 && abs < 0.001)) {
    return value.toExponential(3);
  }
  return value.toFixed(6).replace(/\.?0+$/, "");
};

const parseCellNumber = (text: string): number => {
  const trimmed = text.trim();
  if (!trimmed) return 0;
  const normalized = trimmed.replace(/,/g, "");
  const value = Number(normalized);
  return Number.isFinite(value) ? value : 0;
};

const resizeMatrix = (matrix: Matrix, rows: number, cols: number): Matrix => {
  const next = createMatrix(rows, cols, 0);
  for (let r = 0; r < Math.min(rows, matrix.length); r += 1) {
    for (let c = 0; c < Math.min(cols, matrix[0].length); c += 1) {
      next[r][c] = matrix[r][c];
    }
  }
  return next;
};

const buildEmptyRefs = (rows: number, cols: number) => {
  const refs: (HTMLInputElement | null)[][] = [];
  for (let r = 0; r < rows; r += 1) {
    const row: (HTMLInputElement | null)[] = [];
    for (let c = 0; c < cols; c += 1) {
      row.push(null);
    }
    refs.push(row);
  }
  return refs;
};

const MatrixCalculator = () => {
  const [rowsA, setRowsA] = useState(3);
  const [colsA, setColsA] = useState(3);
  const [rowsB, setRowsB] = useState(3);
  const [colsB, setColsB] = useState(3);
  const [matrixA, setMatrixA] = useState<Matrix>(() =>
    createMatrix(3, 3, 0)
  );
  const [matrixB, setMatrixB] = useState<Matrix>(() =>
    createMatrix(3, 3, 0)
  );
  const [operation, setOperation] = useState<OperationId>("add");
  const [scalar, setScalar] = useState(2);
  const [vectorB, setVectorB] = useState<number[]>([0, 0, 0]);
  const [copiedMessage, setCopiedMessage] = useState<string | null>(null);

  const aRefs = useRef<(HTMLInputElement | null)[][]>(
    buildEmptyRefs(rowsA, colsA)
  );
  const bRefs = useRef<(HTMLInputElement | null)[][]>(
    buildEmptyRefs(rowsB, colsB)
  );

  useEffect(() => {
    aRefs.current = buildEmptyRefs(rowsA, colsA);
  }, [rowsA, colsA]);

  useEffect(() => {
    bRefs.current = buildEmptyRefs(rowsB, colsB);
  }, [rowsB, colsB]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as StoredState;
    if (
      typeof parsed.rowsA === "number" &&
      typeof parsed.colsA === "number" &&
      typeof parsed.rowsB === "number" &&
      typeof parsed.colsB === "number" &&
      Array.isArray(parsed.matrixA) &&
      Array.isArray(parsed.matrixB)
    ) {
      const nextRowsA = clampInt(parsed.rowsA, 1, 6);
      const nextColsA = clampInt(parsed.colsA, 1, 6);
      const nextRowsB = clampInt(parsed.rowsB, 1, 6);
      const nextColsB = clampInt(parsed.colsB, 1, 6);
      setRowsA(nextRowsA);
      setColsA(nextColsA);
      setRowsB(nextRowsB);
      setColsB(nextColsB);
      setMatrixA(resizeMatrix(parsed.matrixA, nextRowsA, nextColsA));
      setMatrixB(resizeMatrix(parsed.matrixB, nextRowsB, nextColsB));
      if (typeof parsed.scalar === "number" && Number.isFinite(parsed.scalar)) {
        setScalar(parsed.scalar);
      }
      if (Array.isArray(parsed.vectorB)) {
        setVectorB(parsed.vectorB.map((v) => (Number.isFinite(v) ? v : 0)).slice(0, nextRowsA));
      }
      setOperation(parsed.operation ?? "add");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stateToStore: StoredState = {
      rowsA,
      colsA,
      rowsB,
      colsB,
      matrixA,
      matrixB,
      operation,
      scalar,
      vectorB
    };
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToStore));
  }, [rowsA, colsA, rowsB, colsB, matrixA, matrixB, operation, scalar, vectorB]);

  useEffect(() => {
    setMatrixA((prev) => resizeMatrix(prev, rowsA, colsA));
  }, [rowsA, colsA]);

  useEffect(() => {
    setMatrixB((prev) => resizeMatrix(prev, rowsB, colsB));
  }, [rowsB, colsB]);

  useEffect(() => {
    setVectorB((prev) => {
      const nextLength = rowsA;
      const next = new Array<number>(nextLength).fill(0);
      for (let i = 0; i < Math.min(prev.length, nextLength); i += 1) {
        next[i] = prev[i];
      }
      return next;
    });
  }, [rowsA]);

  const handleCellChange = (
    id: MatrixId,
    row: number,
    col: number,
    value: string
  ) => {
    const numeric = parseCellNumber(value);
    if (id === "A") {
      setMatrixA((prev) => {
        const next = prev.map((r) => [...r]);
        if (next[row] && typeof next[row][col] === "number") {
          next[row][col] = numeric;
        }
        return next;
      });
    } else {
      setMatrixB((prev) => {
        const next = prev.map((r) => [...r]);
        if (next[row] && typeof next[row][col] === "number") {
          next[row][col] = numeric;
        }
        return next;
      });
    }
  };

  const handleKeyNav = (
    id: MatrixId,
    row: number,
    col: number,
    event: React.KeyboardEvent<HTMLInputElement>
  ) => {
    const key = event.key;
    const refs = id === "A" ? aRefs.current : bRefs.current;
    const maxRow = refs.length - 1;
    const maxCol = refs[0].length - 1;
    const focus = (r: number, c: number) => {
      const target = refs[r]?.[c];
      if (target) {
        target.focus();
        target.select();
      }
    };

    if (key === "ArrowUp") {
      event.preventDefault();
      focus(Math.max(0, row - 1), col);
    } else if (key === "ArrowDown") {
      event.preventDefault();
      focus(Math.min(maxRow, row + 1), col);
    } else if (key === "ArrowLeft") {
      event.preventDefault();
      focus(row, Math.max(0, col - 1));
    } else if (key === "ArrowRight") {
      event.preventDefault();
      focus(row, Math.min(maxCol, col + 1));
    } else if (key === "Enter") {
      event.preventDefault();
      focus(Math.min(maxRow, row + 1), col);
    }
  };

  const operationResult = useMemo(() => {
    const error = (message: string) => ({ kind: "error" as const, message });
    const matrix = (m: Matrix, label: string) => ({ kind: "matrix" as const, matrix: m, label });
    const scalarValue = (value: number, label: string) => ({
      kind: "scalar" as const,
      value,
      label
    });
    const vectorValue = (values: number[], label: string) => ({
      kind: "vector" as const,
      values,
      label
    });

    if (operation === "add") {
      const out = addMatrices(matrixA, matrixB);
      return out ? matrix(out, "A + B") : error("Add requires A and B to have the same dimensions.");
    }
    if (operation === "subtract") {
      const out = subtractMatrices(matrixA, matrixB);
      return out ? matrix(out, "A − B") : error("Subtract requires A and B to have the same dimensions.");
    }
    if (operation === "multiply") {
      const out = multiplyMatrices(matrixA, matrixB);
      return out ? matrix(out, "A × B") : error("Multiply requires A columns to equal B rows.");
    }
    if (operation === "scalarA") {
      const out = scalarMultiply(matrixA, scalar);
      return out ? matrix(out, `${formatNumber(scalar)} × A`) : error("Scalar multiply requires a valid scalar.");
    }
    if (operation === "scalarB") {
      const out = scalarMultiply(matrixB, scalar);
      return out ? matrix(out, `${formatNumber(scalar)} × B`) : error("Scalar multiply requires a valid scalar.");
    }
    if (operation === "transposeA") {
      const out = transpose(matrixA);
      return out ? matrix(out, "Aᵀ") : error("Transpose requires a rectangular matrix.");
    }
    if (operation === "transposeB") {
      const out = transpose(matrixB);
      return out ? matrix(out, "Bᵀ") : error("Transpose requires a rectangular matrix.");
    }
    if (operation === "detA") {
      const out = determinant(matrixA);
      return typeof out === "number" ? scalarValue(out, "det(A)") : error("Determinant requires A to be square.");
    }
    if (operation === "detB") {
      const out = determinant(matrixB);
      return typeof out === "number" ? scalarValue(out, "det(B)") : error("Determinant requires B to be square.");
    }
    if (operation === "invA") {
      const out = inverse(matrixA);
      return out ? matrix(out, "A⁻¹") : error("Inverse requires A to be square and non-singular.");
    }
    if (operation === "invB") {
      const out = inverse(matrixB);
      return out ? matrix(out, "B⁻¹") : error("Inverse requires B to be square and non-singular.");
    }
    const solved = solveLinearSystem(matrixA, vectorB);
    return solved
      ? vectorValue(solved.solution, "Solution x for Ax = b")
      : error("Solve requires A to be square and b length to match rows. A must be non-singular.");
  }, [matrixA, matrixB, operation, scalar, vectorB]);

  const handleCopyJson = () => {
    if (typeof window === "undefined") {
      return;
    }
    const payload =
      operationResult.kind === "matrix"
        ? { type: "matrix", label: operationResult.label, matrix: operationResult.matrix }
        : operationResult.kind === "vector"
        ? { type: "vector", label: operationResult.label, values: operationResult.values }
        : operationResult.kind === "scalar"
        ? { type: "scalar", label: operationResult.label, value: operationResult.value }
        : { type: "error", message: operationResult.message };

    const text = JSON.stringify(payload, null, 2);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard
        .writeText(text)
        .then(() => setCopiedMessage("Copied JSON."))
        .catch(() => setCopiedMessage("Could not copy JSON."));
    } else {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopiedMessage("Copied JSON.");
    }
    window.setTimeout(() => setCopiedMessage(null), 1200);
  };

  const handleDownloadCsv = () => {
    if (typeof window === "undefined") {
      return;
    }
    const csv =
      operationResult.kind === "matrix"
        ? matrixToCsv(operationResult.matrix)
        : operationResult.kind === "vector"
        ? operationResult.values.map((v) => String(v)).join("\n")
        : operationResult.kind === "scalar"
        ? String(operationResult.value)
        : "";

    if (!csv) {
      return;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `matrix-result-${stamp}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const resetMatrices = () => {
    setMatrixA(createMatrix(rowsA, colsA, 0));
    setMatrixB(createMatrix(rowsB, colsB, 0));
    setVectorB(new Array<number>(rowsA).fill(0));
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Matrices A and B
            </h2>
            <p className="text-[11px] text-slate-600">
              Tip: use arrow keys to move between cells. Enter moves down.
            </p>
          </header>

          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-900">Matrix A</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <label className="inline-flex items-center gap-1">
                    <span>Rows</span>
                    <select
                      value={rowsA}
                      onChange={(e) => setRowsA(clampInt(Number(e.target.value), 1, 6))}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <span>Cols</span>
                    <select
                      value={colsA}
                      onChange={(e) => setColsA(clampInt(Number(e.target.value), 1, 6))}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${colsA}, minmax(0, 1fr))` }}
                >
                  {matrixA.map((row, r) =>
                    row.map((value, c) => (
                      <input
                        key={`A-${r}-${c}`}
                        ref={(el) => {
                          aRefs.current[r][c] = el;
                        }}
                        value={String(value)}
                        onChange={(e) => handleCellChange("A", r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyNav("A", r, c, e)}
                        className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 shadow-sm"
                        inputMode="decimal"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-semibold text-slate-900">Matrix B</p>
                <div className="flex items-center gap-2 text-[11px] text-slate-600">
                  <label className="inline-flex items-center gap-1">
                    <span>Rows</span>
                    <select
                      value={rowsB}
                      onChange={(e) => setRowsB(clampInt(Number(e.target.value), 1, 6))}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="inline-flex items-center gap-1">
                    <span>Cols</span>
                    <select
                      value={colsB}
                      onChange={(e) => setColsB(clampInt(Number(e.target.value), 1, 6))}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900"
                    >
                      {[1, 2, 3, 4, 5, 6].map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <div className="overflow-auto rounded-xl border border-slate-200 bg-slate-50 p-3">
                <div
                  className="grid gap-1"
                  style={{ gridTemplateColumns: `repeat(${colsB}, minmax(0, 1fr))` }}
                >
                  {matrixB.map((row, r) =>
                    row.map((value, c) => (
                      <input
                        key={`B-${r}-${c}`}
                        ref={(el) => {
                          bRefs.current[r][c] = el;
                        }}
                        value={String(value)}
                        onChange={(e) => handleCellChange("B", r, c, e.target.value)}
                        onKeyDown={(e) => handleKeyNav("B", r, c, e)}
                        className="h-10 rounded-md border border-slate-300 bg-white px-2 text-sm text-slate-900 shadow-sm"
                        inputMode="decimal"
                      />
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetMatrices}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Clear matrices
            </button>
            <p className="ml-auto text-[11px] text-slate-500">
              Saved locally in your browser.
            </p>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Operation & results
            </h2>
            <p className="text-[11px] text-slate-600">
              Choose an operation. Results update instantly.
            </p>
          </header>

          <label className="space-y-1 text-xs text-slate-700">
            <span className="font-medium text-slate-700">Operation</span>
            <select
              value={operation}
              onChange={(e) => setOperation(e.target.value as OperationId)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            >
              <option value="add">A + B</option>
              <option value="subtract">A − B</option>
              <option value="multiply">A × B</option>
              <option value="scalarA">k × A</option>
              <option value="scalarB">k × B</option>
              <option value="transposeA">Transpose A</option>
              <option value="transposeB">Transpose B</option>
              <option value="detA">det(A)</option>
              <option value="detB">det(B)</option>
              <option value="invA">A⁻¹</option>
              <option value="invB">B⁻¹</option>
              <option value="solveAxEqb">Solve Ax = b</option>
            </select>
          </label>

          {(operation === "scalarA" || operation === "scalarB") && (
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Scalar k</span>
              <input
                value={String(scalar)}
                onChange={(e) => setScalar(parseCellNumber(e.target.value))}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                inputMode="decimal"
              />
            </label>
          )}

          {operation === "solveAxEqb" && (
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-[11px] font-semibold text-slate-700">
                Vector b (length {rowsA})
              </p>
              <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(2, minmax(0, 1fr))" }}>
                {vectorB.map((value, i) => (
                  <label key={i} className="space-y-1 text-[11px] text-slate-600">
                    <span>b{i + 1}</span>
                    <input
                      value={String(value)}
                      onChange={(e) => {
                        const v = parseCellNumber(e.target.value);
                        setVectorB((prev) => {
                          const next = [...prev];
                          next[i] = v;
                          return next;
                        });
                      }}
                      className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
                      inputMode="decimal"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            {operationResult.kind === "error" ? (
              <p className="text-sm text-rose-700">{operationResult.message}</p>
            ) : operationResult.kind === "scalar" ? (
              <div className="space-y-1">
                <p className="text-[11px] font-semibold text-slate-700">
                  {operationResult.label}
                </p>
                <p className="text-lg font-semibold text-slate-900 font-mono">
                  {formatNumber(operationResult.value)}
                </p>
              </div>
            ) : operationResult.kind === "vector" ? (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-700">
                  {operationResult.label}
                </p>
                <div className="space-y-1">
                  {operationResult.values.map((v, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm"
                    >
                      <span className="text-slate-600">x{i + 1}</span>
                      <span className="font-mono text-slate-900">
                        {formatNumber(v)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[11px] font-semibold text-slate-700">
                  {operationResult.label}
                </p>
                <div className="overflow-auto rounded-md border border-slate-200 bg-white p-2">
                  <table className="border-collapse text-sm">
                    <tbody>
                      {operationResult.matrix.map((row, r) => (
                        <tr key={r}>
                          {row.map((v, c) => (
                            <td
                              key={c}
                              className="border border-slate-100 px-3 py-2 font-mono text-slate-900"
                            >
                              {formatNumber(v)}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleCopyJson}
              className="rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              Copy result JSON
            </button>
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Download CSV
            </button>
            {copiedMessage && (
              <span className="text-[11px] text-slate-600">{copiedMessage}</span>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default MatrixCalculator;


