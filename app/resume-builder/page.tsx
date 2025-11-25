import type { Metadata } from "next";
import Link from "next/link";
import ResumeBuilder from "./ResumeBuilder";

export const metadata: Metadata = {
  title: "Free Resume Builder (ATS-Friendly, No Login) | LifeHackToolbox",
  description:
    "Build a clean, ATS-friendly resume in your browser with no login or paywall. Pick a template, tailor it to your career, and export to PDF, Word, text, or Markdown.",
  openGraph: {
    title: "Free Resume Builder (ATS-Friendly, No Login) | LifeHackToolbox",
    description:
      "Create an ATS-friendly resume with presets by career and experience level. Export to PDF, DOCX, TXT, or Markdown. 100% browser-based and private.",
    url: "https://lifehacktoolbox.com/resume-builder",
    siteName: "LifeHackToolbox",
    type: "website"
  }
};

export default function ResumeBuilderPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Free Resume Builder (No Login, ATS-Friendly)
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Build a clean, recruiter-ready resume entirely in your browser. Pick a
          template, tailor it to your career track and experience level, and
          export to PDF, Word, plain text, or Markdown without creating an
          account.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Your resume content is stored only in this browser using local
          storage. If you clear your browser data or switch devices, your drafts
          may be lost. Export a copy regularly if you want a long-term backup.
        </p>
      </section>
      <ResumeBuilder />
      <article
        aria-label="How to use this free ATS-friendly resume builder"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Build an ATS-friendly resume with no logins or paywalls
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Many online resume builders hide basic exports behind paywalls or
            require you to create an account before you can even download a PDF.
            This free resume builder on LifeHackToolbox takes a different
            approach. Everything runs in your browser, there is no login, and
            you stay in control of your data from the first keystroke to the
            final export.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            What makes a resume ATS friendly
          </h3>
          <p>
            Applicant Tracking Systems (ATS) scan resumes for headings, dates,
            and keywords before a human ever reads them. To keep your resume ATS
            friendly, this builder uses clear section headings, simple layouts,
            and text-based formatting instead of tables or heavy graphics. That
            makes it easier for automated resume parsers and human recruiters to
            understand your experience without guesswork.
          </p>
          <p>
            You can paste a target job description into the ATS helper panel to
            see which important keywords you are already using and where you
            might need stronger alignment. The tool never sends that text to a
            server; the analysis is done locally on your device.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            How to use this free resume builder
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">
                Pick your career track and experience level.
              </span>{" "}
              Choose presets that match your role, such as software engineer,
              product manager, healthcare, or student entry-level. The builder
              adjusts section ordering and suggestions based on your choice.
            </li>
            <li>
              <span className="font-medium">
                Select a resume style template.
              </span>{" "}
              All templates are ATS-friendly and focus on typography, spacing,
              and hierarchy rather than flashy graphics, so your resume stays
              readable in both PDF and DOCX form.
            </li>
            <li>
              <span className="font-medium">
                Fill out summary, skills, experience, and education.
              </span>{" "}
              Add bullet points that describe impact, not just responsibilities.
              Where possible, include numbers that show scope, money saved, or
              time reduced.
            </li>
            <li>
              <span className="font-medium">
                Paste a target job description for keyword guidance.
              </span>{" "}
              The ATS helper highlights which key terms from the description you
              already include and suggests where you can improve coverage
              without resorting to keyword stuffing.
            </li>
            <li>
              <span className="font-medium">
                Export your resume in the formats you need.
              </span>{" "}
              Use the export controls to download a print-ready PDF, a DOCX file
              for editing in Word, or a plain-text or Markdown version for ATS
              portals that prefer raw text.
            </li>
          </ul>
          <h3 className="text-sm font-semibold text-slate-900">
            Privacy-first resume builder with no login
          </h3>
          <p>
            This resume builder is designed for privacy. Your content is stored
            locally in your browser using local storage, which means nothing is
            uploaded or synced to a remote server. That is ideal when your
            resume contains sensitive details about employers, locations, or
            projects you are not ready to share widely.
          </p>
          <p>
            The trade-off is that local storage can be cleared if you wipe your
            browser data, reinstall your browser, or switch to a different
            device. To protect your work, use the export options to keep your
            resume in PDF, DOCX, or Markdown form somewhere you control.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Part of a broader set of free tools on LifeHackToolbox
          </h3>
          <p>
            LifeHackToolbox focuses on small, practical tools that run
            completely in your browser. Alongside this free resume builder you
            will find utilities like a{" "}
            <Link
              href="/qr-code-generator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              QR Code Generator
            </Link>
            , a{" "}
            <Link
              href="/hourly-salary-tax-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              hourly to salary paycheck calculator
            </Link>{" "}
            and{" "}
            <Link
              href="/json-linter"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              JSON Linter &amp; Formatter
            </Link>
            . All of them share the same principles: no login, no paywall, and
            a focus on privacy and clarity.
          </p>
          <p>
            You can bookmark this ATS-friendly resume builder and return
            whenever you need to update your experience, adapt your resume to a
            new role, or export fresh copies in multiple formats before an
            interview. Because it runs fully client-side, it remains fast and
            responsive even on slower connections.
          </p>
        </div>
      </article>
    </div>
  );
}


