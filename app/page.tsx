import Link from "next/link";
import HomeToolSearch from "@/components/HomeToolSearch";

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
      <section aria-label="Available tools" className="space-y-6">
        <h2 className="text-lg font-semibold text-slate-900">Browse tools</h2>
        <HomeToolSearch />
        <div className="space-y-8">
          <section aria-labelledby="math-converters-heading" className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3
                id="math-converters-heading"
                className="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Math &amp; converters
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/function-grapher"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Function Grapher (Interactive)
                  </h4>
                  <p className="text-sm text-slate-700">
                    Graph functions like x^2 and sin(x) with pan/zoom, intercepts, a value
                    table, shareable links, and PNG export.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open grapher
                  <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
              <Link
                href="/matrix-calculator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Matrix Calculator &amp; Visualizer
                  </h4>
                  <p className="text-sm text-slate-700">
                    Matrix multiplication, transpose, determinant, inverse, and solving
                    Ax=b with keyboard-friendly editing plus JSON/CSV export.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open matrix tool
                  <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
              <Link
                href="/probability-simulator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Probability Simulator (Coin/Dice/Cards)
                  </h4>
                  <p className="text-sm text-slate-700">
                    Compare theoretical probability vs simulation with histograms and
                    convergence charts, plus CSV export and branded PNG snapshots.
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
                href="/statistics-explorer"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Statistics Explorer (Charts + Summary)
                  </h4>
                  <p className="text-sm text-slate-700">
                    Paste numbers or upload CSV to compute mean/median/std dev, quartiles,
                    IQR outliers, plus histogram and box plot with CSV and PNG exports.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open stats tool
                  <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </section>
          <section aria-labelledby="money-bills-heading" className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3
                id="money-bills-heading"
                className="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Money &amp; bills
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/hourly-salary-tax-calculator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Hourly to Salary Paycheck &amp; After-Tax
                  </h4>
                  <p className="text-sm text-slate-700">
                    Convert between hourly and salary pay and see your estimated
                    take-home pay after taxes by state.
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
                href="/mortgage-payoff-calculator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Mortgage Payoff &amp; Amortization
                  </h4>
                  <p className="text-sm text-slate-700">
                    Estimate your monthly payment, see a full payoff schedule,
                    and explore how extra payments can reduce interest and
                    shorten your mortgage term.
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
                href="/receipt-bill-splitter"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Receipt Bill Splitter
                  </h4>
                  <p className="text-sm text-slate-700">
                    Enter receipt items, pick who ordered what (or who is
                    sharing), and let the tool split the bill with tax and tip
                    included. Everything runs on your device.
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
                href="/rent-vs-buy-calculator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Rent vs Buy Calculator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Compare renting versus buying a home with full monthly cost
                    breakdown, net worth over time, and a clear break-even year
                    under your assumptions.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open calculator
                  <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </section>
          <section aria-labelledby="home-life-heading" className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3
                id="home-life-heading"
                className="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Home &amp; everyday life
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/random-meal-generator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Random Meal Generator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Stuck on what to eat? Get a random meal idea filtered by
                    diet and calories.
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
                href="/smoothie-macro-calculator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Smoothie Macro Calculator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Build a custom smoothie and see total calories, protein,
                    carbs, and fat.
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
                href="/paint-coverage-calculator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Paint Coverage Calculator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Estimate how many gallons of paint you need for one or more
                    rooms, including doors, windows, ceilings, and coats.
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
                  <h4 className="text-base font-semibold text-slate-900">
                    Grass Seed Coverage Calculator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Estimate how many bags of grass seed you need. Supports top
                    brands, new lawns, reseeding, and custom mixes.
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
                href="/how-long-to-freeze"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    How Long to Freeze?
                  </h4>
                  <p className="text-sm text-slate-700">
                    Pick a food, freezer type, and frozen-on date to see how
                    long it&apos;s recommended to keep it frozen and when
                    quality starts to drop.
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
          <section
            aria-labelledby="health-fitness-heading"
            className="space-y-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3
                id="health-fitness-heading"
                className="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Health, fitness &amp; family
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/baby-kick-counter"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Baby Kick Counter
                  </h4>
                  <p className="text-sm text-slate-700">
                    Count and time baby movements in a calm, mobile-friendly
                    tracker. Includes recent session history. Not medical
                    advice.
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
                href="/body-progress-tracker"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Body Progress Tracker
                  </h4>
                  <p className="text-sm text-slate-700">
                    Log your weight and measurements, see BMI and calorie
                    estimates, and track progress toward your goals over time.
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
                  <h4 className="text-base font-semibold text-slate-900">
                    Workout Tracker
                  </h4>
                  <p className="text-sm text-slate-700">
                    Log your strength and cardio sessions, track lifts over
                    time, and export your training log as CSV or shareable
                    charts.
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
                href="/baby-name-generator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Baby Name Generator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Explore boy, girl, and neutral names by origin and meaning,
                    then randomize first and middle names with your last name.
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
                href="/baby-genetic-predictor"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Baby Genetic Predictor
                  </h4>
                  <p className="text-sm text-slate-700">
                    Predict your baby&apos;s height, eye color, and hair color with beautiful
                    data-driven visualizations.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open predictor
                  <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
              <Link
                href="/life-expectancy-explorer"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Life Expectancy Explorer
                  </h4>
                  <p className="text-sm text-slate-700">
                    Estimate your remaining years of life by age, sex, country,
                    and lifestyle, with survival curves and risk visualizations.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open explorer
                  <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </div>
          </section>
          <section
            aria-labelledby="school-study-heading"
            className="space-y-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3
                id="school-study-heading"
                className="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                School, study &amp; classroom tools
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/weighted-grade-calculator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Weighted Grade Calculator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Add class categories and weights to see your current grade
                    as a weighted percentage.
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
                  <h4 className="text-base font-semibold text-slate-900">
                    Time Duration Calculator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Find the time between two dates or add/subtract days,
                    hours, minutes, and seconds from a specific date and time.
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
                  <h4 className="text-base font-semibold text-slate-900">
                    Universal Unit Converter
                  </h4>
                  <p className="text-sm text-slate-700">
                    Convert between units of length, weight, volume,
                    temperature, speed, area, pressure, data, and more in a
                    clean, mobile-friendly interface.
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
                  <h4 className="text-base font-semibold text-slate-900">
                    Unit Circle Calculator &amp; Trig Explorer
                  </h4>
                  <p className="text-sm text-slate-700">
                    Explore the unit circle with an interactive trig
                    calculator. See angles in degrees and radians, and view
                    sine, cosine, and tangent values with exact trig ratios.
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
                href="/periodic-table"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Interactive Periodic Table
                  </h4>
                  <p className="text-sm text-slate-700">
                    Explore all 118 elements with category filters, property
                    maps, and detailed atomic data in a fully interactive
                    table.
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
                href="/molecular-weight-calculator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Molecular Weight (Molar Mass) Calculator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Parse formulas like Ca(OH)2 and Al2(SO4)3 to calculate total molar mass
                    and percent composition with exports to JSON and CSV.
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
                href="/cell-structure-explorer"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Cell Structure Explorer (Interactive)
                  </h4>
                  <p className="text-sm text-slate-700">
                    Click organelles on an interactive animal cell diagram, search terms,
                    and quiz yourself with a study mode that tracks your best score.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open explorer
                  <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
              <Link
                href="/punnett-square-generator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Punnett Square Generator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Generate single-gene and dihybrid Punnett squares with genotype and phenotype
                    ratios, plus step-by-step explanations and exportable results.
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
                href="/algorithm-visualizer"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Algorithm Visualizer (Sorting + Searching)
                  </h4>
                  <p className="text-sm text-slate-700">
                    Visualize sorting algorithms and binary search with step-by-step playback,
                    speed control, and counters for comparisons and swaps.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open visualizer
                  <span className="ml-1 text-xs transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
              <Link
                href="/projectile-motion-simulator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Projectile Motion Simulator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Plot and animate projectile motion with gravity presets and optional air
                    resistance, plus time of flight, range, max height, and CSV/PNG exports.
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
                href="/scale-of-the-universe"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Scale of the Universe Explorer
                  </h4>
                  <p className="text-sm text-slate-700">
                    Smoothly zoom from subatomic sizes to galaxies and the observable universe,
                    with search, favorites, a guided tour, and exportable snapshots.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open explorer
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
                  <h4 className="text-base font-semibold text-slate-900">
                    DNA Sequence Explorer
                  </h4>
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
                href="/solar-system-simulator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Solar System Orbit Simulator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Watch the planets circle the Sun in real time and tap each
                    one to explore orbital periods, distances, and
                    temperatures.
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
                href="/team-randomizer"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Team Randomizer
                  </h4>
                  <p className="text-sm text-slate-700">
                    Split a class, roster, or group into fair random teams in
                    seconds.
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
          <section
            aria-labelledby="work-docs-heading"
            className="space-y-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3
                id="work-docs-heading"
                className="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Work, docs &amp; developer tools
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/resume-builder"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Resume Builder
                  </h4>
                  <p className="text-sm text-slate-700">
                    Create an ATS-friendly resume in your browser with no
                    login, then export it to PDF, Word, plain text, or
                    Markdown.
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
                href="/pdf-signature-editor"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    PDF Signature &amp; Form Filler
                  </h4>
                  <p className="text-sm text-slate-700">
                    Sign PDFs and add basic text form fields directly in your
                    browser. No upload, fully client-side.
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
                href="/email-signature-generator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Email Signature Generator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Build a professional HTML email signature with your
                    details, links, and logo, then copy the HTML or export a
                    PNG preview.
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
                href="/regex-playground"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Regex Playground (Tester + Highlighter)
                  </h4>
                  <p className="text-sm text-slate-700">
                    Test regex patterns with highlighted matches, capture groups, presets, and a
                    beginner-friendly token explanation panel.
                  </p>
                </div>
                <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-700">
                  Open playground
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
                  <h4 className="text-base font-semibold text-slate-900">
                    JSON Linter &amp; Formatter
                  </h4>
                  <p className="text-sm text-slate-700">
                    Validate and format JSON locally, then copy or download the
                    result with no data sent to a server.
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
                  <h4 className="text-base font-semibold text-slate-900">
                    Diff Checker
                  </h4>
                  <p className="text-sm text-slate-700">
                    Compare two blocks of text or code, highlight additions and
                    deletions, and download a simple diff.
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
                  <h4 className="text-base font-semibold text-slate-900">
                    QR Code Generator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Build QR codes for links, Wi‑Fi networks, and messages,
                    customize colors, and download a PNG with optional
                    branding.
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
                href="/password-generator"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Random Password Generator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Generate strong random passwords with custom character sets
                    and a quick strength estimate, all in your browser.
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
                href="/binary-decimal-hex-converter"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Binary / Decimal / Hex / Octal Converter
                  </h4>
                  <p className="text-sm text-slate-700">
                    Convert between binary, decimal, hexadecimal, and octal,
                    and visualize bits and place values. Perfect for computer
                    science students.
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
                href="/image-format-converter"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    HEIC to JPG &amp; Image Converter
                  </h4>
                  <p className="text-sm text-slate-700">
                    Convert HEIC, JPG, PNG, and WEBP images directly in your
                    browser with optional max file size and quality controls.
                    Nothing is uploaded.
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
          <section
            aria-labelledby="design-visual-heading"
            className="space-y-3"
          >
            <div className="flex items-baseline justify-between gap-2">
              <h3
                id="design-visual-heading"
                className="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Design &amp; visual tools
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/color-palette-extractor"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Color Picker &amp; Palette Extractor
                  </h4>
                  <p className="text-sm text-slate-700">
                    Upload any image to extract a full color palette with HEX,
                    RGB, and HSL values. Click to pick colors and export
                    palettes as PNG or JSON.
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
          <section aria-labelledby="creative-fun-heading" className="space-y-3">
            <div className="flex items-baseline justify-between gap-2">
              <h3
                id="creative-fun-heading"
                className="text-sm font-semibold uppercase tracking-wide text-slate-600"
              >
                Creative &amp; fun
              </h3>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <Link
                href="/online-piano-keyboard"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Online Piano Keyboard
                  </h4>
                  <p className="text-sm text-slate-700">
                    Play a virtual piano in your browser using your mouse or
                    QWERTY keyboard across multiple octaves.
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
                href="/dice-roller"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Custom Dice Roller &amp; RPG Dice Simulator
                  </h4>
                  <p className="text-sm text-slate-700">
                    Roll d4, d6, d8, d10, d12, and d20 dice with modifiers,
                    animations, and roll history. Perfect for DnD and tabletop
                    RPGs.
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
                href="/drum-machine"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Online Beat Maker
                  </h4>
                  <p className="text-sm text-slate-700">
                    Build drum patterns with a 16-step sequencer for kick,
                    snare, hi-hats, and bass. Runs entirely in your browser
                    using the Web Audio API.
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
                href="/pixel-drawing-grid"
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md"
              >
                <div className="space-y-2">
                  <h4 className="text-base font-semibold text-slate-900">
                    Pixel Drawing Grid &amp; Graph Paper
                  </h4>
                  <p className="text-sm text-slate-700">
                    Draw pixel art and graph paper designs with an adjustable
                    grid, color picker, undo/redo, and PNG export, all in your
                    browser.
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
      </section>
      <section
        aria-labelledby="what-is-lifehacktoolbox-heading"
        className="space-y-6 rounded-2xl border border-slate-200 bg-white p-6 text-slate-800 shadow-sm sm:p-8"
      >
        <h2
          id="what-is-lifehacktoolbox-heading"
          className="text-lg font-semibold tracking-tight text-slate-900"
        >
          What is LifeHackToolbox?
        </h2>
        <div className="space-y-4 text-sm text-slate-700 md:text-base">
          <p>
            LifeHackToolbox is a growing collection of fast, practical,{" "}
            <span className="font-semibold">free everyday calculators</span> and
            interactive tools you can use directly in your browser. The goal is
            simple: remove friction from small decisions and common tasks that
            people deal with every week. Instead of hunting through ad-heavy
            sites, downloading apps, or signing up for accounts, you can open a
            tool, get the answer, and move on.
          </p>
          <p>
            Everything on the site is designed to be{" "}
            <span className="font-semibold">browser-based and private</span>.
            Tools run on your device, not on a backend server. There is no
            login required, and the site is built around the idea that you
            should be able to solve a problem without giving away personal
            data. Some tools may store small preferences or history using your
            browser&apos;s local storage for convenience, but LifeHackToolbox
            does not need accounts to be useful.
          </p>
          <h3 className="text-base font-semibold text-slate-900">
            A toolbox for math, science, finance, and design
          </h3>
          <p>
            The tools are intentionally diverse because real life is diverse.
            One day you might need a finance check like a rent vs buy
            comparison; another day you might need a conversion for a recipe, a
            homework assignment, or a DIY project. LifeHackToolbox groups tools
            into categories so you can browse quickly and find what you need:
          </p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-semibold">Money &amp; bills:</span> quick
              calculators for real-world decisions like paycheck estimates,
              budgeting tradeoffs, or mortgage planning.
            </li>
            <li>
              <span className="font-semibold">School and science:</span>{" "}
              tools for learning and exploration, such as number base
              conversions, unit conversion, DNA and periodic table references,
              and interactive visualizers.
            </li>
            <li>
              <span className="font-semibold">Work and documents:</span>{" "}
              browser-native utilities like a resume builder, PDF signer, diff
              checker, QR generator, and formatters for structured text.
            </li>
            <li>
              <span className="font-semibold">Design and creative tools:</span>{" "}
              utilities for colors, images, and lightweight creative
              experimentation like pixel grids and browser-based instruments.
            </li>
          </ul>
          <h3 className="text-base font-semibold text-slate-900">
            Built for speed, clarity, and mobile use
          </h3>
          <p>
            A good calculator is not just correct—it is also easy to use on a
            phone, easy to understand, and honest about what it can and cannot
            do. LifeHackToolbox focuses on clean layouts, readable inputs, and
            outputs that explain themselves. Many tools include charts or
            visualizations when they make the result easier to interpret, and
            every tool page includes a plain-English section explaining how the
            calculator works, common edge cases, and why the concept matters.
          </p>
          <p>
            When a tool relies on assumptions, those assumptions are shown
            directly in the UI. When a result is an estimate rather than a fact,
            the tool says so. The point is clarity: you should be able to
            understand the direction of the answer and what would change it,
            not just copy a number out of a box.
          </p>
          <h3 className="text-base font-semibold text-slate-900">
            Mission: make everyday problem-solving feel effortless
          </h3>
          <p>
            LifeHackToolbox exists because the internet is full of tools that
            are technically useful but unpleasant to use—slow pages, intrusive
            popups, confusing interfaces, and forced sign-ups. This site is
            built with the opposite philosophy: fast, focused tools that respect
            your time. Whether you are planning your finances, studying for a
            class, preparing documents, building something at home, or just
            exploring out of curiosity, the mission is to give you a dependable
            set of small utilities that feel good to use.
          </p>
          <p>
            If you are new here, the best way to start is to browse the
            categories above and open whatever matches your current need. The
            site is meant to be revisited: a practical, evolving toolbox you can
            rely on whenever a small calculation or conversion comes up.
          </p>
        </div>
      </section>
    </div>
  );
}


