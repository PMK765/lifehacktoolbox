import type { Metadata } from "next";
import Link from "next/link";
import RandomMealGenerator from "@/components/RandomMealGenerator";

export const metadata: Metadata = {
  title: "Random Meal Generator | LifeHackToolbox",
  description:
    "Can't decide what to eat? Use this random meal generator to pick a breakfast, lunch, dinner, or snack based on your preferences and calorie range."
};

export default function RandomMealGeneratorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Random Meal Generator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          When you are tired of deciding what to eat, let this tool suggest a
          concrete meal idea. Set a meal type, pick a dietary preference, and
          choose a rough calorie range to get something specific enough to cook
          tonight.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Meals are simple, hard-coded suggestions meant to spark ideas, not a
          full nutrition or meal-planning system. Always adjust portions and
          ingredients to match your own needs and constraints.
        </p>
      </section>
      <RandomMealGenerator />
      <section
        aria-label="About this random meal generator"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Why a random meal generator helps when you are tired of deciding
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Decision fatigue around food is real. After a full day of work,
            family logistics, and background stress, even simple choices like
            what to eat can feel heavier than they should. You know you should
            cook something reasonable, but scrolling through recipes or delivery
            apps can take more energy than the meal is worth.
          </p>
          <p>
            A random meal generator cuts through that indecision by giving you a
            concrete starting point. Instead of staring at an empty fridge or a
            blank search box, you pick a few constraints and let the tool hand
            you one specific option. The goal is not perfection. The goal is to
            move you from “I have no idea what to eat” to “I&apos;ll make this”
            in a few seconds.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Balancing calories, protein, and variety without overthinking it
          </h3>
          <p>
            The meals in this generator are intentionally simple and
            approximate. Each option has a rough calorie estimate, some basic
            protein signals, and clear dietary tags so you can quickly see
            whether it fits the kind of day you are having. It is not a macro
            tracker or a diet prescription, but it is enough structure to keep
            you from defaulting to the same takeout order every night.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Calories</span> are approximate and
              meant to help you stay in the right ballpark, not hit an exact
              target.
            </li>
            <li>
              <span className="font-medium">Protein-leaning meals</span> are
              tagged so you can bias toward options that leave you full for
              longer.
            </li>
            <li>
              <span className="font-medium">Variety</span> comes from mixing
              breakfast, lunch, dinner, and snack ideas instead of repeating the
              same two meals every day.
            </li>
          </ul>
          <h3 className="text-sm font-semibold text-slate-900">
            Use this as a starting point, then adjust to your real life
          </h3>
          <p>
            Every kitchen, budget, and body is different. Treat this generator
            as a prompt, not a command. If it surfaces shrimp tacos but you have
            chicken on hand, swap the protein. If the calories look a little low
            for your needs, add a simple side. If you are running on limited
            time or money, bias toward the low-cost, low-prep options instead of
            chasing the perfect plate.
          </p>
          <p>
            LifeHackToolbox is built around this idea of getting you unstuck
            quickly. The{" "}
            <Link
              href="/hourly-salary-tax-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Hourly → Salary → After-Tax Calculator
            </Link>{" "}
            does the same for money decisions by turning rough income numbers
            into concrete, after-tax estimates. You can always return to the{" "}
            <Link
              href="/"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              LifeHackToolbox homepage
            </Link>{" "}
            to browse other tools as they are added.
          </p>
          <p className="text-xs text-slate-600">
            None of this is nutrition or medical advice. It is a fast way to
            generate ideas so you can spend more energy living your life and
            less energy stuck on the question of what to eat next.
          </p>
        </div>
      </section>
    </div>
  );
}

