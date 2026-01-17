import type { Metadata } from "next";
import Link from "next/link";
import RandomMealGenerator from "@/components/RandomMealGenerator";

export const metadata: Metadata = {
  title: "Random Meal Generator | LifeHackToolbox",
  description:
    "Can't decide what to eat? Use this random meal generator to pick a breakfast, lunch, dinner, or snack based on your preferences and calorie range.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/random-meal-generator"
  }
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
          <p>
            This is especially useful when you are trying to be consistent. Most people do
            not fail because they do not understand nutrition. They fail because the decision
            overhead is too high after a long day. If the only “plan” is to figure it out in
            the moment, you will default to whatever is fastest and most emotionally rewarding.
            A generator reduces that friction by making the first move for you.
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
          <p>
            Think of the calorie range as a “budget” for the meal. It is not a single number,
            because portion sizes and ingredients vary. Use it to separate a light snack, a
            typical meal, and a larger meal. If your day has been sedentary and you are trying
            to maintain or lose weight, lean toward the lower range and emphasize protein and
            fiber. If you trained hard, walked a lot, or are trying to gain weight, you can
            move the slider up and choose options that are more energy dense.
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
            <li>
              <span className="font-medium">Constraints beat willpower</span>:
              if you pick a meal type and dietary preference first, your options narrow and
              decision-making gets easier.
            </li>
          </ul>
          <h3 className="text-sm font-semibold text-slate-900">
            How to actually use the suggestion (the 3-minute plan)
          </h3>
          <ol className="list-decimal space-y-1 pl-5">
            <li>
              Choose a meal type that matches your current situation (snack vs. dinner).
            </li>
            <li>
              Pick the dietary preference that matches your real constraints, not your ideal
              identity. If you are “mostly vegetarian” but you have chicken to use up, do that.
            </li>
            <li>
              When you get a suggestion, immediately decide “yes” or “reroll.” Limit yourself
              to three rerolls to avoid turning the tool into another scrolling session.
            </li>
            <li>
              Convert the suggestion into a shopping list of 3–6 ingredients and start cooking.
            </li>
          </ol>
          <h3 className="text-sm font-semibold text-slate-900">
            Making it healthier without changing the meal
          </h3>
          <p>
            The easiest way to improve a meal is to keep the core idea the same but adjust
            portions and add one supporting piece. If your meal feels low on protein, add an
            extra protein source (Greek yogurt, eggs, chicken, tofu, beans). If it feels low on
            volume, add a pile of vegetables (frozen veggies are fine). If it feels low on
            satisfaction, add a small fat source (olive oil, avocado, nuts) instead of adding
            more refined carbs.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            When the generator is wrong (and what to do)
          </h3>
          <p>
            Sometimes the suggestion will not fit your fridge, allergies, budget, or time. That is
            expected. Use a simple substitution rule: keep the meal style, swap the ingredients.
            If it suggests shrimp tacos, use chicken. If it suggests rice bowls, use whatever grain
            you have. If it suggests a salad but you hate salads, make a wrap with the same
            ingredients. The generator is a prompt; you are still the cook.
          </p>
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
          <h3 className="text-sm font-semibold text-slate-900">
            A practical “rotation” strategy for busy weeks
          </h3>
          <p>
            If you want the generator to be more than a one-off, treat it like a rotation builder.
            Generate three dinners and two lunches you would actually eat, then repeat them for a
            week. Variety matters, but simplicity matters more. Consistency is usually a
            smaller set of meals repeated with small variations, not a brand new recipe every day.
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
          <p>
            If you like the structure of calorie ranges, you can also use the{" "}
            <Link
              href="/smoothie-macro-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Smoothie Macro Calculator
            </Link>{" "}
            to sanity-check a drinkable meal. Smoothies can be useful, but they can also become a
            stealth 800-calorie dessert if you stack fruit, juice, nut butter, and sweetened yogurt.
          </p>
          <p className="text-xs text-slate-600">
            None of this is nutrition or medical advice. It is a fast way to
            generate ideas so you can spend more energy living your life and
            less energy stuck on the question of what to eat next.
          </p>
          <p className="text-xs text-slate-600">
            Privacy note: this tool runs entirely in your browser and does not send your inputs to
            a server.
          </p>
        </div>
      </section>
    </div>
  );
}

