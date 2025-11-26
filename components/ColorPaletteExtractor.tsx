"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type { PaletteColor, RGB, HSL } from "@/lib/colorUtils";
import {
  extractPaletteFromImageData,
  rgbToHex,
  rgbToHsl
} from "@/lib/colorUtils";

type ColorFormats = {
  hex: string;
  rgb: RGB;
  hsl: HSL;
};

type PaletteJson = {
  toolName: "Color Picker & Palette Extractor";
  generatedAt: string;
  image?: {
    width: number;
    height: number;
    fileName?: string;
  };
  colorCount: number;
  colors: {
    hex: string;
    rgb: RGB;
    hsl: HSL;
    fraction: number;
  }[];
};

const STORAGE_COLOR_COUNT_KEY = "lht_color_palette_color_count_v1";

const formatRgbString = (rgb: RGB): string =>
  `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;

const formatHslString = (hsl: HSL): string =>
  `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;

const ColorPaletteExtractor = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageName, setImageName] = useState<string | undefined>();
  const [imageSize, setImageSize] = useState<{
    width: number;
    height: number;
  } | null>(null);
  const [colorCount, setColorCount] = useState<number>(6);
  const [palette, setPalette] = useState<PaletteColor[]>([]);
  const [selectedColor, setSelectedColor] = useState<ColorFormats | null>(
    null
  );
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(
    null
  );
  const [copyMessage, setCopyMessage] = useState<string | null>(
    null
  );

  const imageRef = useRef<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paletteFrameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(
      STORAGE_COLOR_COUNT_KEY
    );
    if (!stored) {
      return;
    }
    const parsed = Number(stored);
    if (Number.isNaN(parsed)) {
      return;
    }
    const clamped = Math.max(
      3,
      Math.min(12, Math.round(parsed))
    );
    setColorCount(clamped);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(
      STORAGE_COLOR_COUNT_KEY,
      String(colorCount)
    );
  }, [colorCount]);

  useEffect(() => {
    return () => {
      if (imageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [imageUrl]);

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    if (!file.type.startsWith("image/")) {
      setStatusMessage("Please select a PNG or JPEG image.");
      return;
    }
    if (imageUrl) {
      URL.revokeObjectURL(imageUrl);
    }
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    setImageName(file.name);
    setImageSize(null);
    setPalette([]);
    setSelectedColor(null);
    setStatusMessage("Image loaded. Click Extract Palette to analyze colors.");
  };

  const handleImageLoaded = () => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) {
      return;
    }
    const width = image.naturalWidth || image.width;
    const height = image.naturalHeight || image.height;
    if (!width || !height) {
      return;
    }
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    context.drawImage(image, 0, 0, width, height);
    setImageSize({ width, height });
    setStatusMessage(
      "Image ready. Choose the number of colors and extract the palette."
    );
  };

  const handleExtractPalette = () => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setStatusMessage("Please upload an image first.");
      return;
    }
    const context = canvas.getContext("2d");
    if (!context) {
      setStatusMessage("Unable to read image data.");
      return;
    }
    const width = canvas.width;
    const height = canvas.height;
    if (!width || !height) {
      setStatusMessage("Image data is not available yet.");
      return;
    }
    const imageData = context.getImageData(0, 0, width, height);
    setIsExtracting(true);
    setStatusMessage("Extracting dominant colors…");
    window.setTimeout(() => {
      const colors = extractPaletteFromImageData(
        imageData,
        colorCount
      );
      setPalette(colors);
      if (colors.length > 0) {
        const first = colors[0];
        setSelectedColor({
          hex: first.hex,
          rgb: first.rgb,
          hsl: first.hsl
        });
        setStatusMessage(
          `Extracted ${colors.length} colors. Click a swatch or the image to inspect a specific color.`
        );
      } else {
        setSelectedColor(null);
        setStatusMessage("No colors could be extracted from this image.");
      }
      setIsExtracting(false);
    }, 0);
  };

  const handleSampleClick: React.MouseEventHandler<HTMLDivElement> = (
    event
  ) => {
    const image = imageRef.current;
    const canvas = canvasRef.current;
    if (!image || !canvas) {
      return;
    }
    const rect = (
      event.currentTarget as HTMLDivElement
    ).getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;
    const displayWidth = rect.width;
    const displayHeight = rect.height;
    if (!displayWidth || !displayHeight) {
      return;
    }
    const imgWidth = image.naturalWidth || image.width;
    const imgHeight = image.naturalHeight || image.height;
    const scaleX = imgWidth / displayWidth;
    const scaleY = imgHeight / displayHeight;
    const x = Math.floor(clickX * scaleX);
    const y = Math.floor(clickY * scaleY);
    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }
    const data = context.getImageData(x, y, 1, 1).data;
    const rgb: RGB = {
      r: data[0],
      g: data[1],
      b: data[2]
    };
    const hex = rgbToHex(rgb);
    const hsl = rgbToHsl(rgb);
    setSelectedColor({ hex, rgb, hsl });
    setStatusMessage(
      "Sampled color from image. You can copy any format below."
    );
  };

  const handleCopy = async (text: string, label: string) => {
    if (!text) {
      return;
    }
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard
    ) {
      return;
    }
    await navigator.clipboard.writeText(text);
    setCopyMessage(`${label} copied`);
    window.setTimeout(() => {
      setCopyMessage(null);
    }, 1800);
  };

  const handleDownloadPalettePng = async () => {
    if (!paletteFrameRef.current || palette.length === 0) {
      return;
    }
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(paletteFrameRef.current, {
      backgroundColor: "#020617",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      const timestamp = new Date()
        .toISOString()
        .replace(/[:.]/g, "-");
      link.href = url;
      link.download = `color-palette-${timestamp}.png`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  };

  const handleDownloadPaletteJson = () => {
    if (palette.length === 0) {
      return;
    }
    const payload: PaletteJson = {
      toolName: "Color Picker & Palette Extractor",
      generatedAt: new Date().toISOString(),
      image: imageSize
        ? {
            width: imageSize.width,
            height: imageSize.height,
            fileName: imageName
          }
        : undefined,
      colorCount: palette.length,
      colors: palette.map((color) => ({
        hex: color.hex,
        rgb: color.rgb,
        hsl: color.hsl,
        fraction: color.fraction
      }))
    };
    const json = JSON.stringify(payload, null, 2);
    const blob = new Blob([json], {
      type: "application/json;charset=utf-8"
    });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-");
    link.href = url;
    link.download = `color-palette-${timestamp}.json`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const clampedColorCount = useMemo(
    () => Math.max(3, Math.min(12, colorCount)),
    [colorCount]
  );

  const sortedPalette = useMemo(
    () => palette.slice(0, clampedColorCount),
    [palette, clampedColorCount]
  );

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-4 text-slate-100 shadow-lg md:p-6">
        <div className="flex flex-col gap-4 md:grid md:grid-cols-[minmax(0,1.4fr)_minmax(0,1.2fr)] md:items-start md:gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
                Upload image
              </label>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-slate-200 file:mr-3 file:rounded-md file:border-none file:bg-emerald-600 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-950 hover:file:bg-emerald-500"
                />
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span>Colors:</span>
                  <input
                    type="range"
                    min={3}
                    max={12}
                    value={clampedColorCount}
                    onChange={(event) =>
                      setColorCount(
                        Number(event.target.value) || 6
                      )
                    }
                    className="h-1 w-32 cursor-pointer rounded-full bg-slate-700 accent-emerald-500"
                  />
                  <span className="w-6 text-center font-mono">
                    {clampedColorCount}
                  </span>
                </div>
              </div>
              {statusMessage && (
                <p className="text-[11px] text-slate-300">
                  {statusMessage}
                </p>
              )}
            </div>
            <div className="relative overflow-hidden rounded-xl border border-slate-800 bg-slate-950">
              {imageUrl ? (
                <div
                  className="relative h-64 w-full cursor-crosshair md:h-80"
                  onClick={handleSampleClick}
                >
                  <img
                    ref={imageRef}
                    src={imageUrl}
                    alt={imageName ?? "Uploaded image"}
                    onLoad={handleImageLoaded}
                    className="h-full w-full object-contain"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-slate-900/10" />
                  <p class_name="pointer-events-none absolute bottom-2 right-2 rounded-full bg-slate-900/70 px-2.5 py-1 text-[10px] text-slate-200">
                    Click to pick a color
                  </p>
                </div>
              ) : (
                <div className="flex h-48 items-center justify-center text-sm text-slate-500 md:h-60">
                  <p>Choose a PNG or JPEG image to begin extracting a palette.</p>
                </div>
              )}
              <canvas
                ref={canvasRef}
                className="hidden"
                aria-hidden="true"
              />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleExtractPalette}
                className="inline-flex items-center gap-2 rounded-md bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:bg-emerald-700/60"
                disabled={!imageUrl || isExtracting}
              >
                <span className={isExtracting ? "animate-spin" : ""}>
                  🎨
                </span>
                <span>
                  {isExtracting ? "Extracting palette…" : "Extract palette"}
                </span>
              </button>
              <p className="text-[11px] text-slate-400">
                All processing happens in your browser. Images are never
                uploaded.
              </p>
            </div>
          </div>
          <div className="space-y-4">
            <ExportableImageFrame
              ref={paletteFrameRef}
              title="Color Palette"
              className="bg-slate-950 text-slate-100"
            >
              <div className="space-y-3">
                <div className="space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Palette
                  </p>
                  {sortedPalette.length === 0 ? (
                    <p className="text-xs text-slate-400">
                      Extract a palette to see the dominant colors from your
                      image. The largest swatches represent the most common
                      colors.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {sortedPalette.map((color) => {
                        const isSelected =
                          selectedColor?.hex === color.hex;
                        const percent = Math.round(
                          color.fraction * 100
                        );
                        return (
                          <button
                            type="button"
                            key={color.hex}
                            onClick={() =>
                              setSelectedColor({
                                hex: color.hex,
                                rgb: color.rgb,
                                hsl: color.hsl
                              })
                            }
                            className={`flex flex-col overflow-hidden rounded-xl border text-left shadow-sm transition-transform ${
                              isSelected
                                ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-slate-950 scale-[1.02]"
                                : "hover:scale-[1.01]"
                            }`}
                          >
                            <div
                              className="h-16 w-full"
                              style={{ backgroundColor: color.hex }}
                            />
                            <div className="space-y-0.5 bg-slate-900/90 px-2 py-1.5 text-[11px]">
                              <div className="flex items-center justify-between gap-1">
                                <span className="font-mono text-slate-50">
                                  {color.hex}
                                </span>
                                <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] text-slate-300">
                                  {percent}%
                                </span>
                              </div>
                              <p className="truncate text-slate-400">
                                {formatRgbString(color.rgb)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
                {selectedColor && (
                  <div className="space-y-2 rounded-xl border border-slate-800 bg-slate-950/90 p-3">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Selected color
                    </p>
                    <div className="flex items-start gap-3">
                      <div
                        className="h-16 w-16 flex-shrink-0 rounded-lg border border-slate-700 shadow-inner"
                        style={{ backgroundColor: selectedColor.hex }}
                      />
                      <div className="flex-1 space-y-1 text-xs">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-slate-50">
                            {selectedColor.hex}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                selectedColor.hex,
                                "HEX"
                              )
                            }
                            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
                          >
                            Copy HEX
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-300">
                            {formatRgbString(selectedColor.rgb)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                formatRgbString(
                                  selectedColor.rgb
                                ),
                                "RGB"
                              )
                            }
                            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
                          >
                            Copy RGB
                          </button>
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-slate-300">
                            {formatHslString(selectedColor.hsl)}
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              handleCopy(
                                formatHslString(
                                  selectedColor.hsl
                                ),
                                "HSL"
                              )
                            }
                            className="rounded-md border border-slate-700 bg-slate-900 px-2 py-0.5 text-[11px] text-slate-200 hover:border-emerald-400 hover:text-emerald-300"
                          >
                            Copy HSL
                          </button>
                        </div>
                        {copyMessage && (
                          <p className="text-[11px] text-emerald-300">
                            {copyMessage}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </ExportableImageFrame>
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="space-x-2">
                <button
                  type="button"
                  onClick={handleDownloadPalettePng}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm hover:border-emerald-400 hover:text-emerald-300"
                  disabled={sortedPalette.length === 0}
                >
                  Download PNG palette
                </button>
                <button
                  type="button"
                  onClick={handleDownloadPaletteJson}
                  className="inline-flex items-center gap-2 rounded-md border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-slate-100 shadow-sm hover:border-emerald-400 hover:text-emerald-300"
                  disabled={sortedPalette.length === 0}
                >
                  Download JSON palette
                </button>
              </div>
              <p className="text-[11px] text-slate-400">
                Exports include subtle LifeHackToolbox branding in the PNG and
                metadata in the JSON.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ColorPaletteExtractor;


