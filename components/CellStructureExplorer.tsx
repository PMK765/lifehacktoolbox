"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import type { OrganelleId } from "@/data/cellStructure";
import { ORGANELLES, organelleById } from "@/data/cellStructure";

type QuizState = {
  isActive: boolean;
  targetId: OrganelleId | null;
  score: number;
  total: number;
  bestScore: number;
};

const QUIZ_STORAGE_KEY = "lht_cell_structure_quiz_v1";

const pickRandomOrganelleId = (exclude: OrganelleId | null): OrganelleId => {
  const pool = ORGANELLES.map((o) => o.id).filter((id) => id !== exclude);
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx] ?? ORGANELLES[0].id;
};

const normalizeText = (text: string): string =>
  text.trim().toLowerCase().replace(/\s+/g, " ");

const CellStructureExplorer = () => {
  const [selectedId, setSelectedId] = useState<OrganelleId | null>("nucleus");
  const [query, setQuery] = useState("");
  const [quiz, setQuiz] = useState<QuizState>({
    isActive: false,
    targetId: null,
    score: 0,
    total: 0,
    bestScore: 0
  });
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const infoExportRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const raw = window.localStorage.getItem(QUIZ_STORAGE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Partial<QuizState>;
    if (typeof parsed.bestScore === "number" && Number.isFinite(parsed.bestScore)) {
      setQuiz((prev) => ({ ...prev, bestScore: parsed.bestScore }));
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(
      QUIZ_STORAGE_KEY,
      JSON.stringify({ bestScore: quiz.bestScore })
    );
  }, [quiz.bestScore]);

  const filteredOrganelles = useMemo(() => {
    const q = normalizeText(query);
    if (!q) return ORGANELLES;
    return ORGANELLES.filter((o) => {
      const haystack = normalizeText(
        `${o.name} ${o.function} ${o.funFact} ${o.memoryTip} ${o.keywords.join(" ")}`
      );
      return haystack.includes(q);
    });
  }, [query]);

  const selected = selectedId ? organelleById(selectedId) : undefined;

  const activeHighlightId = quiz.isActive && quiz.targetId ? quiz.targetId : selectedId;

  const startQuiz = () => {
    const next = pickRandomOrganelleId(null);
    setQuiz((prev) => ({
      ...prev,
      isActive: true,
      targetId: next,
      score: 0,
      total: 0
    }));
    setSelectedId(null);
    setFeedback(null);
  };

  const stopQuiz = () => {
    setQuiz((prev) => ({ ...prev, isActive: false, targetId: null }));
    setFeedback(null);
  };

  const submitGuess = (guessId: OrganelleId) => {
    if (!quiz.isActive || !quiz.targetId) {
      setSelectedId(guessId);
      return;
    }
    const isCorrect = guessId === quiz.targetId;
    setQuiz((prev) => {
      const nextTotal = prev.total + 1;
      const nextScore = prev.score + (isCorrect ? 1 : 0);
      const nextBest = Math.max(prev.bestScore, nextScore);
      return {
        ...prev,
        total: nextTotal,
        score: nextScore,
        bestScore: nextBest,
        targetId: pickRandomOrganelleId(prev.targetId)
      };
    });
    setFeedback(isCorrect ? "Correct." : "Not quite.");
    window.setTimeout(() => setFeedback(null), 900);
  };

  const handleDiagramClick = (id: OrganelleId) => {
    if (quiz.isActive) {
      submitGuess(id);
      return;
    }
    setSelectedId(id);
  };

  const handleExportInfoCard = async () => {
    if (!infoExportRef.current || isExporting) return;
    setIsExporting(true);
    const canvas = await html2canvas(infoExportRef.current, {
      backgroundColor: "#0b1220",
      scale: 2
    });
    const url = canvas.toDataURL("image/png");
    const a = document.createElement("a");
    const stamp = new Date().toISOString().slice(0, 19);
    a.href = url;
    a.download = `lifehacktoolbox-cell-organelle-${stamp}.png`;
    a.click();
    setIsExporting(false);
  };

  const quizPrompt = useMemo(() => {
    if (!quiz.isActive || !quiz.targetId) return null;
    const target = organelleById(quiz.targetId);
    return target ? `Tap: ${target.name}` : "Tap the highlighted organelle";
  }, [quiz.isActive, quiz.targetId]);

  const highlightStroke = (id: OrganelleId) =>
    activeHighlightId === id ? "rgba(52, 211, 153, 0.95)" : "rgba(148, 163, 184, 0.25)";

  const highlightFill = (id: OrganelleId) =>
    activeHighlightId === id ? "rgba(52, 211, 153, 0.18)" : "rgba(255, 255, 255, 0.06)";

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <header className="space-y-1">
            <h2 className="text-sm font-semibold text-slate-900">
              Interactive cell diagram
            </h2>
            <p className="text-[11px] text-slate-600">
              Tap organelles to learn what they do. Use Study Mode to quiz yourself.
            </p>
          </header>

          <div className="rounded-2xl border border-slate-200 bg-slate-950 p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-[11px] text-slate-300">
                {quiz.isActive ? (
                  <span className="font-semibold text-emerald-300">{quizPrompt}</span>
                ) : selected ? (
                  <span>
                    Selected:{" "}
                    <span className="font-semibold text-slate-100">{selected.name}</span>
                  </span>
                ) : (
                  <span>Select an organelle to see details.</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {quiz.isActive ? (
                  <button
                    type="button"
                    onClick={stopQuiz}
                    className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-100 hover:bg-slate-800"
                  >
                    End study mode
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={startQuiz}
                    className="rounded-md bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-emerald-500"
                  >
                    Start study mode
                  </button>
                )}
              </div>
            </div>

            {quiz.isActive && (
              <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-300">
                <span>
                  Score:{" "}
                  <span className="font-mono text-slate-100">
                    {quiz.score} / {quiz.total}
                  </span>
                </span>
                <span>
                  Best:{" "}
                  <span className="font-mono text-slate-100">{quiz.bestScore}</span>
                </span>
                {feedback && (
                  <span className="font-semibold text-emerald-300">{feedback}</span>
                )}
              </div>
            )}

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-800 bg-[#0b1220]">
              <svg
                viewBox="0 0 860 520"
                className="h-[360px] w-full select-none md:h-[420px]"
                role="img"
                aria-label="Animal cell diagram"
              >
                <defs>
                  <radialGradient id="cellGrad" cx="50%" cy="45%" r="60%">
                    <stop offset="0%" stopColor="#1f2a44" />
                    <stop offset="100%" stopColor="#0b1220" />
                  </radialGradient>
                  <radialGradient id="nucleusGrad" cx="45%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.9" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.9" />
                  </radialGradient>
                </defs>

                <g
                  onClick={() => handleDiagramClick("cell_membrane")}
                  style={{ cursor: "pointer" }}
                >
                  <ellipse
                    cx="430"
                    cy="260"
                    rx="360"
                    ry="220"
                    fill="url(#cellGrad)"
                    stroke={highlightStroke("cell_membrane")}
                    strokeWidth="5"
                  />
                </g>

                <g
                  onClick={() => handleDiagramClick("cytoplasm")}
                  style={{ cursor: "pointer" }}
                >
                  <ellipse
                    cx="430"
                    cy="260"
                    rx="330"
                    ry="195"
                    fill={highlightFill("cytoplasm")}
                    stroke={highlightStroke("cytoplasm")}
                    strokeWidth="2"
                    opacity="0.9"
                  />
                </g>

                <g
                  onClick={() => handleDiagramClick("nucleus")}
                  style={{ cursor: "pointer" }}
                >
                  <ellipse
                    cx="350"
                    cy="250"
                    rx="105"
                    ry="88"
                    fill="url(#nucleusGrad)"
                    stroke={highlightStroke("nucleus")}
                    strokeWidth="3"
                  />
                </g>

                <g
                  onClick={() => handleDiagramClick("nucleolus")}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx="320"
                    cy="250"
                    r="28"
                    fill="rgba(251, 146, 60, 0.9)"
                    stroke={highlightStroke("nucleolus")}
                    strokeWidth="3"
                  />
                </g>

                <g
                  onClick={() => handleDiagramClick("rough_er")}
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d="M455 175 C520 130, 585 140, 635 175 C580 205, 530 220, 455 205 Z"
                    fill="rgba(148, 163, 184, 0.18)"
                    stroke={highlightStroke("rough_er")}
                    strokeWidth="3"
                  />
                  <g fill="rgba(226, 232, 240, 0.8)">
                    {new Array(16).fill(0).map((_, i) => {
                      const x = 485 + (i % 8) * 18;
                      const y = 176 + Math.floor(i / 8) * 18;
                      return <circle key={i} cx={x} cy={y} r="3" />;
                    })}
                  </g>
                </g>

                <g
                  onClick={() => handleDiagramClick("smooth_er")}
                  style={{ cursor: "pointer" }}
                >
                  <path
                    d="M430 330 C500 305, 560 320, 610 355 C560 380, 500 395, 430 380 Z"
                    fill="rgba(96, 165, 250, 0.18)"
                    stroke={highlightStroke("smooth_er")}
                    strokeWidth="3"
                  />
                </g>

                <g
                  onClick={() => handleDiagramClick("golgi")}
                  style={{ cursor: "pointer" }}
                >
                  {[
                    "M540 250 C585 225, 635 235, 670 260",
                    "M540 270 C590 250, 645 260, 675 290",
                    "M540 290 C590 275, 650 285, 670 315",
                    "M540 310 C590 300, 640 315, 660 340"
                  ].map((d, idx) => (
                    <path
                      key={idx}
                      d={d}
                      fill="none"
                      stroke={highlightStroke("golgi")}
                      strokeWidth={idx === 0 ? 5 : 4}
                      strokeLinecap="round"
                      opacity="0.85"
                    />
                  ))}
                </g>

                <g
                  onClick={() => handleDiagramClick("mitochondrion")}
                  style={{ cursor: "pointer" }}
                >
                  <ellipse
                    cx="470"
                    cy="410"
                    rx="90"
                    ry="42"
                    fill="rgba(244, 63, 94, 0.28)"
                    stroke={highlightStroke("mitochondrion")}
                    strokeWidth="3"
                  />
                  <path
                    d="M410 410 C430 395, 450 430, 470 412 C490 395, 510 430, 530 410"
                    fill="none"
                    stroke="rgba(255,255,255,0.45)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </g>

                <g
                  onClick={() => handleDiagramClick("lysosome")}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx="260"
                    cy="355"
                    r="26"
                    fill="rgba(236, 72, 153, 0.35)"
                    stroke={highlightStroke("lysosome")}
                    strokeWidth="3"
                  />
                </g>

                <g
                  onClick={() => handleDiagramClick("centrosome")}
                  style={{ cursor: "pointer" }}
                >
                  <circle
                    cx="240"
                    cy="220"
                    r="20"
                    fill="rgba(250, 204, 21, 0.28)"
                    stroke={highlightStroke("centrosome")}
                    strokeWidth="3"
                  />
                  <path
                    d="M225 220 L255 220 M240 205 L240 235"
                    stroke="rgba(255,255,255,0.55)"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </g>

                <g
                  onClick={() => handleDiagramClick("ribosomes")}
                  style={{ cursor: "pointer" }}
                >
                  {[
                    [365, 350],
                    [390, 320],
                    [330, 330],
                    [610, 210],
                    [585, 185],
                    [555, 365],
                    [510, 210],
                    [300, 180]
                  ].map(([x, y], idx) => (
                    <circle
                      key={idx}
                      cx={x}
                      cy={y}
                      r="6"
                      fill="rgba(226, 232, 240, 0.85)"
                      stroke={highlightStroke("ribosomes")}
                      strokeWidth="2"
                      opacity="0.9"
                    />
                  ))}
                </g>
              </svg>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <label className="space-y-1 text-xs text-slate-700">
              <span className="font-medium text-slate-700">Search organelles</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
                placeholder="Type: nucleus, energy, protein, detox…"
                spellCheck={false}
              />
            </label>

            <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {filteredOrganelles.map((o) => {
                const isSelected = selectedId === o.id;
                const isQuizTarget = quiz.isActive && quiz.targetId === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => submitGuess(o.id)}
                    className={`rounded-lg border px-3 py-2 text-left text-xs font-semibold transition ${
                      isQuizTarget
                        ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                        : isSelected
                        ? "border-slate-400 bg-white text-slate-900"
                        : "border-slate-200 bg-white text-slate-800 hover:border-slate-300"
                    }`}
                  >
                    {o.name}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <ExportableImageFrame
            title="Organelle info snapshot"
            ref={infoExportRef}
            className="bg-slate-950 text-slate-100 border-slate-800"
          >
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="space-y-0.5">
                  <p className="text-xs font-semibold text-slate-100">
                    Cell Structure Explorer
                  </p>
                  <p className="text-[11px] text-slate-300">
                    {selected ? (
                      <>
                        Selected:{" "}
                        <span className="font-semibold text-emerald-300">
                          {selected.name}
                        </span>
                      </>
                    ) : (
                      "Select an organelle to see details."
                    )}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportInfoCard}
                  disabled={!selected || isExporting}
                  className="rounded-md bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isExporting ? "Exporting…" : "Export PNG"}
                </button>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3">
                {!selected ? (
                  <p className="text-sm text-slate-400">
                    Choose an organelle from the diagram or search list.
                  </p>
                ) : (
                  <div className="space-y-3">
                    <div className="rounded-lg border border-slate-800 bg-white/5 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Function
                      </p>
                      <p className="mt-2 text-sm text-slate-100">
                        {selected.function}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-white/5 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Fun fact
                      </p>
                      <p className="mt-2 text-sm text-slate-100">
                        {selected.funFact}
                      </p>
                    </div>
                    <div className="rounded-lg border border-slate-800 bg-white/5 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-300">
                        Memory tip
                      </p>
                      <p className="mt-2 text-sm text-slate-100">
                        {selected.memoryTip}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-[11px] text-slate-400">
                Educational diagram for learning. Visual proportions are stylized, not to scale.
              </p>
            </div>
          </ExportableImageFrame>
        </section>
      </div>
    </div>
  );
};

export default CellStructureExplorer;


