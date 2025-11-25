import type { Metadata } from "next";
import Link from "next/link";
import PasswordGenerator from "@/components/PasswordGenerator";

export const metadata: Metadata = {
  title: "Random Password Generator | LifeHackToolbox",
  description:
    "Generate secure random passwords with customizable character sets. Copy, export, and save password history. 100% client-side and privacy friendly."
};

export default function PasswordGeneratorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Random Password Generator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Build strong, unique passwords without leaving your browser. Choose
          the length and character types you want, generate a random password,
          and quickly copy or export it as a branded image if you need to share
          it securely.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Passwords and history are generated and stored only on this device
          using local storage. LifeHackToolbox never sees or stores your
          secrets.
        </p>
      </section>
      <PasswordGenerator />
      <section
        aria-label="About random passwords and this generator"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Why strong random passwords matter
        </h2>
        <p>
          Passwords are still the default way most websites and apps protect
          accounts. Short, predictable passwords are easy for attackers to guess
          or brute-force, especially if they reuse leaked credentials from other
          breaches. A strong random password is long, uses multiple character
          types, and avoids obvious patterns like dictionary words or keyboard
          walks. The goal is to make it infeasible for someone to guess or
          systematically try every combination in a reasonable time.
        </p>
        <p>
          This random password generator lets you tune the character set so you
          can align with different site rules while still maximizing strength.
          You can include uppercase and lowercase letters, digits, and symbols,
          and optionally remove characters that are easy to misread when
          copying. The strength bar gives you a quick signal based on length and
          character variety, so you can see how changes affect the quality of
          the password before you use it.
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Best practices for using generated passwords
        </h2>
        <p>
          For everyday accounts, security experts recommend using a password
          manager and giving every site a unique, randomly generated password.
          That way, a breach at one service does not spill over into your email,
          banking, or work accounts. When possible, turn on multi-factor
          authentication so that even if a password leaks, an attacker still
          needs access to a second factor, such as a hardware token or phone
          prompt. Avoid writing high-value passwords in plain text documents or
          sending them over unencrypted channels like normal email.
        </p>
        <p>
          This tool keeps a short history of recent passwords in your browser to
          make it easier to recover something you just generated, but it is not
          intended as a long-term storage system. Once you have copied a
          password into your manager or secure notes, you can clear the history
          by wiping your browser storage or simply ignore it; it never leaves
          your device.
        </p>
        <h2 className="text-lg font-semibold text-slate-900">
          Privacy-friendly and fully client-side
        </h2>
        <p>
          Like other tools on LifeHackToolbox, this password generator runs
          entirely in your browser. There is no account to create and no data is
          sent to a remote server. That makes it suitable for work environments
          where you cannot paste secrets into unknown websites, and for anyone
          who prefers to keep sensitive data off third-party services. All of
          the logic for generating randomness, tracking strength, and recording
          recent passwords stays local.
        </p>
        <p>
          If you need to share access or short secrets in a more visual form,
          you can pair this generator with tools like the{" "}
          <Link
            href="/qr-code-generator"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            QR Code Generator
          </Link>{" "}
          to encode tokens into scannable codes, or developer-focused utilities
          such as the{" "}
          <Link
            href="/json-linter"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            JSON Linter &amp; Formatter
          </Link>{" "}
          when you are working with API keys and structured config. The aim is
          to provide a small set of focused, privacy-first tools you can trust
          to run right in your browser.
        </p>
      </section>
    </div>
  );
}


