import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          A collection of fast, free, no-BS calculators and utilities.
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          LifeHackTools helps you run the numbers quickly so you can make
          better decisions without getting lost in complexity. Everything is
          free, modern, and designed to work great on your phone and desktop.
        </p>
        <ul className="grid gap-2 text-sm text-slate-700 sm:grid-cols-3">
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Free to use
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Modern, focused UX
          </li>
          <li className="flex items-center gap-2">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Mobile-friendly layouts
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
                Hourly → Salary → After-Tax
              </h3>
              <p className="text-sm text-slate-700">
                Start from either your hourly wage or annual salary, then see
                gross income and an estimated after-tax take-home breakdown.
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
        </div>
      </section>
    </div>
  );
}


