import type { Metadata } from "next";
import Link from "next/link";
import JsonLinter from "@/components/JsonLinter";
import { buildFaqPageJsonLd, buildWebApplicationJsonLd } from "@/lib/seoJsonLd";

export const metadata: Metadata = {
  title: "JSON Formatter & Linter: Validate, Pretty-Print, Minify | LifeHackToolbox",
  description:
    "JSON formatter and linter with instant validation, line/column errors, pretty-print and minify modes, plus copy/download. Runs entirely in your browser (no uploads).",
  alternates: {
    canonical: "https://lifehacktoolbox.com/json-linter"
  }
};

export default function JsonLinterPage() {
  const webAppJsonLd = buildWebApplicationJsonLd({
    name: "JSON Formatter & Linter",
    description:
      "Validate JSON, see line/column errors, and format or minify JSON locally in your browser.",
    url: "https://lifehacktoolbox.com/json-linter",
    applicationCategory: "DeveloperApplication"
  });

  const faqItems = [
    {
      question: "What is a JSON linter?",
      answer:
        "A JSON linter checks whether a JSON document is valid and points out where it breaks the JSON rules, often with line and column information."
    },
    {
      question: "Why does JSON require double quotes?",
      answer:
        "JSON is a strict data format. Strings and object keys must use double quotes to keep parsing consistent across languages and tools."
    },
    {
      question: "Does JSON allow comments or trailing commas?",
      answer:
        "Standard JSON does not allow comments or trailing commas. Some tools support JSON5 or JSONC variants, but many APIs and config systems require strict JSON."
    },
    {
      question: "How do I minify JSON?",
      answer:
        "Minifying JSON removes whitespace and line breaks to produce a compact single-line string. This is useful when you need to embed JSON in a small space or reduce payload size."
    },
    {
      question: "Is my JSON uploaded anywhere?",
      answer:
        "No. This JSON tool runs entirely in your browser. Your data is not sent to a server for validation or formatting."
    }
  ] as const;

  const faqJsonLd = buildFaqPageJsonLd([...faqItems]);

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          JSON Linter &amp; Formatter
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Paste or type JSON, validate it instantly, and format or minify it in
          your browser. Copy the result to your clipboard or download it as a
          .json file with no uploads or accounts required.
        </p>
      </section>
      <JsonLinter />
      <section
        aria-label="About JSON and formatting"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Work with JSON safely in your browser
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            JSON (JavaScript Object Notation) is a lightweight format for
            representing structured data. It powers most modern web APIs,
            configuration files, and many logging formats. You see it when you
            work with REST endpoints, front‑end state, or cloud provider
            settings. Because JSON is strict about commas, quotes, and braces,
            a single typo can make a whole payload invalid.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Common JSON mistakes this tool can help catch
          </h3>
          <p>
            When editing JSON by hand, a few problems show up over and over:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Trailing commas.</span> JSON does
              not allow a comma after the last item in an array or object.
            </li>
            <li>
              <span className="font-medium">Unquoted keys.</span> Object keys
              must be wrapped in double quotes, not left bare like in some
              JavaScript code.
            </li>
            <li>
              <span className="font-medium">Single quotes.</span> JSON requires
              double quotes around strings; single quotes cause parse errors.
            </li>
            <li>
              <span className="font-medium">Mismatched braces or brackets.</span>{" "}
              Missing a closing <code className="font-mono text-xs">{`}`}</code>{" "}
              or <code className="font-mono text-xs">{`]`}</code> can be hard to
              see in long payloads.
            </li>
          </ul>
          <p>
            The linter highlights invalid JSON and reports an error with a line
            and column number so you can jump directly to the problem. Once your
            JSON is valid, the formatter can pretty‑print it with 2‑ or 4‑space
            indentation, or minify it down to a single line for use in query
            strings or compact config values.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Quick examples you can test
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Valid object:</span>{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-800">
                {"{\"name\":\"Ada\",\"active\":true,\"score\":42}"}
              </code>
            </li>
            <li>
              <span className="font-medium">Trailing comma (invalid JSON):</span>{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-800">
                {"{\"a\":1,}"}
              </code>
            </li>
            <li>
              <span className="font-medium">Unquoted key (invalid JSON):</span>{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 font-mono text-xs text-slate-800">
                {"{a:1}"}
              </code>
            </li>
          </ul>
          <p>
            If you are copying JSON out of logs or a browser console, watch for subtle issues like
            smart quotes, missing escaping in strings, or pasted content that includes comments. Most APIs and configuration
            systems expect strict JSON, so validating before you ship a payload is usually worth it.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why a client‑side JSON tool matters for privacy
          </h3>
          <p>
            Many JSON linters send your data to a remote server for validation.
            That can be a problem if you are working with production API
            responses, internal configuration, or anything that contains
            customer data. This tool runs entirely in your browser: parsing,
            formatting, and error reporting all happen locally using your
            device&apos;s CPU. Nothing is uploaded, so you can safely paste
            internal payloads without worrying about where they go.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Part of a small set of developer utilities
          </h3>
          <p>
            The JSON Linter &amp; Formatter is designed to pair well with other
            lightweight developer tools. For example, you can compare two
            versions of a JSON document with the{" "}
            <Link
              href="/diff-checker"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Diff Checker
            </Link>{" "}
            , test patterns against log lines in the{" "}
            <Link
              href="/regex-playground"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Regex Playground
            </Link>
            , or generate secure credentials with the{" "}
            <Link
              href="/password-generator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Random Password Generator
            </Link>
            . All of these tools share the same philosophy: small, focused, privacy‑friendly utilities that you can open in a browser tab and trust.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Related tools
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Link href="/diff-checker" className="font-medium text-emerald-700 hover:text-emerald-800">
                Diff Checker
              </Link>
            </li>
            <li>
              <Link href="/regex-playground" className="font-medium text-emerald-700 hover:text-emerald-800">
                Regex Playground
              </Link>
            </li>
            <li>
              <Link href="/pdf-signature-editor" className="font-medium text-emerald-700 hover:text-emerald-800">
                PDF Signature &amp; Form Filler
              </Link>
            </li>
            <li>
              <Link href="/resume-builder" className="font-medium text-emerald-700 hover:text-emerald-800">
                Resume Builder
              </Link>
            </li>
          </ul>
          <h2 className="text-base font-semibold text-slate-900">
            JSON formatter FAQ
          </h2>
          <h3 className="text-sm font-semibold text-slate-900">
            What is a JSON linter?
          </h3>
          <p>
            A JSON linter checks whether your JSON is valid and helps you find where it breaks. That usually means identifying the first syntax error and pointing to a line and column so you can fix it quickly.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why is my JSON valid in JavaScript but invalid here?
          </h3>
          <p>
            JavaScript object literals allow things JSON does not, like single quotes, unquoted keys, comments, and trailing commas. Many APIs and config systems require strict JSON, so the stricter rules are a feature.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            What indentation should I choose?
          </h3>
          <p>
            Two spaces is common in many repos and keeps files compact. Four spaces can be easier to read for deeply nested documents. Choose what matches your project’s conventions.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Does formatting change the meaning of JSON?
          </h3>
          <p>
            Pretty-printing or minifying changes whitespace only. It does not change the actual values. The main exception is when you are relying on exact string formatting inside a JSON string value, which is rare and should be intentional.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Is my JSON uploaded?
          </h3>
          <p>
            No. Validation and formatting happen locally in your browser. Nothing is uploaded to LifeHackToolbox or a third-party service.
          </p>
          <p>
            Because everything runs client‑side, you can use this JSON tool even
            on slow or locked‑down networks. There are no logins, no telemetry,
            and no sync process; you simply paste, format, and copy the result.
            If you find it useful, you can bookmark this page or share it with
            teammates who regularly debug JSON payloads.
          </p>
        </div>
      </section>
    </div>
  );
}


