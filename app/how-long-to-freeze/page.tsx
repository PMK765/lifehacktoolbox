import type { Metadata } from "next";
import Link from "next/link";
import HowLongToFreezeCalculator from "@/components/HowLongToFreezeCalculator";

export const metadata: Metadata = {
  title: "How Long to Freeze? | LifeHackToolbox",
  description:
    "See how long you can freeze meats, bread, leftovers, and more. Pick a food, freezer type, and frozen date to get a recommended max time and best-by estimate."
};

export default function HowLongToFreezePage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          How Long to Freeze?
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Find out how long you can keep different foods in the freezer based on the type
          of freezer you are using. Pick a food, adjust the frozen-on date, and see a
          rough quality guideline and best-by estimate.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          These times focus on quality, not strict safety. Food kept frozen at 0°F
          (-18°C) is generally safe indefinitely, but taste and texture decline over time.
          Always use your senses and when in doubt, throw it out.
        </p>
      </section>
      <HowLongToFreezeCalculator />
      <section
        aria-label="About freezing times"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Freezer time is about quality first, safety second
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Most freezer charts and recommendations are really talking about quality,
            not whether food suddenly becomes unsafe on a given date. As long as food
            stays fully frozen at 0°F (-18°C) or below and has been handled properly,
            harmful bacteria are not growing. What does change over time is flavor,
            texture, and color. Meat can dry out or become freezer-burned, baked goods
            can taste stale, and delicate items like ice cream can take on odd flavors.
          </p>
          <p>
            That is why you see guidelines like “chicken breasts: up to 9 months” or
            “bread: 3 months” rather than hard safety deadlines. They mark the point
            where most people notice quality slipping, not the exact day food goes bad.
            This calculator reflects those quality-focused windows, adjusted for
            different freezer setups.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Standard freezer vs. deep freezer vs. fridge freezer
          </h3>
          <p>
            A standard home freezer—set to 0°F / -18°C and opened a few times a day—is
            the baseline most charts assume. A dedicated chest or deep freezer usually
            runs colder and is opened much less often, so food temperature stays more
            stable. That tends to preserve quality for longer, which is why this tool
            extends recommended times when you choose a deep freezer.
          </p>
          <p>
            A freezer compartment attached to a fridge is convenient but less ideal for
            long-term storage. It is opened frequently, tends to fluctuate in
            temperature, and often has less insulation. All of that can accelerate
            freezer burn and subtle quality loss. In this calculator, choosing a fridge
            freezer shortens the guideline window compared to a standard or deep freezer.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Typical guidance for common freezer categories
          </h3>
          <p>
            Meats and poultry generally hold quality quite well if wrapped tightly.
            Whole cuts like steaks or roasts can stay good for many months, while ground
            meats and bacon have shorter quality windows. Seafood varies: lean white fish
            can last longer than fatty fish like salmon, which tends to pick up off
            flavors faster. Breads and baked goods are usually best within a few months
            before they start to taste dry or stale once thawed.
          </p>
          <p>
            Leftovers and prepared meals—casseroles, soups, pizza—often live in the
            2–3 month range before quality noticeably drops. Frozen fruits and vegetables
            used in smoothies, soups, or cooked dishes can last longer, though texture
            can suffer if they are thawed and eaten as-is. Dairy is more mixed: butter
            usually freezes well for many months, while soft cheeses can change texture
            quickly.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Use guidelines as guardrails, not guarantees
          </h3>
          <p>
            The numbers in this tool are intentionally approximate. Real-world results
            depend on packaging, how quickly food was frozen, how often the freezer door
            opens, and how stable the temperature stays. Always look closely at frozen
            food when you pull it out: heavy ice crystals, dried-out edges, or strange
            smells are all hints that quality is gone and the food should be skipped even
            if the calendar says it is within range.
          </p>
          <p>
            When you are trying to use what you already have, tools like the{" "}
            <Link
              href="/random-meal-generator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Random Meal Generator
            </Link>{" "}
            can help turn those freezer ingredients into an actual plan. If you are
            stocking up on frozen fruit for smoothies, the{" "}
            <Link
              href="/smoothie-macro-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Smoothie Macro Calculator
            </Link>{" "}
            can show you how those blends affect your daily macros.
          </p>
          <p className="text-xs text-slate-600">
            This tool cannot know how your food was handled or whether it has thawed and
            refrozen. Always trust your own judgment and local food safety guidance. If a
            frozen item smells off, looks strange, or you simply are not sure about it,
            the safest move is to throw it out.
          </p>
        </div>
      </section>
    </div>
  );
}


