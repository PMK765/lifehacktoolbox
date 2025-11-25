"use client";

import { useEffect, useMemo, useState } from "react";
import { parse, type ParseError } from "jsonc-parser";

type ValidationStatus = "idle" | "valid" | "invalid";

type ViewMode = "side-by-side" | "single";

type IndentSize = 2 | 4;

const computeLineAndColumn = (text: string, offset: number) => {
  let line = 1;
  let column = 1;
  for (let index = 0; index < offset && index < text.length; index += 1) {
    const character = text[index];
    if (character === "\n") {
      line += 1;
      column = 1;
    } else {
      column += 1;
    }
  }
  return { line, column };
};

const describeParseError = (
  error: ParseError,
  text: string
): string => {
  const { line, column } = computeLineAndColumn(text, error.offset);
  let message = "Invalid JSON.";
  const code = error.error as number;
  if (code === 3) {
    message = "Property name expected.";
  } else if (code === 4) {
    message = "Value expected.";
  } else if (code === 5) {
    message = "Colon ':' expected between key and value.";
  } else if (code === 6) {
    message = "Comma ',' expected between items.";
  } else if (code === 7) {
    message = "Closing '}' expected.";
  } else if (code === 8) {
    message = "Closing ']' expected.";
  } else if (code === 9) {
    message = "Unexpected end of input.";
  }
  return `${message} (line ${line}, column ${column})`;
};

const parseJsonSafely = (
  text: string
):
  | { kind: "ok"; value: unknown }
  | { kind: "error"; message: string } => {
  const errors: ParseError[] = [];
  const value = parse(text, errors, {
    allowTrailingComma: false,
    disallowComments: true
  });
  if (errors.length > 0) {
    const primary = errors[0];
    return {
      kind: "error",
      message: describeParseError(primary, text)
    };
  }
  if (value === undefined && text.trim().length === 0) {
    return {
      kind: "error",
      message: "Enter JSON to validate."
    };
  }
  return { kind: "ok", value };
};

const JsonLinter = () => {
  const [rawJson, setRawJson] = useState("");
  const [formattedJson, setFormattedJson] = useState("");
  const [validationStatus, setValidationStatus] =
    useState<ValidationStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    null
  );
  const [indentSize, setIndentSize] = useState<IndentSize>(2);
  const [viewMode, setViewMode] = useState<ViewMode>("side-by-side");
  const [copied, setCopied] = useState(false);

  const debouncedRawJson = useMemo(() => rawJson, [rawJson]);

  useEffect(() => {
    if (!debouncedRawJson.trim()) {
      setValidationStatus("idle");
      setErrorMessage(null);
      return;
    }
    const result = parseJsonSafely(debouncedRawJson);
    if (result.kind === "ok") {
      setValidationStatus("valid");
      setErrorMessage(null);
    } else {
      setValidationStatus("invalid");
      setErrorMessage(result.message);
    }
  }, [debouncedRawJson]);

  const handleValidate = () => {
    const result = parseJsonSafely(rawJson);
    if (result.kind === "ok") {
      setValidationStatus("valid");
      setErrorMessage(null);
    } else {
      setValidationStatus("invalid");
      setErrorMessage(result.message);
    }
  };

  const handleFormat = () => {
    const result = parseJsonSafely(rawJson);
    if (result.kind === "ok") {
      const pretty = JSON.stringify(
        result.value,
        null,
        indentSize
      );
      setFormattedJson(pretty);
      setValidationStatus("valid");
      setErrorMessage(null);
    } else {
      setValidationStatus("invalid");
      setErrorMessage(result.message);
    }
  };

  const handleMinify = () => {
    const result = parseJsonSafely(rawJson);
    if (result.kind === "ok") {
      const minified = JSON.stringify(result.value);
      setFormattedJson(minified);
      setValidationStatus("valid");
      setErrorMessage(null);
    } else {
      setValidationStatus("invalid");
      setErrorMessage(result.message);
    }
  };

  const handleCopy = async () => {
    if (!formattedJson.trim()) {
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1800);
  };

  const handleDownload = () => {
    if (!formattedJson.trim()) {
      return;
    }
    const blob = new Blob([formattedJson], {
      type: "application/json;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    link.href = url;
    link.download = `lifehacktoolbox-json-${year}-${month}-${day}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const statusLabel =
    validationStatus === "valid"
      ? "Valid JSON"
      : validationStatus === "invalid"
      ? "Invalid JSON"
      : "Idle";

  const statusClassName =
    validationStatus === "valid"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : validationStatus === "invalid"
      ? "bg-red-50 text-red-800 border-red-200"
      : "bg-slate-50 text-slate-700 border-slate-200";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          JSON is processed entirely in your browser.
        </p>
        <p>
          Paste sensitive data only if you are comfortable keeping it in this
          browser tab. Nothing is sent to a server; validation and formatting
          happen locally using your device.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
          <button
            type="button"
            onClick={() => setViewMode("side-by-side")}
            className={`px-3 py-1 ${
              viewMode === "side-by-side"
                ? "rounded-l-md bg-white font-semibold text-slate-900"
                : "text-slate-700"
            }`}
          >
            Side by side
          </button>
          <button
            type="button"
            onClick={() => setViewMode("single")}
            className={`px-3 py-1 ${
              viewMode === "single"
                ? "rounded-r-md bg-white font-semibold text-slate-900"
                : "text-slate-700"
            }`}
          >
            Single view
          </button>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-700">
          <span>Indentation:</span>
          <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
            <button
              type="button"
              onClick={() => setIndentSize(2)}
              className={`px-3 py-1 ${
                indentSize === 2
                  ? "rounded-l-md bg-white font-semibold text-slate-900"
                  : "text-slate-700"
              }`}
            >
              2 spaces
            </button>
            <button
              type="button"
              onClick={() => setIndentSize(4)}
              className={`px-3 py-1 ${
                indentSize === 4
                  ? "rounded-r-md bg-white font-semibold text-slate-900"
                  : "text-slate-700"
              }`}
            >
              4 spaces
            </button>
          </div>
        </div>
      </div>
      <div
        className={`grid gap-6 ${
          viewMode === "side-by-side"
            ? "lg:grid-cols-2"
            : "grid-cols-1"
        }`}
      >
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              JSON input
            </h2>
            <div
              className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${statusClassName}`}
            >
              {statusLabel}
            </div>
          </div>
          <textarea
            value={rawJson}
            onChange={(event) => setRawJson(event.target.value)}
            className="h-72 w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            placeholder='Paste JSON here, for example: { "hello": "world" }'
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleValidate}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Validate
            </button>
            <button
              type="button"
              onClick={handleFormat}
              className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
            >
              Format
            </button>
            <button
              type="button"
              onClick={handleMinify}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Minify
            </button>
            <button
              type="button"
              onClick={() => {
                setRawJson("");
                setFormattedJson("");
                setValidationStatus("idle");
                setErrorMessage(null);
              }}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>
          {errorMessage && (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-800">
              {errorMessage}
            </div>
          )}
        </section>
        <section className="space-y-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Formatted output
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Download .json
              </button>
            </div>
          </div>
          {formattedJson ? (
            <textarea
              value={formattedJson}
              readOnly
              className="h-72 w-full resize-y rounded-md border border-slate-300 bg-slate-50 px-3 py-2 font-mono text-xs text-slate-900 outline-none"
            />
          ) : (
            <div className="flex h-72 items-center justify-center rounded-md border border-dashed border-slate-300 bg-slate-50 px-3 text-xs text-slate-500">
              Format valid JSON to see output here.
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default JsonLinter;


