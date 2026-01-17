import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import RegexPlayground from "@/components/RegexPlayground";
import { buildFaqPageJsonLd, buildWebApplicationJsonLd } from "@/lib/seoJsonLd";

export const metadata: Metadata = {
  title: "Regex Tester & Playground: Highlight Matches, Groups, Presets | LifeHackToolbox",
  description:
    "Regex tester with match highlighting, capture group table, token explanations, presets, and shareable links. Debug patterns for emails, URLs, dates, and more. Runs in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/regex-playground"
  }
};

const RegexPlaygroundPage = () => {
  const webAppJsonLd = buildWebApplicationJsonLd({
    name: "Regex Playground (Tester + Highlighter)",
    description:
      "Test regex patterns against text, highlight matches, inspect groups, and use presets. Runs entirely in your browser.",
    url: "https://lifehacktoolbox.com/regex-playground",
    applicationCategory: "DeveloperApplication"
  });

  const faqItems = [
    {
      question: "What is a regex playground?",
      answer:
        "A regex playground is an interactive tool for writing and testing regular expressions against sample text so you can see matches, groups, and edge cases instantly."
    },
    {
      question: "What do regex flags like g, i, and m mean?",
      answer:
        "g finds all matches, i makes matching case-insensitive, and m treats ^ and $ as start/end of each line instead of the whole string."
    },
    {
      question: "What are capture groups?",
      answer:
        "Capture groups are parentheses in a pattern that extract parts of a match, like a username and domain from an email. The match table shows captured values by group index."
    },
    {
      question: "Why does my pattern get rejected as unsupported?",
      answer:
        "This tool validates a safe subset of JavaScript regex so it can provide predictable behavior without crashing the UI. Some advanced constructs may be blocked."
    },
    {
      question: "Does this regex tester upload my text?",
      answer:
        "No. Matching and highlighting run locally in your browser. Your pasted text is not sent to a server."
    }
  ] as const;

  const faqJsonLd = buildFaqPageJsonLd([...faqItems]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
        <Suspense
          fallback={
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-700 shadow-sm">
              Loading Regex Playground…
            </div>
          }
        >
          <RegexPlayground />
        </Suspense>
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
          Common tasks: validate, extract, and clean text
        </h3>
        <p>
          Regex is useful in two broad modes: <span className="font-semibold">validation</span> and{" "}
          <span className="font-semibold">extraction</span>. Validation patterns are often anchored with{" "}
          <span className="font-mono">^</span> and <span className="font-mono">$</span> to ensure the{" "}
          entire string matches. Extraction patterns are usually global and designed to find multiple matches inside a larger body of text.
        </p>
        <p>
          This page is built for both. You can quickly test a “does this match?” validator, then tweak it into a global extractor that pulls multiple results out of logs, emails, or copied documents.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Practical examples you can paste
        </h3>
        <p>
          If you are learning regex, start with small examples and grow them. Try these:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium">Find emails in text:</span>{" "}
            Use the preset, then paste a paragraph with two email addresses and confirm the match table returns both.
          </li>
          <li>
            <span className="font-medium">Extract parts with capture groups:</span>{" "}
            Pattern{" "}
            <span className="font-mono">([A-Za-z0-9._%+-]+)@([A-Za-z0-9.-]+)</span>{" "}
            captures username (group 1) and domain (group 2).
          </li>
          <li>
            <span className="font-medium">Validate an ISO-ish date:</span>{" "}
            Pattern <span className="font-mono">{"^\\d{4}-\\d{2}-\\d{2}$"}</span>{" "}
            matches a YYYY-MM-DD shape. It does not verify real month/day ranges, but it catches many formatting mistakes.
          </li>
          <li>
            <span className="font-medium">Clean repeated whitespace:</span>{" "}
            Use <span className="font-mono">\\s+</span> to find runs of whitespace. This is useful before you copy text into a strict format.
          </li>
        </ul>
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
          Flags and how they change results
        </h3>
        <p>
          Flags are a common source of confusion because a correct pattern can look “broken” if a flag is missing.{" "}
          <span className="font-mono">g</span> returns all matches instead of just the first.{" "}
          <span className="font-mono">i</span> ignores case, which matters for user input.{" "}
          <span className="font-mono">m</span> makes <span className="font-mono">^</span> and{" "}
          <span className="font-mono">$</span> operate per line.{" "}
          <span className="font-mono">s</span> lets <span className="font-mono">.</span> match newlines.{" "}
          <span className="font-mono">u</span> enables Unicode-aware behavior in JavaScript engines, but it can change how characters are counted and matched.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Limitations: safe subset, not every advanced regex feature
        </h3>
        <p>
          This tool intentionally validates a safe subset of JavaScript regex. Some advanced constructs may be rejected so the playground can remain stable and predictable. If your pattern uses uncommon features and gets blocked, simplify it or break the task into smaller steps.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Privacy and local processing
        </h3>
        <p>
          This regex playground runs entirely in your browser. Your text is not uploaded to a server.
          The tool stores your last-used pattern and flags in localStorage for convenience (clearing
          site data removes that history).
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Related tools
        </h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/json-linter" className="font-medium text-emerald-700 underline underline-offset-2">
              JSON Linter &amp; Formatter
            </Link>
          </li>
          <li>
            <Link href="/diff-checker" className="font-medium text-emerald-700 underline underline-offset-2">
              Diff Checker
            </Link>
          </li>
          <li>
            <Link href="/password-generator" className="font-medium text-emerald-700 underline underline-offset-2">
              Random Password Generator
            </Link>
          </li>
          <li>
            <Link href="/email-signature-generator" className="font-medium text-emerald-700 underline underline-offset-2">
              Email Signature Generator
            </Link>
          </li>
        </ul>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Regex playground FAQ
        </h2>
        <h3 className="text-base font-semibold text-slate-900">
          What is the difference between “match” and “search”?
        </h3>
        <p>
          A search finds a pattern anywhere in text. A validator usually anchors the pattern so the entire string must match. If you want validation, start your pattern with <span className="font-mono">^</span> and end with <span className="font-mono">$</span>.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Why does my pattern only return one result?
        </h3>
        <p>
          In many regex engines, you need the global flag <span className="font-mono">g</span> to return all matches. Without it, you may only see the first match even if the pattern appears many times.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          How do capture groups show up in results?
        </h3>
        <p>
          Parentheses create capture groups. The match table lists each match and the captured group values so you can verify you are extracting the correct pieces.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Why are some patterns blocked?
        </h3>
        <p>
          The playground validates a conservative subset of JavaScript regex so it can behave consistently and avoid unstable patterns. If a pattern is blocked, simplify it or remove uncommon constructs.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Is my pasted text uploaded?
        </h3>
        <p>
          No. Matching and highlighting happen locally in your browser. Your text is not sent to a server.
        </p>
      </section>
    </main>
  );
};

export default RegexPlaygroundPage;


