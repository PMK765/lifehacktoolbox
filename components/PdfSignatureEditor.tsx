"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PDFDocument, StandardFonts } from "pdf-lib";

const MAX_SUPPORTED_PAGES = 30;

type PlacementMode = "signature" | "text";

type SignatureSource = "drawn" | "typed" | null;

type TypedSignatureStyle = "normal" | "script";

type SignaturePlacement = {
  id: string;
  type: "signature";
  pageIndex: number;
  xNorm: number;
  yNorm: number;
  widthNorm: number;
  heightNorm: number;
  source: SignatureSource;
  text?: string;
};

type TextPlacement = {
  id: string;
  type: "text";
  pageIndex: number;
  xNorm: number;
  yNorm: number;
  fontSize: number;
  text: string;
};

type PdfPlacement = SignaturePlacement | TextPlacement;

type ViewportSize = {
  width: number;
  height: number;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Math.random());

const createTodayString = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function PdfSignatureEditor() {
  const [fileName, setFileName] = useState<string | null>(null);
  const [pdfBytes, setPdfBytes] = useState<ArrayBuffer | null>(null);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const [viewportSize, setViewportSize] = useState<ViewportSize | null>(null);

  const [placementMode, setPlacementMode] =
    useState<PlacementMode>("signature");
  const [placements, setPlacements] = useState<PdfPlacement[]>([]);

  const [activeSignatureSource, setActiveSignatureSource] =
    useState<SignatureSource>(null);
  const [typedSignature, setTypedSignature] = useState("");
  const [typedSignatureStyle, setTypedSignatureStyle] =
    useState<TypedSignatureStyle>("normal");

  const [formText, setFormText] = useState("");
  const [formTextFontSize, setFormTextFontSize] = useState(12);

  const [hasDrawing, setHasDrawing] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const isOverPageLimit =
    typeof pageCount === "number" && pageCount > MAX_SUPPORTED_PAGES;

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const numberInputClasses =
    "w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const placementsForSelectedPage = useMemo(
    () =>
      placements.filter(
        (placement) => placement.pageIndex === selectedPageIndex
      ),
    [placements, selectedPageIndex]
  );

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName(null);
      setPdfBytes(null);
      setPageCount(null);
      setPlacements([]);
      setLoadError(null);
      return;
    }

    if (file.type !== "application/pdf") {
      setLoadError("Please select a PDF file.");
      setFileName(null);
      setPdfBytes(null);
      setPageCount(null);
      setPlacements([]);
      return;
    }

    setLoadError(null);
    setFileName(file.name);
    setPlacements([]);
    setPageCount(null);
    setSelectedPageIndex(0);

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (!(result instanceof ArrayBuffer)) {
        setLoadError("Unable to read this PDF file.");
        setPdfBytes(null);
        setPageCount(null);
        return;
      }

      setPdfBytes(result);
      PDFDocument.load(result).then((doc) => {
        const count = doc.getPageCount();
        setPageCount(count);
      });
    };
    reader.readAsArrayBuffer(file);
  };

  useEffect(() => {
    if (!pdfBytes) {
      return;
    }

    setRenderError(null);

    let cancelled = false;

    const renderPage = async () => {
      const canvas = previewCanvasRef.current;
      if (!canvas) {
        return;
      }

      const pdfjsLib = await import("pdfjs-dist/build/pdf");
      if ("GlobalWorkerOptions" in pdfjsLib) {
        (pdfjsLib as unknown as { GlobalWorkerOptions: { workerSrc: string } })
          .GlobalWorkerOptions.workerSrc =
          "//cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.js";
      }

      const loadingTask = pdfjsLib.getDocument({ data: pdfBytes });
      const pdf = await loadingTask.promise;
      const pageIndex = selectedPageIndex + 1;
      const clampedIndex =
        pageIndex <= pdf.numPages ? pageIndex : pdf.numPages;
      const page = await pdf.getPage(clampedIndex);

      const containerWidth = canvas.parentElement?.clientWidth ?? 600;
      const viewport = page.getViewport({ scale: 1 });
      const scale = containerWidth / viewport.width;
      const scaledViewport = page.getViewport({ scale });

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      canvas.width = scaledViewport.width;
      canvas.height = scaledViewport.height;

      setViewportSize({
        width: scaledViewport.width,
        height: scaledViewport.height
      });

      const renderTask = page.render({
        canvasContext: context,
        viewport: scaledViewport
      });
      await renderTask.promise;

      if (cancelled) {
        return;
      }
    };

    renderPage().catch(() => {
      if (!cancelled) {
        setRenderError(
          "There was a problem rendering the PDF preview in your browser."
        );
      }
    });

    return () => {
      cancelled = true;
    };
  }, [pdfBytes, selectedPageIndex]);

  useEffect(() => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
  }, []);

  const startDrawing = (event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    lastPointRef.current = { x, y };
    setIsDrawing(true);
  };

  const draw = (event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawing) {
      return;
    }
    const canvas = signatureCanvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    const lastPoint = lastPointRef.current;
    if (!lastPoint) {
      return;
    }
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    context.strokeStyle = "#0f172a";
    context.lineWidth = 2;
    context.lineCap = "round";
    context.beginPath();
    context.moveTo(lastPoint.x, lastPoint.y);
    context.lineTo(x, y);
    context.stroke();

    lastPointRef.current = { x, y };
    setHasDrawing(true);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPointRef.current = null;
  };

  const clearSignature = () => {
    const canvas = signatureCanvasRef.current;
    if (!canvas) {
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    setHasDrawing(false);
    if (activeSignatureSource === "drawn") {
      setActiveSignatureSource(null);
    }
  };

  const handlePreviewClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!pdfBytes || !viewportSize || isOverPageLimit) {
      return;
    }
    const canvas = previewCanvasRef.current;
    if (!canvas) {
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (x < 0 || y < 0 || x > rect.width || y > rect.height) {
      return;
    }

    const xNorm = x / rect.width;
    const yNorm = y / rect.height;

    if (placementMode === "signature") {
      if (activeSignatureSource === "drawn" && hasDrawing) {
        const widthNorm = 0.3;
        const heightNorm =
          (widthNorm * viewportSize.height) / viewportSize.width;
        const placement: SignaturePlacement = {
          id: createId(),
          type: "signature",
          pageIndex: selectedPageIndex,
          xNorm,
          yNorm,
          widthNorm,
          heightNorm,
          source: "drawn"
        };
        setPlacements((previous) => [...previous, placement]);
      } else if (
        activeSignatureSource === "typed" &&
        typedSignature.trim().length > 0
      ) {
        const widthNorm = 0.3;
        const heightNorm = 0.06;
        const placement: SignaturePlacement = {
          id: createId(),
          type: "signature",
          pageIndex: selectedPageIndex,
          xNorm,
          yNorm,
          widthNorm,
          heightNorm,
          source: "typed",
          text: typedSignature.trim()
        };
        setPlacements((previous) => [...previous, placement]);
      }
    } else {
      if (formText.trim().length === 0) {
        return;
      }
      const placement: TextPlacement = {
        id: createId(),
        type: "text",
        pageIndex: selectedPageIndex,
        xNorm,
        yNorm,
        fontSize: formTextFontSize,
        text: formText.trim()
      };
      setPlacements((previous) => [...previous, placement]);
    }
  };

  const handleRemovePlacement = (id: string) => {
    setPlacements((previous) =>
      previous.filter((placement) => placement.id !== id)
    );
  };

  const handleApplyAndDownload = () => {
    if (!pdfBytes || placements.length === 0 || isOverPageLimit) {
      return;
    }

    const run = async () => {
      const pdfDoc = await PDFDocument.load(pdfBytes);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const pages = pdfDoc.getPages();

      let drawnSignatureImage:
        | ReturnType<typeof pdfDoc.embedPng>
        | null = null;

      const hasDrawnSignaturePlacement = placements.some(
        (placement) =>
          placement.type === "signature" && placement.source === "drawn"
      );

      if (hasDrawnSignaturePlacement && signatureCanvasRef.current) {
        const canvas = signatureCanvasRef.current;
        const dataUrl = canvas.toDataURL("image/png");
        const response = await fetch(dataUrl);
        const pngBytes = await response.arrayBuffer();
        drawnSignatureImage = await pdfDoc.embedPng(pngBytes);
      }

      placements.forEach((placement) => {
        const page =
          placement.pageIndex >= 0 &&
          placement.pageIndex < pages.length
            ? pages[placement.pageIndex]
            : pages[0];
        const { width, height } = page.getSize();

        const xFromLeft = placement.xNorm * width;
        const yFromTop = placement.yNorm * height;
        const x = xFromLeft;
        const y = height - yFromTop;

        if (placement.type === "signature") {
          if (placement.source === "drawn" && drawnSignatureImage) {
            const drawWidth = placement.widthNorm * width;
            const drawHeight = placement.heightNorm * height;
            const drawX = x - drawWidth / 2;
            const drawY = y - drawHeight / 2;
            page.drawImage(drawnSignatureImage, {
              x: drawX,
              y: drawY,
              width: drawWidth,
              height: drawHeight
            });
          } else if (
            placement.source === "typed" &&
            placement.text &&
            placement.text.length > 0
          ) {
            const fontSize =
              typedSignatureStyle === "script" ? 18 : 14;
            page.drawText(placement.text, {
              x,
              y: y - fontSize,
              size: fontSize,
              font: helvetica
            });
          }
        } else if (placement.type === "text") {
          const size = placement.fontSize;
          page.drawText(placement.text, {
            x,
            y: y - size,
            size,
            font: helvetica
          });
        }
      });

      const editedBytes = await pdfDoc.save();
      const blob = new Blob([editedBytes], {
        type: "application/pdf"
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const baseName =
        fileName && fileName.toLowerCase().endsWith(".pdf")
          ? fileName.slice(0, -4)
          : fileName ?? `document-${createTodayString()}`;
      link.download = `signed-${baseName}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    };

    run();
  };

  const totalPlacements = placements.length;
  const canApplyChanges =
    !!pdfBytes && totalPlacements > 0 && !isOverPageLimit;

  return (
    <div className="space-y-8">
      <section
        aria-label="PDF upload"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Upload PDF
          </h2>
          <p className="text-xs text-slate-600">
            Your file is processed entirely in your browser. It is not uploaded to a
            server. For performance reasons, this editor currently supports PDFs up to{" "}
            {MAX_SUPPORTED_PAGES} pages.
          </p>
        </div>
        <div className="space-y-3">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-800 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
          />
          {fileName && (
            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-700">
              <span className="font-medium">File:</span>
              <span className="truncate">{fileName}</span>
              {typeof pageCount === "number" && (
                <span>
                  · Pages: {pageCount}{" "}
                  {isOverPageLimit && (
                    <span className="ml-1 text-amber-700">
                      (over limit of {MAX_SUPPORTED_PAGES})
                    </span>
                  )}
                </span>
              )}
            </div>
          )}
          {loadError && (
            <p className="text-xs text-red-600">{loadError}</p>
          )}
          {isOverPageLimit && (
            <p className="text-xs text-amber-700">
              This version of the editor supports up to {MAX_SUPPORTED_PAGES} pages. To
              sign this document, split it into smaller parts first and upload a shorter
              PDF here.
            </p>
          )}
        </div>
      </section>
      <section className="grid gap-4 lg:grid-cols-[minmax(0,260px)_minmax(0,1.5fr)_minmax(0,260px)]">
        <div
          aria-label="Placement tools"
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Tools
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <button
                type="button"
                onClick={() => setPlacementMode("signature")}
                className={`rounded-md border px-3 py-1.5 transition ${
                  placementMode === "signature"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                Signature mode
              </button>
              <button
                type="button"
                onClick={() => setPlacementMode("text")}
                className={`rounded-md border px-3 py-1.5 transition ${
                  placementMode === "text"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                    : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                Text mode
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Click on the PDF preview to place the active signature or text on the
              current page.
            </p>
          </div>
          {placementMode === "signature" ? (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">
                  Drawn signature
                </p>
                <div className="rounded-md border border-slate-300 bg-slate-50 p-2">
                  <canvas
                    ref={signatureCanvasRef}
                    width={400}
                    height={140}
                    className="h-28 w-full cursor-crosshair rounded border border-slate-300 bg-white"
                    onPointerDown={startDrawing}
                    onPointerMove={draw}
                    onPointerUp={stopDrawing}
                    onPointerLeave={stopDrawing}
                  />
                  <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setActiveSignatureSource(
                            hasDrawing ? "drawn" : activeSignatureSource
                          )
                        }
                        disabled={!hasDrawing}
                        className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                          activeSignatureSource === "drawn"
                            ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                            : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                        } ${!hasDrawing ? "opacity-60" : ""}`}
                      >
                        Use drawn signature
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="rounded-md border border-slate-300 bg-white px-2 py-1 text-[11px] font-medium text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-700"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">
                  Typed signature
                </p>
                <input
                  type="text"
                  value={typedSignature}
                  onChange={(event) =>
                    setTypedSignature(event.target.value)
                  }
                  className={inputBaseClasses}
                  placeholder="Type your name"
                />
                <div className="mt-1 grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-2">
                  <div className="space-y-1">
                    <label
                      htmlFor="typedStyle"
                      className="text-[11px] font-medium text-slate-700"
                    >
                      Style
                    </label>
                    <div className="relative">
                      <select
                        id="typedStyle"
                        value={typedSignatureStyle}
                        onChange={(event) =>
                          setTypedSignatureStyle(
                            event.target.value as TypedSignatureStyle
                          )
                        }
                        className={selectBaseClasses}
                      >
                        <option value="normal">Normal</option>
                        <option value="script">Script-like</option>
                      </select>
                      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                        <svg
                          className="h-4 w-4 text-slate-400"
                          viewBox="0 0 20 20"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M6 8l4 4 4-4"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-medium text-slate-700">
                      Preview
                    </p>
                    <div
                      className={`flex h-9 items-center rounded-md border border-slate-200 px-2 text-xs ${
                        typedSignatureStyle === "script"
                          ? "italic"
                          : "font-medium"
                      }`}
                    >
                      {typedSignature.trim().length === 0
                        ? "Type your name above"
                        : typedSignature}
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setActiveSignatureSource(
                      typedSignature.trim().length > 0
                        ? "typed"
                        : activeSignatureSource
                    )
                  }
                  disabled={typedSignature.trim().length === 0}
                  className={`mt-2 rounded-md border px-2 py-1 text-xs font-medium transition ${
                    activeSignatureSource === "typed"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  } ${
                    typedSignature.trim().length === 0 ? "opacity-60" : ""
                  }`}
                >
                  Use typed signature
                </button>
              </div>
              <p className="text-xs text-slate-600">
                With signature mode active, click anywhere on the PDF preview to place
                the current signature on that page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="space-y-1">
                <p className="text-xs font-medium text-slate-700">
                  Form text
                </p>
                <textarea
                  value={formText}
                  onChange={(event) => setFormText(event.target.value)}
                  rows={3}
                  className={`${inputBaseClasses} resize-none`}
                  placeholder="Enter a short label, name, date, or note to place on the PDF."
                />
              </div>
              <div className="space-y-1">
                <label
                  htmlFor="formFontSize"
                  className="text-xs font-medium text-slate-700"
                >
                  Font size
                </label>
                <select
                  id="formFontSize"
                  value={formTextFontSize}
                  onChange={(event) =>
                    setFormTextFontSize(Number.parseInt(event.target.value, 10))
                  }
                  className={selectBaseClasses}
                >
                  {[10, 12, 14, 16, 18].map((size) => (
                    <option key={size} value={size}>
                      {size} pt
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-slate-600">
                With text mode active, click on the PDF preview to place the current text
                at that position. Use multiple clicks to add several fields.
              </p>
            </div>
          )}
        </div>
        <div
          aria-label="PDF preview"
          className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Preview
            </h2>
            <div className="flex items-center gap-2 text-xs text-slate-700">
              {typeof pageCount === "number" && pageCount > 0 ? (
                <>
                  <span>Page</span>
                  <div className="relative">
                    <select
                      value={selectedPageIndex}
                      onChange={(event) =>
                        setSelectedPageIndex(
                          Number.parseInt(event.target.value, 10)
                        )
                      }
                      className={selectBaseClasses}
                    >
                      {Array.from({ length: pageCount }).map((_, index) => (
                        <option key={index} value={index}>
                          {index + 1}
                        </option>
                      ))}
                    </select>
                    <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg
                        className="h-4 w-4 text-slate-400"
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M6 8l4 4 4-4"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                  </div>
                  <span>of {pageCount}</span>
                </>
              ) : (
                <span>No PDF loaded yet</span>
              )}
            </div>
          </div>
          <div className="relative flex min-h-[260px] items-center justify-center overflow-auto rounded-md border border-slate-200 bg-slate-50 p-2">
            {renderError ? (
              <p className="text-xs text-red-600">{renderError}</p>
            ) : !pdfBytes ? (
              <p className="text-sm text-slate-600">
                Upload a PDF above to see a preview and place signatures or text.
              </p>
            ) : isOverPageLimit ? (
              <p className="text-sm text-slate-600">
                This PDF has more than {MAX_SUPPORTED_PAGES} pages. Split it into smaller
                parts before editing.
              </p>
            ) : (
              <div
                className="relative max-h-[80vh] w-full max-w-full cursor-crosshair"
                onClick={handlePreviewClick}
              >
                <canvas
                  ref={previewCanvasRef}
                  className="mx-auto block max-h-[80vh] w-full rounded-md bg-white shadow-sm"
                />
                {viewportSize &&
                  placementsForSelectedPage.map((placement) => {
                    const left = placement.xNorm * viewportSize.width;
                    const top = placement.yNorm * viewportSize.height;
                    if (placement.type === "signature") {
                      const width = placement.widthNorm * viewportSize.width;
                      const height =
                        placement.heightNorm * viewportSize.height;
                      return (
                        <div
                          key={placement.id}
                          className="pointer-events-none absolute border border-emerald-400/70 bg-emerald-50/40"
                          style={{
                            left: left - width / 2,
                            top: top - height / 2,
                            width,
                            height
                          }}
                        />
                      );
                    }
                    const approximateWidth =
                      (placement.text.length / 12) *
                      (placement.fontSize * 6);
                    const height = placement.fontSize * 1.6;
                    return (
                      <div
                        key={placement.id}
                        className="pointer-events-none absolute rounded border border-sky-400/70 bg-sky-50/60 px-1 text-[10px]"
                        style={{
                          left: left - approximateWidth / 2,
                          top: top - height / 2,
                          minWidth: 40,
                          maxWidth: 160
                        }}
                      >
                        {placement.text}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
        <div
          aria-label="Placements and actions"
          className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Placements
            </h2>
            <p className="text-xs text-slate-600">
              Each time you click on the preview, a new placement is added here. Remove
              any items you do not want before applying changes.
            </p>
          </div>
          {placements.length === 0 ? (
            <p className="text-sm text-slate-600">
              No placements yet. Choose signature or text mode, then click on the PDF
              preview to add items.
            </p>
          ) : (
            <ul className="space-y-2 text-xs text-slate-800">
              {placements.map((placement) => (
                <li
                  key={placement.id}
                  className="flex items-start justify-between gap-2 rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5"
                >
                  <div className="space-y-0.5">
                    <p className="font-medium text-slate-900">
                      Page {placement.pageIndex + 1} ·{" "}
                      {placement.type === "signature"
                        ? "Signature"
                        : "Text"}
                    </p>
                    {placement.type === "signature" ? (
                      <p className="text-[11px] text-slate-700">
                        {placement.source === "drawn"
                          ? "Drawn signature"
                          : placement.text
                          ? placement.text
                          : "Typed signature"}
                      </p>
                    ) : (
                      <p className="truncate text-[11px] text-slate-700">
                        {placement.text}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePlacement(placement.id)}
                    className="mt-0.5 inline-flex items-center rounded-md border border-slate-300 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-700 shadow-sm transition hover:border-red-300 hover:text-red-700"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleApplyAndDownload}
              disabled={!canApplyChanges}
              className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                canApplyChanges
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "cursor-not-allowed bg-slate-200 text-slate-500"
              }`}
            >
              Apply changes &amp; download PDF
            </button>
            <p className="text-[11px] text-slate-600">
              The updated PDF will be generated in your browser and saved with a new file
              name. Keep a copy of your original file if you may need to revert later.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}


