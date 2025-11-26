import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          LifeHackToolbox: fast, free everyday calculators.
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          LifeHackToolbox is a small set of simple tools you can use right in your
          browser. Everything here is free, requires no signup, and is designed to feel
          modern and easy to use on both phone and desktop.
        </p>
        <ul className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free with no account or signup
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Modern, focused interface
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Works great on phones and laptops
          </li>
        </ul>
      </section>
      <section aria-label="Available tools" className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Browse tools</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <Link
            href="/hourly-salary-tax-calculator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Hourly to Salary Paycheck &amp; After-Tax
              </h3>
              <p className="text-sm text-slate-700">
                Convert between hourly and salary pay and see your estimated take-home
                pay after taxes by state.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open calculator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/random-meal-generator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Random Meal Generator
              </h3>
              <p className="text-sm text-slate-700">
                Stuck on what to eat? Get a random meal idea filtered by diet
                and calories.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open generator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/paint-coverage-calculator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Paint Coverage Calculator
              </h3>
              <p className="text-sm text-slate-700">
                Estimate how many gallons of paint you need for one or more rooms,
                including doors, windows, ceilings, and coats.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open calculator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/team-randomizer"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Team Randomizer
              </h3>
              <p className="text-sm text-slate-700">
                Split a class, roster, or group into fair random teams in seconds.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/smoothie-macro-calculator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Smoothie Macro Calculator
              </h3>
              <p className="text-sm text-slate-700">
                Build a custom smoothie and see total calories, protein, carbs, and fat.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open calculator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/grass-seed-calculator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Grass Seed Coverage Calculator
              </h3>
              <p className="text-sm text-slate-700">
                Estimate how many bags of grass seed you need. Supports top brands, new
                lawns, reseeding, and custom mixes.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open calculator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/baby-kick-counter"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Baby Kick Counter
              </h3>
              <p className="text-sm text-slate-700">
                Count and time baby movements in a calm, mobile-friendly tracker. Includes
                recent session history. Not medical advice.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tracker
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/how-long-to-freeze"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                How Long to Freeze?
              </h3>
              <p className="text-sm text-slate-700">
                Pick a food, freezer type, and frozen-on date to see how long it&apos;s
                recommended to keep it frozen and when quality starts to drop.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/weighted-grade-calculator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Weighted Grade Calculator
              </h3>
              <p className="text-sm text-slate-700">
                Add class categories and weights to see your current grade as a weighted
                percentage.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open calculator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/time-duration-calculator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Time Duration Calculator
              </h3>
              <p className="text-sm text-slate-700">
                Find the time between two dates or add/subtract days, hours, minutes, and
                seconds from a specific date and time.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/pdf-signature-editor"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                PDF Signature &amp; Form Filler
              </h3>
              <p className="text-sm text-slate-700">
                Sign PDFs and add basic text form fields directly in your browser. No
                upload, fully client-side.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/receipt-bill-splitter"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Receipt Bill Splitter
              </h3>
              <p className="text-sm text-slate-700">
                Enter receipt items, pick who ordered what (or who is sharing), and let
                the tool split the bill with tax and tip included. Everything runs on
                your device.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/body-progress-tracker"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Body Progress Tracker
              </h3>
              <p className="text-sm text-slate-700">
                Log your weight and measurements, see BMI and calorie estimates, and
                track progress toward your goals over time.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tracker
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/workout-tracker"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Workout Tracker
              </h3>
              <p className="text-sm text-slate-700">
                Log your strength and cardio sessions, track lifts over time, and
                export your training log as CSV or shareable charts.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tracker
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/mortgage-payoff-calculator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Mortgage Payoff &amp; Amortization
              </h3>
              <p className="text-sm text-slate-700">
                Estimate your monthly payment, see a full payoff schedule, and explore how
                extra payments can reduce interest and shorten your mortgage term.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open calculator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/json-linter"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                JSON Linter &amp; Formatter
              </h3>
              <p className="text-sm text-slate-700">
                Validate and format JSON locally, then copy or download the result
                with no data sent to a server.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/diff-checker"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Diff Checker
              </h3>
              <p className="text-sm text-slate-700">
                Compare two blocks of text or code, highlight additions and deletions,
                and download a simple diff.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/qr-code-generator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                QR Code Generator
              </h3>
              <p className="text-sm text-slate-700">
                Build QR codes for links, Wi‑Fi networks, and messages, customize
                colors, and download a PNG with optional branding.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/baby-name-generator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Baby Name Generator
              </h3>
              <p className="text-sm text-slate-700">
                Explore boy, girl, and neutral names by origin and meaning, then
                randomize first and middle names with your last name.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/resume-builder"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Resume Builder
              </h3>
              <p className="text-sm text-slate-700">
                Create an ATS-friendly resume in your browser with no login, then export
                it to PDF, Word, plain text, or Markdown.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open builder
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/password-generator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Random Password Generator
              </h3>
              <p className="text-sm text-slate-700">
                Generate strong random passwords with custom character sets and a quick
                strength estimate, all in your browser.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open generator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/email-signature-generator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Email Signature Generator
              </h3>
              <p className="text-sm text-slate-700">
                Build a professional HTML email signature with your details, links, and
                logo, then copy the HTML or export a PNG preview.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open generator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/online-piano-keyboard"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Online Piano Keyboard
              </h3>
              <p className="text-sm text-slate-700">
                Play a virtual piano in your browser using your mouse or QWERTY
                keyboard across multiple octaves.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/solar-system-simulator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Solar System Orbit Simulator
              </h3>
              <p className="text-sm text-slate-700">
                Watch the planets circle the Sun in real time and tap each one to
                explore orbital periods, distances, and temperatures.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open simulator
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/periodic-table"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Interactive Periodic Table
              </h3>
              <p className="text-sm text-slate-700">
                Explore all 118 elements with category filters, property maps,
                and detailed atomic data in a fully interactive table.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/unit-converter"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Universal Unit Converter
              </h3>
              <p className="text-sm text-slate-700">
                Convert between units of length, weight, volume, temperature,
                speed, area, pressure, data, and more in a clean, mobile-friendly
                interface.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/dna-sequence-explorer"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                DNA Sequence Explorer
              </h3>
              <p className="text-sm text-slate-700">
                Visualize DNA sequences, codons, and amino acids with an
                interactive viewer and exportable charts and tables.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
          <Link
            href="/unit-circle-calculator"
            className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
          >
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-slate-900">
                Unit Circle Calculator &amp; Trig Explorer
              </h3>
              <p className="text-sm text-slate-700">
                Explore the unit circle with an interactive trig calculator. See
                angles in degrees and radians, and view sine, cosine, and
                tangent values with exact trig ratios.
              </p>
            </div>
            <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
              Open tool
              <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                →
              </span>
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}


