import type { Metadata } from "next";
import Link from "next/link";
import DiffChecker from "@/components/DiffChecker";
import { buildFaqPageJsonLd, buildWebApplicationJsonLd } from "@/lib/seoJsonLd";

export const metadata: Metadata = {
  title: "Diff Checker: Compare Text & Code (Side-by-Side / Unified) | LifeHackToolbox",
  description:
    "Diff checker to compare two text blocks or code snippets. Highlight additions/deletions, switch line vs word diff, and download a .txt diff. Runs in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/diff-checker"
  }
};

export default function DiffCheckerPage() {
  const webAppJsonLd = buildWebApplicationJsonLd({
    name: "Diff Checker",
    description:
      "Compare two versions of text or code with highlights for additions and deletions. Runs entirely in your browser.",
    url: "https://lifehacktoolbox.com/diff-checker",
    applicationCategory: "DeveloperApplication"
  });

  const faqItems = [
    {
      question: "What is a diff checker?",
      answer:
        "A diff checker compares two versions of text and highlights what was added, removed, or changed. It is commonly used for code reviews, document edits, and revision tracking."
    },
    {
      question: "What is the difference between unified and side-by-side diffs?",
      answer:
        "Side-by-side shows the old and new text in two columns. Unified shows a single combined view where additions and deletions appear inline. Side-by-side is great for scanning; unified is great for sharing."
    },
    {
      question: "When should I use line-based vs word-based diff?",
      answer:
        "Line-based diff is best for code and structured text. Word-based diff is better for prose because it highlights small edits inside lines."
    },
    {
      question: "Why do I see changes that look identical?",
      answer:
        "Some changes come from whitespace differences or line-ending differences (LF vs CRLF). If something looks identical, try switching diff mode or checking for extra spaces or blank lines."
    },
    {
      question: "Does this tool upload the text I paste?",
      answer:
        "No. This diff checker runs locally in your browser and does not send your content to a server."
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
            Examples you can try
          </h3>
          <p>
            A quick way to understand diffs is to paste a small before/after pair. For example,
            put this on the left:
          </p>
          <p className="rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-800">
            {"Hello team,\n\nPlease review the draft.\n\nThanks,\nPat"}
          </p>
          <p>
            And this on the right:
          </p>
          <p className="rounded-md bg-slate-50 p-3 font-mono text-xs text-slate-800">
            {"Hello team,\n\nPlease review the updated draft.\n\nThanks,\nPat"}
          </p>
          <p>
            Word-based diff will highlight the single word change, while line-based diff will show which line changed.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Common edge cases: whitespace and line endings
          </h3>
          <p>
            If the diff looks noisy, the issue is often invisible whitespace: extra spaces, tabs, or different newlines.
            Some systems store text with Windows line endings (CRLF) while others use Unix line endings (LF). This tool
            will still compare the raw text, so those differences can appear as changes even when the visible text looks the same.
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
            , the{" "}
            <Link
              href="/regex-playground"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Regex Playground
            </Link>
            , and the{" "}
            <Link
              href="/pdf-signature-editor"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              PDF Signature &amp; Form Filler
            </Link>
            . Instead of a heavy IDE or complex version‑control UI, you get a simple browser tab that does one job cleanly.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Related tools
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <Link href="/json-linter" className="font-medium text-emerald-700 hover:text-emerald-800">
                JSON Linter &amp; Formatter
              </Link>
            </li>
            <li>
              <Link href="/regex-playground" className="font-medium text-emerald-700 hover:text-emerald-800">
                Regex Playground
              </Link>
            </li>
            <li>
              <Link href="/resume-builder" className="font-medium text-emerald-700 hover:text-emerald-800">
                Resume Builder
              </Link>
            </li>
            <li>
              <Link href="/qr-code-generator" className="font-medium text-emerald-700 hover:text-emerald-800">
                QR Code Generator
              </Link>
            </li>
          </ul>
          <h2 className="text-base font-semibold text-slate-900">
            Diff checker FAQ
          </h2>
          <h3 className="text-sm font-semibold text-slate-900">
            What is a diff checker used for?
          </h3>
          <p>
            A diff checker is used to see what changed between two versions of text: edits to a paragraph, changes to an email draft, or differences between two code snippets.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Which view should I use: unified or side-by-side?
          </h3>
          <p>
            Side-by-side is better when you want to scan two versions in parallel. Unified is better when you want a single artifact you can copy or download and share.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why does it show changes for identical lines?
          </h3>
          <p>
            Usually it is whitespace: an extra space, a tab, or different line endings. If you suspect that, try a word-based diff and look closely for trailing spaces or blank lines.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Can I diff JSON specifically?
          </h3>
          <p>
            Yes, but formatting first can make diffs clearer. A common workflow is to pretty-print both JSON payloads in the JSON Linter &amp; Formatter, then compare the formatted versions here.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Is the text uploaded anywhere?
          </h3>
          <p>
            No. This tool runs entirely in your browser and does not upload the text you paste.
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


