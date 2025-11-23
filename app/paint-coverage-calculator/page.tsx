import type { Metadata } from "next";
import Link from "next/link";
import PaintCoverageCalculator from "@/components/PaintCoverageCalculator";

export const metadata: Metadata = {
  title: "Paint Coverage Calculator | LifeHackToolbox",
  description:
    "Estimate how much paint you need for one or more rooms with this paint coverage calculator. Account for walls, ceilings, doors, windows, and multiple coats."
};

export default function PaintCoverageCalculatorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Paint Coverage Calculator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Add one or more rooms, choose whether you are painting walls, ceilings, or both,
          and factor in doors, windows, and coats. The calculator estimates total
          paintable area and how many gallons of paint you should plan to buy.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          This tool focuses on quick estimates, not architectural precision. Always review
          measurements on-site and consult product labels before making final purchase
          decisions.
        </p>
      </section>
      <PaintCoverageCalculator />
      <section
        aria-label="How paint coverage works"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          How paint coverage really works in the real world
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Paint cans often promise a neat coverage number, but real surfaces rarely behave
            that cleanly. A gallon labeled as covering 400 square feet might actually cover
            less once you account for texture, previous colors, and how heavily you load
            the roller. The goal of this calculator is not to nail the exact ounce of paint
            required, but to put you in a realistic range so you can buy confidently instead
            of guessing in the aisle.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why smooth walls and rough walls behave differently
          </h3>
          <p>
            Smooth, previously painted drywall behaves very differently from rough masonry
            or fresh drywall that has never seen paint. Rough or porous surfaces act like a
            sponge and soak up more paint. That is why coverage values as low as 250 square
            feet per gallon are common for the first coat on raw surfaces, while premium
            paints on smooth walls can legitimately stretch closer to 400 square feet per
            gallon.
          </p>
          <p>
            The presets in this calculator give you a fast way to reflect those realities:
            lower numbers for rough or unprimed surfaces, higher numbers when you are
            refreshing a smooth, already-painted wall. If you know your specific product
            and surface, the custom coverage input lets you plug in whatever number makes
            the most sense for your situation.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Multiple coats and why they matter so much
          </h3>
          <p>
            A single thin coat rarely gives a satisfying finish, especially when you are
            changing colors or covering marks. Each additional coat is effectively another
            full pass over the same area, which is why this calculator multiplies the
            paintable surface by the number of coats you choose. Going from one coat to two
            is not a minor tweak; it doubles the effective square footage you are asking
            that paint to cover.
          </p>
          <p>
            In practice, it is common to run at least two coats on most interior projects.
            Strong color changes, dark-to-light transitions, or patchy walls may demand
            three or more. Setting coats accurately in the tool gives you a more honest
            picture of how much paint your project will consume.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why subtracting doors and windows actually helps
          </h3>
          <p>
            Doors and windows reduce the amount of wall you are painting, even though they
            visually feel like part of the room. Ignoring them means you quietly round your
            estimate up, which is sometimes fine, but it can overshoot on small rooms with
            lots of openings. This calculator subtracts a typical area for each door and
            window before applying coats so tighter spaces with big windows do not get
            overestimated quite as badly.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Smarter paint buying: round up on purpose, not by accident
          </h3>
          <p>
            Once you have an estimated number of gallons, the next question is how to
            translate that into actual cans on the shelf. The tool breaks the answer into
            whole gallons and quarts, rounding up the remaining fraction to the nearest
            quart and rolling four quarts into a full gallon when needed. In reality,
            people often choose to round up one extra gallon beyond the bare minimum so
            they have paint for touch-ups, inevitable mistakes, and future repairs.
          </p>
          <p>
            As with every tool on{" "}
            <Link
              href="/"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              LifeHackToolbox
            </Link>
            , this calculator is about getting you to a clear, defensible decision fast,
            not running a perfect simulation. If you are deciding between two close
            options, it is usually safer to lean slightly high and keep the leftover paint
            sealed for later rather than risk running out with one wall half finished.
          </p>
          <p>
            If you are juggling paint costs alongside other budget questions, the{" "}
            <Link
              href="/hourly-salary-tax-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Hourly → Salary → After-Tax Calculator
            </Link>{" "}
            can quickly translate your income into realistic, after-tax monthly numbers so
            you can see how this project fits into the bigger picture.
          </p>
          <p className="text-xs text-slate-600">
            These numbers are estimates only. Always confirm coverage information on the
            actual paint can and, when in doubt, talk to a paint professional at your
            supplier before committing to large purchases.
          </p>
        </div>
      </section>
    </div>
  );
}


