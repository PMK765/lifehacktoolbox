"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type ConvertedImageResult,
  type SupportedOutputFormat,
  convertImageFile,
  getExtensionForFormat
} from "@/lib/imageConversion";

type StoredSettings = {
  outputFormat: SupportedOutputFormat;
  quality: number;
  scalePercent: number;
  maxSizeKb: string;
};

const SETTINGS_KEY =
  "lht_image_converter_settings_v1";

const formatBytesToKb = (bytes: number): string =>
  `${(bytes / 1024).toFixed(1)} KB`;

const formatFileSize = (bytes: number): string => {
  if (bytes >= 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(
      2
    )} MB`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
};

const ImageFormatConverter = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] =
    useState<SupportedOutputFormat>("jpeg");
  const [quality, setQuality] = useState(0.9);
  const [maxSizeKb, setMaxSizeKb] =
    useState<string>("");
  const [scalePercent, setScalePercent] =
    useState(100);
  const [isConverting, setIsConverting] =
    useState(false);
  const [results, setResults] = useState<
    ConvertedImageResult[]
  >([]);
  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);
  const [preserveMetadata] =
    useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw =
      window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      return;
    }
    const stored = JSON.parse(
      raw
    ) as StoredSettings;
    if (
      stored.outputFormat === "jpeg" ||
      stored.outputFormat === "png" ||
      stored.outputFormat === "webp"
    ) {
      setOutputFormat(stored.outputFormat);
    }
    if (
      typeof stored.quality === "number" &&
      stored.quality >= 0.2 &&
      stored.quality <= 1
    ) {
      setQuality(stored.quality);
    }
    if (
      typeof stored.scalePercent === "number" &&
      stored.scalePercent >= 25 &&
      stored.scalePercent <= 100
    ) {
      setScalePercent(stored.scalePercent);
    }
    if (typeof stored.maxSizeKb === "string") {
      setMaxSizeKb(stored.maxSizeKb);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const settings: StoredSettings = {
      outputFormat,
      quality,
      scalePercent,
      maxSizeKb
    };
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );
  }, [outputFormat, quality, scalePercent, maxSizeKb]);

  useEffect(
    () => () => {
      results.forEach((result) => {
        URL.revokeObjectURL(result.outputUrl);
      });
    },
    [results]
  );

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFiles = event.target.files;
    if (!selectedFiles) {
      return;
    }
    const nextFiles: File[] = [];
    for (let index = 0; index < selectedFiles.length; index += 1) {
      const file = selectedFiles.item(index);
      if (file) {
        nextFiles.push(file);
      }
    }
    setFiles(nextFiles);
    setResults([]);
    setErrorMessage(null);
  };

  const parsedMaxSize = useMemo(() => {
    const numeric = Number(maxSizeKb);
    if (!Number.isFinite(numeric) || numeric <= 0) {
      return undefined;
    }
    return numeric;
  }, [maxSizeKb]);

  const handleConvert = async () => {
    if (files.length === 0) {
      setErrorMessage(
        "Choose one or more images to convert."
      );
      return;
    }
    setIsConverting(true);
    setErrorMessage(null);
    setResults([]);
    const nextResults: ConvertedImageResult[] = [];
    const failedNames: string[] = [];
    const options = {
      outputFormat,
      quality,
      maxSizeKb: parsedMaxSize,
      scalePercent
    };
    for (const file of files) {
      const result = await convertImageFile(
        file,
        options
      );
      if (result) {
        nextResults.push(result);
      } else {
        failedNames.push(file.name);
      }
    }
    setResults(nextResults);
    if (failedNames.length > 0) {
      setErrorMessage(
        `Could not convert: ${failedNames.join(
          ", "
        )}. Some HEIC files may not be supported in this browser.`
      );
    }
    if (failedNames.length === 0 && nextResults.length === 0) {
      setErrorMessage(
        "Conversion did not produce any results."
      );
    }
    setIsConverting(false);
  };

  const handleClear = () => {
    setFiles([]);
    results.forEach((result) => {
      URL.revokeObjectURL(result.outputUrl);
    });
    setResults([]);
    setErrorMessage(null);
  };

  const getOutputFileName = (
    original: File,
    format: SupportedOutputFormat
  ): string => {
    const ext = getExtensionForFormat(format);
    const base = original.name.replace(
      /\.[^/.]+$/,
      ""
    );
    return `${base}-converted.${ext}`;
  };

  return (
    <div className="space-y-6">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Select images
        </h2>
        <div className="space-y-3 text-xs text-slate-700">
          <label className="flex flex-col items-start gap-2 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-5 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-900">
                Choose files or drag them here
              </p>
              <p className="max-w-md text-[11px] text-slate-600">
                Supports HEIC, JPG, PNG, WEBP, GIF and most
                browser-readable image formats. All
                conversion happens on your device.
              </p>
            </div>
            <div className="mt-3 flex flex-col items-center gap-2 sm:mt-0">
              <input
                id="image-input"
                type="file"
                multiple
                accept="image/*,.heic,.HEIC"
                onChange={handleFileChange}
                className="hidden"
              />
              <label
                htmlFor="image-input"
                className="inline-flex cursor-pointer items-center rounded-md bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-50 shadow-sm hover:bg-slate-800"
              >
                Browse images
              </label>
              <p className="text-[10px] text-slate-500">
                No images are uploaded to a server.
              </p>
            </div>
          </label>
          {files.length > 0 && (
            <div className="space-y-1">
              <p className="text-[11px] font-medium text-slate-700">
                Selected files
              </p>
              <ul className="max-h-32 space-y-1 overflow-auto rounded-md border border-slate-200 bg-slate-50 px-3 py-2">
                {files.map((file) => (
                  <li
                    key={file.name}
                    className="flex items-center justify-between text-[11px]"
                  >
                    <span className="truncate">
                      {file.name}
                    </span>
                    <span className="ml-2 shrink-0 font-mono text-slate-600">
                      {formatFileSize(file.size)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <h2 className="text-sm font-semibold text-slate-900">
          Conversion settings
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-3 text-xs text-slate-700">
            <label className="space-y-1">
              <span className="block text-[11px] font-medium text-slate-700">
                Output format
              </span>
              <select
                value={outputFormat}
                onChange={(event) =>
                  setOutputFormat(
                    event.target
                      .value as SupportedOutputFormat
                  )
                }
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm text-slate-900"
              >
                <option value="jpeg">
                  JPG / JPEG
                </option>
                <option value="png">
                  PNG
                </option>
                <option value="webp">
                  WEBP
                </option>
              </select>
            </label>
            <label className="space-y-1">
              <span className="block text-[11px] font-medium text-slate-700">
                Quality (for JPG / WEBP)
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0.2}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(event) =>
                    setQuality(
                      Number(event.target.value)
                    )
                  }
                  disabled={outputFormat === "png"}
                  className="h-1 flex-1 cursor-pointer rounded-full bg-slate-200 accent-emerald-500"
                />
                <span className="w-10 text-right text-[11px] font-mono">
                  {Math.round(quality * 100)}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                PNG ignores quality settings and uses full
                lossless encoding.
              </p>
            </label>
            <label className="space-y-1">
              <span className="block text-[11px] font-medium text-slate-700">
                Max output size (KB, optional)
              </span>
              <input
                type="number"
                min={1}
                value={maxSizeKb}
                onChange={(event) =>
                  setMaxSizeKb(event.target.value)
                }
                className="w-full rounded-md border border-slate-300 px-2 py-1 text-sm text-slate-900"
                placeholder="e.g. 800"
              />
              <p className="text-[10px] text-slate-500">
                Attempts to keep JPEG/WEBP files at or under
                this size by lowering quality. PNG may not hit
                exact targets.
              </p>
            </label>
          </div>
          <div className="space-y-3 text-xs text-slate-700">
            <label className="space-y-1">
              <span className="block text-[11px] font-medium text-slate-700">
                Scale image (percentage)
              </span>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={25}
                  max={100}
                  step={5}
                  value={scalePercent}
                  onChange={(event) =>
                    setScalePercent(
                      Number(event.target.value)
                    )
                  }
                  className="h-1 flex-1 cursor-pointer rounded-full bg-slate-200 accent-emerald-500"
                />
                <span className="w-10 text-right text-[11px] font-mono">
                  {scalePercent}%
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                Scaling down reduces resolution and output file
                size.
              </p>
            </label>
            <div className="space-y-1">
              <span className="block text-[11px] font-medium text-slate-700">
                Metadata
              </span>
              <label className="flex items-center gap-2 text-[11px] text-slate-600">
                <input
                  type="checkbox"
                  checked={preserveMetadata}
                  readOnly
                  className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                />
                <span>
                  EXIF metadata is not preserved in this
                  version of the converter.
                </span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <button
            type="button"
            onClick={handleConvert}
            disabled={isConverting}
            className="inline-flex items-center rounded-md bg-emerald-500 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isConverting ? "Converting…" : "Convert images"}
          </button>
          <button
            type="button"
            onClick={handleClear}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-100"
          >
            Clear list
          </button>
          <p className="text-[10px] text-slate-500">
            Conversion uses browser Canvas and Web APIs.
            Images never leave your device.
          </p>
        </div>
        {errorMessage && (
          <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-800">
            {errorMessage}
          </div>
        )}
      </section>
      {results.length > 0 && (
        <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <h2 className="text-sm font-semibold text-slate-900">
            Converted images
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {results.map((result) => (
              <article
                key={`${result.originalFile.name}-${result.outputUrl}`}
                className="flex gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-800"
              >
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-md border border-slate-200 bg-white">
                  <img
                    src={result.outputUrl}
                    alt={result.originalFile.name}
                    className="h-full w-full object-contain"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-1">
                  <p className="truncate text-[11px] font-medium text-slate-900">
                    {result.originalFile.name}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {formatFileSize(
                      result.originalFile.size
                    )}{" "}
                    →{" "}
                    {formatBytesToKb(
                      result.outputBlob.size
                    )}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    {result.width} × {result.height} px
                  </p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <p className="text-[10px] text-slate-500">
                      Format: {result.outputFormat.toUpperCase()}
                    </p>
                    <a
                      href={result.outputUrl}
                      download={getOutputFileName(
                        result.originalFile,
                        result.outputFormat
                      )}
                      className="inline-flex items-center rounded-md bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-slate-50 hover:bg-slate-800"
                    >
                      Download{" "}
                      {result.outputFormat.toUpperCase()}
                    </a>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ImageFormatConverter;


