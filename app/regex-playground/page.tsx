import type { Metadata } from "next";
import RegexPlayground from "@/components/RegexPlayground";

export const metadata: Metadata = {
  title: "Regex Playground (Tester + Highlighter) | LifeHackToolbox",
  description:
    "Test regular expressions with highlighted matches, a match table with capture groups, beginner-friendly token explanations, presets, share links, and exportable PNG/JSON results. Runs in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/regex-playground"
  }
};

const RegexPlaygroundPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Regex Playground (Tester + Highlighter)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Test regular expressions against sample text, highlight matches, inspect capture
          groups, and learn common tokens. Use presets for email/URL/phone/date/CSV checks, copy
          shareable links, and export results.
        </p>
      </section>

      <section className="mt-6">
        <RegexPlayground />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          What is a regex playground?
        </h2>
        <p>
          A regex playground is an interactive place to write and test regular expressions
          (regex). Regex is a compact pattern language for searching, extracting, and validating
          text. Common uses include finding emails, URLs, phone numbers, dates, or parsing
          structured lines like CSV.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          How to use this regex tester
        </h3>
        <p>
          Enter a pattern and choose flags like <span className="font-mono">g</span> (global),
          <span className="font-mono"> i</span> (case-insensitive), or <span className="font-mono">m</span>{" "}
          (multiline). Paste test text and the tool will highlight matches and list them in a table
          with their indices and any capture groups.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Beginner-friendly token explanations
        </h3>
        <p>
          Regex can feel cryptic at first. The token panel explains common building blocks like{" "}
          <span className="font-mono">\\d</span> (digit), <span className="font-mono">+</span>{" "}
          (one or more), <span className="font-mono">[]</span> (character class), and grouping with{" "}
          <span className="font-mono">()</span>. This helps you connect the pattern you wrote to the
          behavior you see in the highlighted preview.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Privacy and local processing
        </h3>
        <p>
          This regex playground runs entirely in your browser. Your text is not uploaded to a server.
          The tool stores your last-used pattern and flags in localStorage for convenience (clearing
          site data removes that history).
        </p>
      </section>
    </main>
  );
};

export default RegexPlaygroundPage;


