import type { Metadata } from "next";
import Link from "next/link";
import QrCodeGenerator from "@/components/QrCodeGenerator";

export const metadata: Metadata = {
  title: "QR Code Generator | LifeHackToolbox",
  description:
    "Generate QR codes for URLs, Wi-Fi, SMS, phone numbers, and more. Customize size, colors, and error correction, add an optional logo, and download as PNG. 100% client-side.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/qr-code-generator"
  }
};

export default function QrCodeGeneratorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          QR Code Generator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Create QR codes for links, Wi‑Fi networks, contact details, and more.
          Customize colors and error correction, optionally add a small logo,
          and download a PNG—everything runs in your browser.
        </p>
      </section>
      <QrCodeGenerator />
      <section
        aria-label="About QR codes"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Generate shareable QR codes without leaving your browser
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            QR codes are a quick bridge between the physical world and digital
            content. They are used on restaurant menus, flyers, product
            packaging, business cards, and Wi‑Fi cards to move someone from a
            phone camera to a specific URL, message, or action. With this
            generator you can create QR codes for common payloads like web
            links, SMS messages, and Wi‑Fi networks in a few seconds.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Common ways to use QR codes
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Links and landing pages.</span> Put
              a QR code on a flyer, sign, or slide to send people directly to a
              signup form, menu, or promotional page.
            </li>
            <li>
              <span className="font-medium">Wi‑Fi sharing.</span> Generate a
              QR code for your home or guest network so visitors can connect
              without typing a password.
            </li>
            <li>
              <span className="font-medium">Contact and support.</span> Encode a
              phone number, SMS template, or email address so customers can
              contact you by scanning instead of dialing.
            </li>
          </ul>
          <h3 className="text-sm font-semibold text-slate-900">
            Size, colors, and error correction
          </h3>
          <p>
            This generator lets you choose the size of the QR code in pixels so
            it stays sharp when printed or embedded in a slide. You can adjust
            foreground and background colors to match your brand while still
            keeping enough contrast for scanners to read it. Error correction
            level controls how much redundancy is built into the code: higher
            levels like Q and H are more robust when you place a logo in the
            center or print the code small, while lower levels can hold more
            data.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Fully client‑side for privacy and speed
          </h3>
          <p>
            Some online QR tools upload your content to a server or even track
            scans through redirect links. This QR Code Generator runs entirely
            in your browser. The payload you enter is used only to render a QR
            code locally; nothing is sent to LifeHackToolbox or any third
            party. You can safely generate codes for internal URLs, staging
            environments, or private Wi‑Fi networks without exposing them to an
            external service.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Part of a small toolkit of everyday utilities
          </h3>
          <p>
            This page sits alongside other focused tools on LifeHackToolbox,
            such as the{" "}
            <Link
              href="/json-linter"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              JSON Linter &amp; Formatter
            </Link>{" "}
            and{" "}
            <Link
              href="/diff-checker"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Diff Checker
            </Link>
            , as well as more general trackers like the{" "}
            <Link
              href="/workout-tracker"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Workout Tracker
            </Link>{" "}
            and{" "}
            <Link
              href="/body-progress-tracker"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Body Progress Tracker
            </Link>
            . All of these tools run client‑side, require no login, and are
            meant to feel fast and disposable—open a tab, get something done,
            then move on with your day.
          </p>
        </div>
      </section>
    </div>
  );
}


