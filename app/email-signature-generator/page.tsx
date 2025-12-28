import type { Metadata } from "next";
import Link from "next/link";
import EmailSignatureGenerator from "@/components/EmailSignatureGenerator";

export const metadata: Metadata = {
  title: "Email Signature Generator | LifeHackToolbox",
  description:
    "Create a professional email signature with your name, job title, company, links, and logo. Copy HTML or download as a PNG. Free and entirely client-side.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/email-signature-generator"
  }
};

export default function EmailSignatureGeneratorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Email Signature Generator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Build a clean, professional HTML signature for Gmail, Outlook, Apple
          Mail, and other email clients. Add your name, role, company, contact
          details, social links, and logo, then copy the HTML or export a PNG
          preview with subtle LifeHackToolbox branding.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          All data stays in your browser and recent settings are stored only in
          local storage. Nothing is uploaded or tracked.
        </p>
      </section>
      <EmailSignatureGenerator />
      <section
        aria-label="About professional email signatures"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Why a professional email signature matters
        </h2>
        <p>
          A clear, consistent email signature makes it easier for people to know
          who you are, how to reach you, and which organization you represent.
          In client-facing roles, your signature can double as a mini business
          card, reinforcing your brand every time you send a message. Even in
          internal communication, a simple signature with your name, title, and
          team can save colleagues time when scanning long threads or revisiting
          older emails.
        </p>
        <p>
          Best practice is to keep your email signature short, readable, and
          mobile-friendly. Avoid large images or multiple stacked logos that can
          push content down or break on small screens. Instead, focus on clear
          text, a single accent color, and just the key links: your website,
          LinkedIn profile, and maybe one or two other social accounts. The
          themes in this generator are designed to reflect those patterns while
          still giving you some room to customize the look.
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Best HTML signature practices
        </h2>
        <p>
          Email clients vary widely in how they render HTML. Most still expect
          table-based layouts and inline styles instead of modern flexbox or
          external stylesheets. This tool generates a mostly table-based
          structure with simple inline CSS so that it holds up in common
          clients. When you paste the HTML into your signature settings, you
          should see a result similar to the preview and not a broken layout.
        </p>
        <p>
          Avoid embedding large images or relying on remote CSS. Many clients
          block remote images by default and strip out complex markup. If you
          include a logo here, it is embedded as a data URL so that it travels
          with the signature, but keeping the dimensions modest will make your
          emails smaller and faster to load. It is usually better to stick to
          one primary logo rather than a row of badges or social icons.
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Using the generated HTML in Gmail, Outlook, and Apple Mail
        </h2>
        <p>
          To use this signature in Gmail, open Settings, go to the Signatures
          section, create a new signature, and switch into the editor. Paste the
          HTML either directly or by using the &quot;More formatting&quot;
          options and the code view if available. For Outlook on the web or
          desktop, open the signature preferences, create a new entry, and paste
          the HTML into the editor. Apple Mail allows you to paste rich text
          signatures into the Signatures panel; you can copy the HTML, paste
          into a new message, tweak as needed, and then drag that content into a
          signature slot.
        </p>
        <p>
          Because every email client is slightly different, you may want to send
          a few test emails to yourself and colleagues before rolling out a new
          signature widely. If you need to share a static version of the
          signature—for example, in onboarding docs—you can use the PNG export
          option. That export wraps the HTML preview inside a subtle branded
          frame, similar to how other tools on LifeHackToolbox use{" "}
          <Link
            href="/pdf-signature-editor"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            PDF signature
          </Link>{" "}
          and{" "}
          <Link
            href="/qr-code-generator"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            QR code
          </Link>{" "}
          exports.
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Privacy-first and browser-only
        </h2>
        <p>
          Like the other utilities on LifeHackToolbox, the Email Signature
          Generator runs entirely in your browser. Your name, job title,
          company, and logo never leave your device. Local storage is used only
          to remember your last set of inputs, selected theme, and layout so
          that you do not have to rebuild your signature every time you visit
          the page. If you clear your browser data or switch devices, those
          settings simply reset.
        </p>
        <p>
          This local-only approach pairs well with other business-oriented tools
          on the site. For example, you might use the{" "}
          <Link
            href="/json-linter"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            JSON Linter &amp; Formatter
          </Link>{" "}
          when working with API-driven email templates, or the{" "}
          <Link
            href="/pdf-signature-editor"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            PDF Signature Editor
          </Link>{" "}
          to sign attached documents before sending them. The goal is to give
          you a small set of specialized tools that respect your privacy while
          making day-to-day work a little smoother.
        </p>
      </section>
    </div>
  );
}


