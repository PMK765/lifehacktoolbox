import type { Metadata } from "next";
import AlgorithmVisualizer from "@/components/AlgorithmVisualizer";

export const metadata: Metadata = {
  title: "Algorithm Visualizer (Sorting + Searching) | LifeHackToolbox",
  description:
    "Visualize sorting and searching algorithms like bubble sort, quicksort, merge sort, and binary search. Step through comparisons and swaps, control speed, and export a branded PNG report. Runs in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/algorithm-visualizer"
  }
};

const AlgorithmVisualizerPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Algorithm Visualizer (Sorting + Searching)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Watch algorithms work step-by-step. This tool visualizes common sorting algorithms and
          binary search with speed control, single-step playback, and counters for comparisons,
          swaps, and writes. Export a clean PNG report when you’re done.
        </p>
      </section>

      <section className="mt-6">
        <AlgorithmVisualizer />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          What is an algorithm visualizer?
        </h2>
        <p>
          An algorithm visualizer turns abstract steps into a concrete animation. For sorting, each
          bar represents a value in an array. Algorithms compare values and move them into order.
          For searching, binary search repeatedly halves the search range until it finds a target or
          proves it isn’t present.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Sorting: comparisons, swaps, and writes
        </h3>
        <p>
          Sorting algorithms are often analyzed by the number of comparisons and the number of
          element moves (swaps/writes). Bubble sort is simple but inefficient on large arrays.
          Merge sort is efficient and stable but uses additional memory. Quicksort is typically fast
          in practice but can degrade on certain patterns depending on pivot choice.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Searching: binary search requires sorted data
        </h3>
        <p>
          Binary search is fast because it eliminates half the remaining range each step. The key
          requirement is that the array must be sorted. This tool sorts your input before stepping
          through binary search, then highlights low/high/mid positions as it narrows the range.
        </p>
        <p>
          This tool runs entirely in the browser and stores your last-used settings in localStorage
          for convenience (clearing site data removes that history).
        </p>
      </section>
    </main>
  );
};

export default AlgorithmVisualizerPage;


