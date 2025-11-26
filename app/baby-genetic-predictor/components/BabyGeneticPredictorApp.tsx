"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";
import HeightPredictor from "./HeightPredictor";
import EyeColorPredictor from "./EyeColorPredictor";
import HairColorPredictor from "./HairColorPredictor";

const BabyGeneticPredictorApp = () => {
  const containerRef =
    useRef<HTMLDivElement | null>(null);
  const [isExporting, setIsExporting] =
    useState(false);

  const scrollToSection = (
    id: "height" | "eyes" | "hair"
  ) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "start"
      });
    }
  };

  const handleExport = async () => {
    if (!containerRef.current || isExporting) {
      return;
    }
    setIsExporting(true);
    const node = containerRef.current;
    const canvas = await html2canvas(node, {
      backgroundColor: "#020617",
      scale: 2
    });
    const dataUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download =
      "lifehacktoolbox-baby-genetic-prediction.png";
    link.click();
    setIsExporting(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-1 shadow-xl ring-1 ring-slate-800/80">
        <ExportableImageFrame>
          <div
            ref={containerRef}
            className="space-y-6 rounded-[1.35rem] bg-gradient-to-b from-slate-950 via-slate-900/95 to-slate-950 p-4 sm:p-6 lg:p-8"
          >
            <header className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300/80">
                Family &amp; growth tools
              </p>
              <div className="flex flex-wrap items-baseline justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-slate-50 sm:text-3xl">
                    Baby Genetic Predictor
                  </h1>
                  <p className="mt-1 max-w-2xl text-sm text-slate-300">
                    Combine both parents&apos; traits to
                    estimate your child&apos;s adult height,
                    eye color and hair color using
                    science-inspired probability models.
                  </p>
                </div>
              </div>
              <nav className="sticky top-16 z-10 -mx-4 flex items-center gap-2 overflow-x-auto border-y border-emerald-500/20 bg-slate-950/95 px-4 py-2 text-xs backdrop-blur sm:rounded-full sm:border sm:px-3">
                <button
                  type="button"
                  onClick={() => scrollToSection("height")}
                  className="rounded-full bg-slate-800 px-3 py-1 font-medium text-slate-100 shadow-sm hover:bg-slate-700"
                >
                  Height
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("eyes")}
                  className="rounded-full bg-slate-800 px-3 py-1 font-medium text-slate-100 shadow-sm hover:bg-slate-700"
                >
                  Eye color
                </button>
                <button
                  type="button"
                  onClick={() => scrollToSection("hair")}
                  className="rounded-full bg-slate-800 px-3 py-1 font-medium text-slate-100 shadow-sm hover:bg-slate-700"
                >
                  Hair color
                </button>
                <div className="ml-auto flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExport}
                    disabled={isExporting}
                    className="inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-slate-950 shadow-sm hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span>Export result image</span>
                  </button>
                </div>
              </nav>
            </header>

            <div className="space-y-6 pt-2">
              <HeightPredictor id="height" />
              <EyeColorPredictor id="eyes" />
              <HairColorPredictor id="hair" />
            </div>
          </div>
        </ExportableImageFrame>
      </div>
      <section className="space-y-2 rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-sm md:p-6">
        <h2 className="text-base font-semibold tracking-tight">
          How this baby genetic predictor works
        </h2>
        <p className="text-sm text-slate-700">
          This tool combines classic mid-parental height
          calculations, polygenic-style eye color charts and
          simplified hair color inheritance models to give
          you visually clear, probabilistic insights into
          likely traits. It is for educational and
          illustrative purposes only and is not a medical or
          genetic test.
        </p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          <li>
            <span className="font-semibold">
              Height:
            </span>{" "}
            uses a normal distribution with a ±4&quot; range
            around the mid-parental prediction.
          </li>
          <li>
            <span className="font-semibold">
              Eye color:
            </span>{" "}
            based on aggregated counselor-style probability
            grids for brown, hazel, green, blue and gray
            eyes.
          </li>
          <li>
            <span className="font-semibold">
              Hair color:
            </span>{" "}
            models dark, light, blonde and red outcomes using
            simplified dominance and recessive patterns.
          </li>
        </ul>
      </section>
    </div>
  );
};

export default BabyGeneticPredictorApp;


