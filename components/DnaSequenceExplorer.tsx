"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type { AminoAcidCode, CodonInfo, DnaBase } from "@/data/genetics";
import { codonMap } from "@/data/genetics";

type Frame = 1 | 2 | 3;

type ViewMode = "bases" | "codons" | "translation";

type AaDisplayMode = "one-letter" | "three-letter";

type SequenceStats = {
  length: number;
  countA: number;
  countC: number;
  countG: number;
  countT: number;
  gcContent: number;
};

type CodonWithPosition = {
  codon: string;
  startIndex: number;
  frame: Frame;
};

type StoredSequence = {
  id: string;
  raw: string;
  label: string;
  createdAt: string;
};

type BaseColorKey = DnaBase | "other";

const STORAGE_KEY = "lht_dna_sequences_v1";

const BASE_COLORS: Record<BaseColorKey, string> = {
  A: "bg-emerald-500 text-slate-950",
  C: "bg-sky-500 text-slate-950",
  G: "bg-amber-400 text-slate-950",
  T: "bg-rose-500 text-slate-950",
  other: "bg-slate-500 text-slate-50"
};

const BASE_BORDER_COLORS: Record<BaseColorKey, string> = {
  A: "border-emerald-600",
  C: "border-sky-600",
  G: "border-amber-500",
  T: "border-rose-600",
  other: "border-slate-600"
};

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
};

const normalizeSequence = (raw: string) => {
  const upper = raw.toUpperCase();
  const bases: DnaBase[] = [];
  let removed = 0;
  for (let index = 0; index < upper.length; index += 1) {
    const character = upper[index];
    if (character === "A" || character === "C" || character === "G" || character === "T") {
      bases.push(character);
    } else if (character.trim() !== "") {
      removed += 1;
    }
  }
  return { bases, removed };
};

const complementBase = (base: DnaBase): DnaBase => {
  if (base === "A") {
    return "T";
  }
  if (base === "T") {
    return "A";
  }
  if (base === "C") {
    return "G";
  }
  return "C";
};

const computeStats = (sequence: DnaBase[]): SequenceStats => {
  let countA = 0;
  let countC = 0;
  let countG = 0;
  let countT = 0;
  const length = sequence.length;
  for (let index = 0; index < length; index += 1) {
    const base = sequence[index];
    if (base === "A") {
      countA += 1;
    } else if (base === "C") {
      countC += 1;
    } else if (base === "G") {
      countG += 1;
    } else if (base === "T") {
      countT += 1;
    }
  }
  const gc = countG + countC;
  const gcContent =
    length > 0 ? Number(((gc / length) * 100).toFixed(2)) : 0;
  return { length, countA, countC, countG, countT, gcContent };
};

const buildCodonsForFrame = (
  sequence: DnaBase[],
  frame: Frame
): CodonWithPosition[] => {
  const codons: CodonWithPosition[] = [];
  const startOffset = frame - 1;
  for (let index = startOffset; index + 2 < sequence.length; index += 3) {
    const codon =
      sequence[index] + sequence[index + 1] + sequence[index + 2];
    codons.push({ codon, startIndex: index, frame });
  }
  return codons;
};

const aminoAcidOneLetter = (code: AminoAcidCode) => {
  if (code === "Ala") return "A";
  if (code === "Arg") return "R";
  if (code === "Asn") return "N";
  if (code === "Asp") return "D";
  if (code === "Cys") return "C";
  if (code === "Gln") return "Q";
  if (code === "Glu") return "E";
  if (code === "Gly") return "G";
  if (code === "His") return "H";
  if (code === "Ile") return "I";
  if (code === "Leu") return "L";
  if (code === "Lys") return "K";
  if (code === "Met") return "M";
  if (code === "Phe") return "F";
  if (code === "Pro") return "P";
  if (code === "Ser") return "S";
  if (code === "Thr") return "T";
  if (code === "Trp") return "W";
  if (code === "Tyr") return "Y";
  if (code === "Val") return "V";
  return "*";
};

const formatPercent = (value: number) => {
  if (!Number.isFinite(value)) {
    return "0%";
  }
  return `${value.toFixed(1)}%`;
};

const formatDateTime = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
};

const DnaSequenceExplorer = () => {
  const [rawSequence, setRawSequence] = useState("");
  const [cleanSequence, setCleanSequence] = useState<DnaBase[]>([]);
  const [removedCount, setRemovedCount] = useState(0);
  const [frame, setFrame] = useState<Frame>(1);
  const [showComplement, setShowComplement] = useState(true);
  const [selectedCodonIndex, setSelectedCodonIndex] = useState<number | null>(
    null
  );
  const [viewMode, setViewMode] = useState<ViewMode>("bases");
  const [aaDisplayMode, setAaDisplayMode] =
    useState<AaDisplayMode>("three-letter");
  const [savedSequences, setSavedSequences] = useState<StoredSequence[]>([]);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const exportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return;
    }
    const parsed = JSON.parse(stored) as StoredSequence[];
    if (Array.isArray(parsed)) {
      setSavedSequences(parsed.slice(-5));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (savedSequences.length === 0) {
      window.localStorage.removeItem(STORAGE_KEY);
      return;
    }
    const serialized = JSON.stringify(savedSequences.slice(-5));
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }, [savedSequences]);

  const stats = useMemo(
    () => computeStats(cleanSequence),
    [cleanSequence]
  );

  const codonsFrame1 = useMemo(
    () => buildCodonsForFrame(cleanSequence, 1),
    [cleanSequence]
  );
  const codonsFrame2 = useMemo(
    () => buildCodonsForFrame(cleanSequence, 2),
    [cleanSequence]
  );
  const codonsFrame3 = useMemo(
    () => buildCodonsForFrame(cleanSequence, 3),
    [cleanSequence]
  );

  const currentCodons = frame === 1 ? codonsFrame1 : frame === 2 ? codonsFrame2 : codonsFrame3;

  useEffect(() => {
    if (selectedCodonIndex == null) {
      return;
    }
    if (selectedCodonIndex < 0 || selectedCodonIndex >= currentCodons.length) {
      setSelectedCodonIndex(null);
    }
  }, [currentCodons, selectedCodonIndex]);

  const allCodons = useMemo(() => {
    return [...codonsFrame1, ...codonsFrame2, ...codonsFrame3];
  }, [codonsFrame1, codonsFrame2, codonsFrame3]);

  const handleRawChange = (value: string) => {
    setRawSequence(value);
    const { bases, removed } = normalizeSequence(value);
    setCleanSequence(bases);
    setRemovedCount(removed);
    setSelectedCodonIndex(null);
  };

  const handleClear = () => {
    setRawSequence("");
    setCleanSequence([]);
    setRemovedCount(0);
    setSelectedCodonIndex(null);
  };

  const handleSample = () => {
    const sample =
      "ATGGCCATTGTAATGGGCCGCTGAAAGGGTGCCCGATAG";
    handleRawChange(sample);
  };

  const handleSaveCurrentSequence = () => {
    if (!rawSequence.trim()) {
      return;
    }
    const normalized = normalizeSequence(rawSequence);
    if (normalized.bases.length === 0) {
      return;
    }
    const labelSource = normalized.bases.join("");
    const label =
      labelSource.length > 12
        ? `${labelSource.slice(0, 12)}…`
        : labelSource;
    const entry: StoredSequence = {
      id: createId(),
      raw: rawSequence,
      label,
      createdAt: new Date().toISOString()
    };
    setSavedSequences((previous) => {
      const next = [...previous, entry];
      if (next.length > 5) {
        return next.slice(next.length - 5);
      }
      return next;
    });
  };

  const handleLoadSequence = (entry: StoredSequence) => {
    handleRawChange(entry.raw);
  };

  const handleExportPng = async () => {
    if (!exportRef.current) {
      return;
    }
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(exportRef.current, {
      backgroundColor: "#ffffff",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      link.href = url;
      link.download = `dna-sequence-${timestamp}.png`;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportMessage("PNG downloaded.");
      window.setTimeout(() => {
        setExportMessage(null);
      }, 2000);
    });
  };

  const handleExportCsv = () => {
    if (currentCodons.length === 0) {
      return;
    }
    const header =
      "index,frame,codon,amino_acid_code,amino_acid_full_name,is_start,is_stop";
    const rows: string[] = [header];
    for (let index = 0; index < currentCodons.length; index += 1) {
      const entry = currentCodons[index];
      const info = codonMap[entry.codon];
      const aminoCode = info ? info.aminoAcid : ("Stop" as AminoAcidCode);
      const fullName = info ? info.fullName : "Stop";
      const isStart = info ? info.isStart : false;
      const isStop = info ? info.isStop : true;
      const csvRow = [
        (index + 1).toString(),
        entry.frame.toString(),
        entry.codon,
        aminoCode,
        fullName,
        isStart ? "true" : "false",
        isStop ? "true" : "false"
      ]
        .map((cell) => `"${cell.replace(/"/g, '""')}"`)
        .join(",");
      rows.push(csvRow);
    }
    const csv = rows.join("\n");
    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;"
    });
    const url = URL.createObjectURL(blob);
    const link = window.document.createElement("a");
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    link.href = url;
    link.download = `dna_codons_${timestamp}.csv`;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setExportMessage("CSV downloaded.");
    window.setTimeout(() => {
      setExportMessage(null);
    }, 2000);
  };

  const gcBases = stats.countG + stats.countC;
  const atBases = stats.countA + stats.countT;
  const atGcRatio =
    gcBases === 0 ? "–" : (atBases / gcBases).toFixed(2);

  const selectedCodon =
    selectedCodonIndex != null && selectedCodonIndex >= 0 && selectedCodonIndex < currentCodons.length
      ? currentCodons[selectedCodonIndex]
      : null;
  const selectedCodonInfo: CodonInfo | null = selectedCodon
    ? codonMap[selectedCodon.codon] ?? null
    : null;
  const selectedCodonOccurrences =
    selectedCodon != null
      ? allCodons.filter(
          (entry) => entry.codon === selectedCodon.codon
        ).length
      : 0;

  const selectedBaseIndices =
    selectedCodon != null
      ? [
          selectedCodon.startIndex,
          selectedCodon.startIndex + 1,
          selectedCodon.startIndex + 2
        ]
      : [];

  const baseFrequencyMax = Math.max(
    stats.countA,
    stats.countC,
    stats.countG,
    stats.countT,
    1
  );

  const renderBaseStrip = (sequence: DnaBase[], highlightCodon: boolean) => {
    return (
      <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-2 text-xs text-slate-900 max-h-48 overflow-y-auto">
        {sequence.map((base, index) => {
          const isInSelected =
            highlightCodon &&
            selectedBaseIndices.includes(index);
          const colorKey: BaseColorKey = base;
          const backgroundClass = BASE_COLORS[colorKey];
          const borderClass = BASE_BORDER_COLORS[colorKey];
          const ringClass = isInSelected
            ? "ring-2 ring-offset-1 ring-emerald-500 ring-offset-slate-50"
            : "";
          const gcHighlight =
            base === "G" || base === "C"
              ? "shadow-[0_0_0_1px_rgba(59,130,246,0.7)]"
              : "";
          return (
            <span
              key={index}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-xs font-semibold ${backgroundClass} ${borderClass} ${ringClass} ${gcHighlight}`}
            >
              {base}
            </span>
          );
        })}
      </div>
    );
  };

  const renderComplementStrip = (sequence: DnaBase[]) => {
    const complement = sequence.map((base) => complementBase(base));
    return (
      <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 bg-slate-900 px-2 py-2 text-xs text-slate-50 max-h-32 overflow-y-auto">
        {complement.map((base, index) => {
          const colorKey: BaseColorKey = base;
          const backgroundClass = BASE_COLORS[colorKey];
          const borderClass = BASE_BORDER_COLORS[colorKey];
          return (
            <span
              key={index}
              className={`inline-flex h-6 w-6 items-center justify-center rounded-md border text-xs font-semibold ${backgroundClass} ${borderClass}`}
            >
              {base}
            </span>
          );
        })}
      </div>
    );
  };

  const renderCodonCards = () => {
    if (currentCodons.length === 0) {
      return (
        <p className="text-xs text-slate-500">
          Not enough bases to form codons in this frame.
        </p>
      );
    }
    return (
      <div className="flex gap-2 overflow-x-auto rounded-md border border-slate-200 bg-slate-50 px-2 py-2">
        {currentCodons.map((entry, index) => {
          const info = codonMap[entry.codon];
          const isSelected = selectedCodonIndex === index;
          const isStart = info?.isStart ?? false;
          const isStop = info?.isStop ?? false;
          const baseClass = isStop
            ? "bg-rose-600 text-slate-50 border-rose-700"
            : isStart
            ? "bg-emerald-500 text-slate-950 border-emerald-600"
            : "bg-slate-900 text-slate-100 border-slate-700";
          const scaleClass = isSelected
            ? "ring-2 ring-emerald-400 scale-105"
            : "ring-0";
          const aminoLabel = info
            ? `${info.aminoAcid}${info.isStop ? " (Stop)" : ""}`
            : "Unknown";
          return (
            <button
              key={`${entry.codon}-${index}`}
              type="button"
              onClick={() => setSelectedCodonIndex(index)}
              className={`flex min-w-[4.5rem] flex-col items-stretch rounded-md border px-2 py-1 text-left text-[11px] shadow-sm transition-transform ${baseClass} ${scaleClass}`}
            >
              <span className="flex items-baseline justify-between gap-1">
                <span className="text-xs font-semibold tracking-tight">
                  {entry.codon}
                </span>
                <span className="text-[10px]">
                  #{index + 1}
                </span>
              </span>
              <span className="mt-0.5 text-[10px]">{aminoLabel}</span>
            </button>
          );
        })}
      </div>
    );
  };

  const renderTranslationStrip = () => {
    if (currentCodons.length === 0) {
      return (
        <p className="text-xs text-slate-500">
          Not enough bases to translate in this frame.
        </p>
      );
    }
    return (
      <div className="space-y-2 rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-900">
        <div className="flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Amino acids
            </span>
            <button
              type="button"
              onClick={() => setAaDisplayMode("one-letter")}
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                aaDisplayMode === "one-letter"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              One-letter
            </button>
            <button
              type="button"
              onClick={() => setAaDisplayMode("three-letter")}
              className={`rounded-full px-2 py-0.5 text-[11px] ${
                aaDisplayMode === "three-letter"
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              Three-letter
            </button>
          </div>
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {currentCodons.map((entry, index) => {
            const info = codonMap[entry.codon];
            const aminoCode = info ? info.aminoAcid : ("Stop" as AminoAcidCode);
            const isStop = info?.isStop ?? aminoCode === "Stop";
            const display =
              aaDisplayMode === "one-letter"
                ? aminoAcidOneLetter(aminoCode)
                : aminoCode === "Stop"
                ? "Stop"
                : aminoCode;
            const isSelected = selectedCodonIndex === index;
            const baseClass = isStop
              ? "bg-rose-600 text-slate-50 border-rose-700"
              : info?.isStart
              ? "bg-emerald-500 text-slate-950 border-emerald-600"
              : "bg-slate-900 text-slate-100 border-slate-700";
            const scaleClass = isSelected
              ? "ring-2 ring-emerald-400 scale-105"
              : "ring-0";
            return (
              <button
                key={`${entry.codon}-${index}`}
                type="button"
                onClick={() => setSelectedCodonIndex(index)}
                className={`flex min-w-[4.25rem] flex-col items-stretch rounded-md border px-2 py-1 text-left text-[11px] shadow-sm transition-transform ${baseClass} ${scaleClass}`}
              >
                <span className="flex items-baseline justify-between gap-1">
                  <span className="text-xs font-semibold tracking-tight">
                    {display}
                  </span>
                  <span className="text-[10px]">{entry.codon}</span>
                </span>
                <span className="mt-0.5 text-[10px]">
                  {isStop
                    ? "Stop codon"
                    : info?.fullName ?? "Unknown"}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  const baseView = (
    <div className="space-y-3">
      {renderBaseStrip(cleanSequence, false)}
      {showComplement && renderComplementStrip(cleanSequence)}
    </div>
  );

  const codonView = (
    <div className="space-y-3">
      {renderBaseStrip(cleanSequence, true)}
      {showComplement && renderComplementStrip(cleanSequence)}
      {renderCodonCards()}
    </div>
  );

  const translationView = (
    <div className="space-y-3">
      {renderBaseStrip(cleanSequence, true)}
      {renderTranslationStrip()}
    </div>
  );

  const currentViewContent =
    viewMode === "bases"
      ? baseView
      : viewMode === "codons"
      ? codonView
      : translationView;

  return (
    <div className="space-y-5">
      <ExportableImageFrame
        ref={exportRef}
        title="DNA Sequence Explorer"
        className="bg-slate-50"
      >
        <div className="space-y-4">
          <section className="space-y-2">
            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
              <div className="space-y-1">
                <h2 className="text-base font-semibold tracking-tight text-slate-900">
                  Sequence input
                </h2>
                <p className="max-w-xl text-xs text-slate-600">
                  Paste a DNA sequence using A, C, G, and T. Non-ACGT
                  characters are ignored, and the sequence is normalized to
                  uppercase bases for analysis.
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-700">
                <span className="rounded-full bg-slate-100 px-2 py-1">
                  Length:{" "}
                  <span className="font-semibold">
                    {stats.length} bases
                  </span>
                </span>
                {removedCount > 0 && (
                  <span className="rounded-full bg-amber-50 px-2 py-1 text-amber-700">
                    {removedCount} character
                    {removedCount === 1 ? "" : "s"} removed
                  </span>
                )}
              </div>
            </div>
            <textarea
              value={rawSequence}
              onChange={(event) => handleRawChange(event.target.value)}
              rows={4}
              spellCheck={false}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-mono text-slate-900 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="Paste or type a DNA sequence here (A, C, G, T)…"
            />
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm hover:border-slate-400 hover:text-slate-900"
                >
                  Clear
                </button>
                <button
                  type="button"
                  onClick={handleSample}
                  className="inline-flex items-center rounded-md border border-emerald-500 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800 shadow-sm hover:bg-emerald-100"
                >
                  Sample sequence
                </button>
                <button
                  type="button"
                  onClick={handleSaveCurrentSequence}
                  className="inline-flex items-center rounded-md border border-slate-300 bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-800 shadow-sm hover:border-emerald-500 hover:text-emerald-700"
                >
                  Save to recent
                </button>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={showComplement}
                  onChange={(event) =>
                    setShowComplement(event.target.checked)
                  }
                  className="h-3.5 w-3.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <span>Show complementary strand</span>
              </label>
            </div>
          </section>
          <section className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(280px,0.9fr)]">
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs text-slate-800">
                  <button
                    type="button"
                    onClick={() => setViewMode("bases")}
                    className={`rounded-full px-3 py-1 ${
                      viewMode === "bases"
                        ? "bg-white text-slate-900 shadow-sm"
                        : ""
                    }`}
                  >
                    Base view
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("codons")}
                    className={`rounded-full px-3 py-1 ${
                      viewMode === "codons"
                        ? "bg-white text-slate-900 shadow-sm"
                        : ""
                    }`}
                  >
                    Codon view
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("translation")}
                    className={`rounded-full px-3 py-1 ${
                      viewMode === "translation"
                        ? "bg-white text-slate-900 shadow-sm"
                        : ""
                    }`}
                  >
                    Translation view
                  </button>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700">
                  <span className="font-semibold">Reading frame:</span>
                  {[1, 2, 3].map((frameValue) => {
                    const typed = frameValue as Frame;
                    const isActive = frame === typed;
                    return (
                      <button
                        key={frameValue}
                        type="button"
                        onClick={() => {
                          setFrame(typed);
                          setSelectedCodonIndex(null);
                        }}
                        className={`rounded-full px-2.5 py-1 ${
                          isActive
                            ? "bg-emerald-500 text-slate-950 shadow-sm"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        Frame {frameValue}
                      </button>
                    );
                  })}
                </div>
              </div>
              {currentViewContent}
            </div>
            <aside className="space-y-4 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-sm">
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Sequence statistics
                </h3>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-1">
                  <div>
                    <dt className="text-slate-500">Length</dt>
                    <dd className="font-semibold">
                      {stats.length} bases
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">GC content</dt>
                    <dd className="font-semibold">
                      {formatPercent(stats.gcContent)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">AT vs GC ratio</dt>
                    <dd className="font-semibold">{atGcRatio}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">Counts</dt>
                    <dd className="font-semibold">
                      A:{stats.countA} C:{stats.countC} G:{stats.countG} T:
                      {stats.countT}
                    </dd>
                  </div>
                </dl>
                <div className="mt-2 space-y-1">
                  <p className="text-[11px] text-slate-500">
                    Base frequencies
                  </p>
                  <div className="flex items-end gap-2">
                    {(["A", "C", "G", "T"] as DnaBase[]).map((base) => {
                      const value =
                        base === "A"
                          ? stats.countA
                          : base === "C"
                          ? stats.countC
                          : base === "G"
                          ? stats.countG
                          : stats.countT;
                      const heightPercent =
                        baseFrequencyMax > 0
                          ? (value / baseFrequencyMax) * 100
                          : 0;
                      const backgroundClass =
                        BASE_COLORS[base].split(" ")[0];
                      return (
                        <div
                          key={base}
                          className="flex flex-1 flex-col items-center gap-1"
                        >
                          <div className="flex h-20 w-full items-end rounded-md bg-slate-100">
                            <div
                              className={`mx-auto w-4 rounded-t-md ${backgroundClass}`}
                              style={{
                                height: `${heightPercent}%`
                              }}
                            />
                          </div>
                          <span className="text-[11px] font-semibold text-slate-700">
                            {base}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {value}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Codon details
                </h3>
                {selectedCodon && selectedCodonInfo ? (
                  <div className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-2">
                    <p className="text-xs">
                      <span className="font-semibold">
                        Codon:
                      </span>{" "}
                      {selectedCodon.codon}
                    </p>
                    <p className="text-xs">
                      <span className="font-semibold">
                        Position:
                      </span>{" "}
                      {selectedCodon.startIndex + 1}–
                      {selectedCodon.startIndex + 3} (1-based)
                    </p>
                    <p className="text-xs">
                      <span className="font-semibold">
                        Frame:
                      </span>{" "}
                      {selectedCodon.frame}
                    </p>
                    <p className="text-xs">
                      <span className="font-semibold">
                        Amino acid:
                      </span>{" "}
                      {selectedCodonInfo.aminoAcid} (
                      {selectedCodonInfo.fullName})
                    </p>
                    <p className="text-xs">
                      <span className="font-semibold">
                        Start/stop:
                      </span>{" "}
                      {selectedCodonInfo.isStart
                        ? "Start codon"
                        : selectedCodonInfo.isStop
                        ? "Stop codon"
                        : "Internal"}
                    </p>
                    <p className="text-xs">
                      <span className="font-semibold">
                        Occurrences (all frames):
                      </span>{" "}
                      {selectedCodonOccurrences}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">
                    Click a codon card to see its amino acid, frame, and
                    start/stop status.
                  </p>
                )}
              </div>
            </aside>
          </section>
        </div>
      </ExportableImageFrame>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-x-2">
          <button
            type="button"
            onClick={handleExportPng}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm hover:border-emerald-500 hover:text-emerald-700"
          >
            Download view as PNG
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-900 shadow-sm hover:border-emerald-500 hover:text-emerald-700"
          >
            Download codon table (CSV)
          </button>
          {exportMessage && (
            <span className="ml-2 text-xs text-emerald-700">
              {exportMessage}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-500">
          All processing happens in your browser. No sequences are sent to a
          server.
        </p>
      </div>
      <section className="space-y-2 rounded-md border border-slate-200 bg-white p-3 text-xs text-slate-900 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Recent sequences
        </h3>
        {savedSequences.length === 0 ? (
          <p className="text-xs text-slate-500">
            Saved sequences you store here will appear as quick shortcuts.
          </p>
        ) : (
          <ul className="space-y-1">
            {savedSequences
              .slice()
              .sort(
                (a, b) =>
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
              )
              .map((entry) => (
                <li
                  key={entry.id}
                  className="flex items-center justify-between gap-2 rounded border border-slate-200 bg-slate-50 px-2 py-1"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-slate-900">
                      {entry.label}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {formatDateTime(entry.createdAt)}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleLoadSequence(entry)}
                    className="rounded-md border border-slate-300 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-800 hover:border-emerald-500 hover:text-emerald-700"
                  >
                    Load
                  </button>
                </li>
              ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default DnaSequenceExplorer;


