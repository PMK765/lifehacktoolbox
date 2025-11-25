import type { Metadata } from "next";
import Link from "next/link";
import JsonLinter from "@/components/JsonLinter";

export const metadata: Metadata = {
  title: "JSON Linter & Formatter | LifeHackToolbox",
  description:
    "Validate and format JSON in your browser. Pretty-print, minify, copy, and download JSON with instant error feedback. 100% free, no login required."
};

export default function JsonLinterPage() {
  return (
    <div className="space-y-10">
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
            or use future utilities under a &quot;Developer Tools&quot; section
            on LifeHackToolbox. All of these tools share the same philosophy:
            small, focused, privacy‑friendly utilities that you can open in a
            browser tab and trust.
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


