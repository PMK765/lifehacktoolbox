import type { Metadata } from "next";
import Link from "next/link";
import DiffChecker from "@/components/DiffChecker";

export const metadata: Metadata = {
  title: "Diff Checker: Compare Text & Code | LifeHackToolbox",
  description:
    "Compare two blocks of text or code, highlight additions and deletions, and download the diff. Simple, fast, and fully client-side.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/diff-checker"
  }
};

export default function DiffCheckerPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Diff Checker: Compare Two Texts
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Paste two versions of a document or code snippet, see exactly what
          changed, and download a simple diff. Everything runs in your browser,
          with no accounts or uploads.
        </p>
      </section>
      <DiffChecker />
      <section
        aria-label="About diff checking"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Compare edits and revisions without heavy tooling
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            A diff checker highlights how one version of text differs from
            another. It is useful when reviewing edits to blog posts, checking
            email drafts, or comparing snippets of code before a commit. Instead
            of scanning line by line, you can see additions and deletions at a
            glance, with subtle color cues for what changed.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Use cases for a lightweight diff tool
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">
                Comparing versions of copy.
              </span>{" "}
              Paste an earlier draft on the left and a new draft on the right to
              see what a collaborator changed.
            </li>
            <li>
              <span className="font-medium">
                Reviewing small code changes.
              </span>{" "}
              Before committing, you can quickly compare two snippets to be sure
              nothing unexpected slipped in.
            </li>
            <li>
              <span className="font-medium">
                Tracking edits to support replies or emails.
              </span>{" "}
              If you write a sensitive response, it can be helpful to check
              exactly what changed between versions.
            </li>
          </ul>
          <h3 className="text-sm font-semibold text-slate-900">
            Line‑based vs word‑based diffs
          </h3>
          <p>
            Line‑based diffs treat each line as a unit, which works well for
            code and structured text. Word‑based diffs zoom in further and
            highlight individual word changes inside a line. This tool lets you
            toggle between those modes so you can either see high‑level
            structure or fine‑grained edits, depending on what you are
            reviewing.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Client‑side privacy for sensitive content
          </h3>
          <p>
            Many diff services upload your text to a remote server. That may not
            be ideal if you are comparing contracts, internal docs, or private
            messages. This Diff Checker runs entirely in your browser; the
            algorithm runs locally and nothing is sent to LifeHackToolbox or any
            third party. You can paste sensitive text, compare versions, and
            close the tab knowing the content never left your device.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Part of a small toolkit of text utilities
          </h3>
          <p>
            This page is built to pair with other developer‑friendly tools such
            as the{" "}
            <Link
              href="/json-linter"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              JSON Linter &amp; Formatter
            </Link>{" "}
            and future text utilities under a &quot;Developer Tools&quot; or
            &quot;Text &amp; Comparison&quot; section. Instead of a heavy IDE or
            complex version‑control UI, you get a simple browser tab that does
            one job cleanly.
          </p>
          <p>
            For more structured programming workflows you might still want full
            version control, but for quick checks—diffing two small files,
            reviewing an email rewrite, or comparing JSON payloads—this tool is
            faster to open and easier to share with non‑technical teammates.
          </p>
        </div>
      </section>
    </div>
  );
}


