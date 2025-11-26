"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import {
  type PixelGrid,
  type PixelColor,
  type Tool,
  applyEraser,
  applyFill,
  applyPencil,
  createPixelGrid,
  performRedo,
  performUndo,
  pushUndoState
} from "@/lib/pixelDrawingLogic";

type StoredPixelState = {
  rows: number;
  cols: number;
  grid: PixelGrid;
  currentColor: string;
  backgroundColor: string;
  showGridLines: boolean;
};

const STORAGE_KEY = "lht_pixel_grid_state_v1";

const defaultRows = 16;
const defaultCols = 16;

const defaultGrid = createPixelGrid(
  defaultRows,
  defaultCols
);

const DEFAULT_SWATCHES: string[] = [
  "#000000",
  "#ffffff",
  "#ef4444",
  "#22c55e",
  "#0ea5e9",
  "#a855f7",
  "#f97316"
];

const PixelDrawingGrid = () => {
  const [rows, setRows] = useState(defaultRows);
  const [cols, setCols] = useState(defaultCols);
  const [grid, setGrid] =
    useState<PixelGrid>(defaultGrid);
  const [currentColor, setCurrentColor] =
    useState("#111827");
  const [currentTool, setCurrentTool] =
    useState<Tool>("pencil");
  const [isDrawing, setIsDrawing] =
    useState(false);
  const [undoStack, setUndoStack] = useState<
    PixelGrid[]
  >([]);
  const [redoStack, setRedoStack] = useState<
    PixelGrid[]
  >([]);
  const [showGridLines, setShowGridLines] =
    useState(true);
  const [backgroundColor, setBackgroundColor] =
    useState("#ffffff");
  const [pendingRows, setPendingRows] =
    useState(defaultRows.toString());
  const [pendingCols, setPendingCols] =
    useState(defaultCols.toString());

  const gridContainerRef =
    useRef<HTMLDivElement | null>(null);
  const pointerDownGridRef =
    useRef<PixelGrid | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw =
      window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const stored = JSON.parse(
      raw
    ) as StoredPixelState;
    if (
      typeof stored.rows === "number" &&
      typeof stored.cols === "number" &&
      Array.isArray(stored.grid)
    ) {
      setRows(stored.rows);
      setCols(stored.cols);
      setGrid(stored.grid);
      setPendingRows(String(stored.rows));
      setPendingCols(String(stored.cols));
      if (typeof stored.currentColor === "string") {
        setCurrentColor(stored.currentColor);
      }
      if (
        typeof stored.backgroundColor ===
        "string"
      ) {
        setBackgroundColor(stored.backgroundColor);
      }
      if (
        typeof stored.showGridLines === "boolean"
      ) {
        setShowGridLines(stored.showGridLines);
      }
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stateToStore: StoredPixelState = {
      rows,
      cols,
      grid,
      currentColor,
      backgroundColor,
      showGridLines
    };
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(stateToStore)
    );
  }, [
    rows,
    cols,
    grid,
    currentColor,
    backgroundColor,
    showGridLines
  ]);

  const handlePointerDown = (
    row: number,
    col: number
  ) => {
    setIsDrawing(true);
    pointerDownGridRef.current = grid;
    setRedoStack([]);
    setGrid((previous) => {
      if (currentTool === "pencil") {
        return applyPencil(
          previous,
          row,
          col,
          currentColor
        );
      }
      if (currentTool === "eraser") {
        return applyEraser(previous, row, col);
      }
      return applyFill(
        previous,
        row,
        col,
        currentColor
      );
    });
  };

  const handlePointerEnter = (
    row: number,
    col: number
  ) => {
    if (!isDrawing) {
      return;
    }
    setGrid((previous) => {
      if (currentTool === "pencil") {
        return applyPencil(
          previous,
          row,
          col,
          currentColor
        );
      }
      if (currentTool === "eraser") {
        return applyEraser(previous, row, col);
      }
      return previous;
    });
  };

  const finishStroke = () => {
    if (!isDrawing) {
      return;
    }
    setIsDrawing(false);
    const before = pointerDownGridRef.current;
    pointerDownGridRef.current = null;
    if (!before) {
      return;
    }
    setUndoStack((previous) =>
      pushUndoState(previous, before)
    );
  };

  const handleUndo = () => {
    const result = performUndo(
      undoStack,
      redoStack,
      grid
    );
    setGrid(result.grid);
    setUndoStack(result.undoStack);
    setRedoStack(result.redoStack);
  };

  const handleRedo = () => {
    const result = performRedo(
      undoStack,
      redoStack,
      grid
    );
    setGrid(result.grid);
    setUndoStack(result.undoStack);
    setRedoStack(result.redoStack);
  };

  const handleClear = () => {
    setUndoStack((previous) =>
      pushUndoState(previous, grid)
    );
    setRedoStack([]);
    setGrid(
      createPixelGrid(
        rows,
        cols
      )
    );
  };

  const handleApplyGridSize = () => {
    const parsedRows = Number(pendingRows);
    const parsedCols = Number(pendingCols);
    const nextRows = Math.min(
      64,
      Math.max(8, Math.round(parsedRows))
    );
    const nextCols = Math.min(
      64,
      Math.max(8, Math.round(parsedCols))
    );
    if (
      nextRows === rows &&
      nextCols === cols
    ) {
      return;
    }
    setUndoStack((previous) =>
      pushUndoState(previous, grid)
    );
    setRedoStack([]);
    setRows(nextRows);
    setCols(nextCols);
    setGrid(createPixelGrid(nextRows, nextCols));
  };

  const handleExportPng = async () => {
    if (!gridContainerRef.current) {
      return;
    }
    const node = gridContainerRef.current;
    const canvas = await html2canvas(node, {
      backgroundColor
    });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    const timestamp =
      new Date().toISOString().slice(0, 19);
    link.href = dataUrl;
    link.download = `pixel-grid-${timestamp}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJson = () => {
    if (typeof window === "undefined") {
      return;
    }
    const payload = {
      rows,
      cols,
      grid
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], {
      type: "application/json"
    });
    const url = URL.createObjectURL(blob);
    const timestamp =
      new Date().toISOString().slice(0, 19);
    const link = document.createElement("a");
    link.href = url;
    link.download = `pixel-grid-${timestamp}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const handleImportJsonClick = () => {
    if (!fileInputRef.current) {
      return;
    }
    fileInputRef.current.value = "";
    fileInputRef.current.click();
  };

  const handleImportJsonChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      event.target.files &&
      event.target.files[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const text = reader.result;
      if (typeof text !== "string") {
        return;
      }
      const parsed = JSON.parse(text) as {
        rows?: number;
        cols?: number;
        grid?: PixelGrid;
      };
      if (
        !parsed.rows ||
        !parsed.cols ||
        !parsed.grid ||
        !Array.isArray(parsed.grid)
      ) {
        return;
      }
      const nextRows = Math.min(
        64,
        Math.max(8, parsed.rows)
      );
      const nextCols = Math.min(
        64,
        Math.max(8, parsed.cols)
      );
      if (
        parsed.grid.length !== nextRows ||
        parsed.grid[0].length !== nextCols
      ) {
        return;
      }
      setUndoStack([]);
      setRedoStack([]);
      setRows(nextRows);
      setCols(nextCols);
      setPendingRows(String(nextRows));
      setPendingCols(String(nextCols));
      setGrid(parsed.grid);
    };
    reader.readAsText(file);
  };

  const previewColors: PixelColor[] = useMemo(() => {
    const colors: PixelColor[] = [];
    for (let row = 0; row < grid.length; row += 1) {
      for (
        let col = 0;
        col < grid[row].length;
        col += 1
      ) {
        const color = grid[row][col];
        if (
          color &&
          !colors.includes(color)
        ) {
          colors.push(color);
        }
      }
    }
    return colors;
  }, [grid]);

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-800 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Controls
          </h2>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <p className="text-[11px] font-medium text-slate-700">
                  Grid size
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={8}
                    max={64}
                    value={pendingRows}
                    onChange={(event) =>
                      setPendingRows(
                        event.target.value
                      )
                    }
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <span>rows</span>
                  <input
                    type="number"
                    min={8}
                    max={64}
                    value={pendingCols}
                    onChange={(event) =>
                      setPendingCols(
                        event.target.value
                      )
                    }
                    className="w-20 rounded-md border border-slate-300 px-2 py-1 text-sm"
                  />
                  <span>cols</span>
                </div>
                <button
                  type="button"
                  onClick={handleApplyGridSize}
                  className="mt-1 inline-flex items-center rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Apply grid size
                </button>
                <p className="text-[10px] text-slate-500">
                  Resizing creates a new blank grid and keeps
                  your old layout in the undo history.
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-[11px] font-medium text-slate-700">
                  Tools
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentTool("pencil")
                    }
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${
                      currentTool === "pencil"
                        ? "bg-slate-900 text-slate-50"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    Pencil
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentTool("eraser")
                    }
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${
                      currentTool === "eraser"
                        ? "bg-slate-900 text-slate-50"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    Eraser
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentTool("fill")
                    }
                    className={`rounded-md px-3 py-1.5 text-[11px] font-semibold ${
                      currentTool === "fill"
                        ? "bg-slate-900 text-slate-50"
                        : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    Fill
                  </button>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-700">
                    Color
                  </p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={currentColor}
                      onChange={(event) =>
                        setCurrentColor(
                          event.target.value
                        )
                      }
                      className="h-8 w-10 cursor-pointer rounded border border-slate-300 bg-white"
                    />
                    <input
                      type="text"
                      value={currentColor}
                      onChange={(event) =>
                        setCurrentColor(
                          event.target.value
                        )
                      }
                      className="w-24 rounded-md border border-slate-300 px-2 py-1 text-xs font-mono"
                    />
                    <div className="flex flex-wrap gap-1">
                      {DEFAULT_SWATCHES.map(
                        (swatch) => (
                          <button
                            key={swatch}
                            type="button"
                            onClick={() =>
                              setCurrentColor(
                                swatch
                              )
                            }
                            className="h-5 w-5 rounded border border-slate-300"
                            style={{
                              backgroundColor:
                                swatch
                            }}
                          />
                        )
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium text-slate-700">
                    Background
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={backgroundColor}
                      onChange={(event) =>
                        setBackgroundColor(
                          event.target.value
                        )
                      }
                      className="h-7 w-9 cursor-pointer rounded border border-slate-300 bg-white"
                    />
                    <span className="text-[11px] text-slate-600">
                      Applied behind transparent
                      cells and exported images.
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleUndo}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100"
              >
                Undo
              </button>
              <button
                type="button"
                onClick={handleRedo}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100"
              >
                Redo
              </button>
              <button
                type="button"
                onClick={handleClear}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100"
              >
                Clear grid
              </button>
              <label className="ml-auto flex items-center gap-2 text-[11px] text-slate-700">
                <input
                  type="checkbox"
                  checked={showGridLines}
                  onChange={(event) =>
                    setShowGridLines(
                      event.target.checked
                    )
                  }
                  className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                />
                <span>Show grid lines</span>
              </label>
            </div>
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-slate-700">
                Export
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleExportPng}
                  className="rounded-md bg-emerald-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-emerald-400"
                >
                  Export PNG
                </button>
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="rounded-md bg-sky-500 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-sky-400"
                >
                  Export JSON
                </button>
                <button
                  type="button"
                  onClick={handleImportJsonClick}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-[11px] font-semibold text-slate-800 hover:bg-slate-100"
                >
                  Import JSON
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/json"
                  className="hidden"
                  onChange={handleImportJsonChange}
                />
              </div>
              <p className="text-[10px] text-slate-500">
                PNG exports include a small
                &ldquo;LifeHackToolbox.com&rdquo;
                watermark in the corner of the image.
              </p>
            </div>
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-slate-700">
                Colors used in this grid
              </p>
              {previewColors.length === 0 ? (
                <p className="text-[11px] text-slate-500">
                  Start drawing to see a summary of colors
                  here.
                </p>
              ) : (
                <div className="flex flex-wrap gap-1">
                  {previewColors.map((color) => (
                    <div
                      key={color ?? "none"}
                      className="flex items-center gap-1 rounded-full border border-slate-300 bg-white px-2 py-0.5 text-[10px] text-slate-700"
                    >
                      <span
                        className="h-3 w-3 rounded-full border border-slate-300"
                        style={{
                          backgroundColor:
                            color ?? "transparent"
                        }}
                      />
                      <span>
                        {color ?? "transparent"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Drawing grid
          </h2>
          <div
            ref={gridContainerRef}
            className="relative flex items-center justify-center rounded-xl border border-slate-200 bg-slate-100 p-3"
            style={{
              backgroundColor
            }}
          >
            <div
              className="grid max-h-[420px] max-w-full touch-none"
              style={{
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`
              }}
              onPointerUp={finishStroke}
              onPointerLeave={finishStroke}
            >
              {grid.map((rowValues, rowIndex) =>
                rowValues.map(
                  (cellColor, colIndex) => (
                    <button
                      key={`${rowIndex}-${colIndex}`}
                      type="button"
                      onPointerDown={() =>
                        handlePointerDown(
                          rowIndex,
                          colIndex
                        )
                      }
                      onPointerEnter={() =>
                        handlePointerEnter(
                          rowIndex,
                          colIndex
                        )
                      }
                      className={`aspect-square w-5 max-w-[2.1rem] ${
                        showGridLines
                          ? "border border-slate-200"
                          : "border border-transparent"
                      }`}
                      style={{
                        backgroundColor:
                          (cellColor ??
                            "transparent") as string
                      }}
                    />
                  )
                )
              )}
            </div>
            <div className="pointer-events-none absolute bottom-1 right-2 rounded-full bg-slate-900/70 px-2 py-0.5 text-[9px] font-medium text-slate-100">
              LifeHackToolbox.com
            </div>
          </div>
          <p className="text-[11px] text-slate-600">
            Click or tap to draw. Drag while holding down to
            paint continuous strokes. Use Fill to flood an
            area with the active color.
          </p>
        </section>
      </div>
    </div>
  );
};

export default PixelDrawingGrid;


