import type { Metadata } from "next";
import Link from "next/link";
import SmoothieMacroCalculator from "@/components/SmoothieMacroCalculator";

export const metadata: Metadata = {
  title: "Smoothie Macro Calculator | LifeHackToolbox",
  description:
    "Build your own smoothie and instantly see calories, protein, carbs, and fat. Mix fruits, liquids, protein powders, and more to hit your macro goals."
};

export default function SmoothieMacroCalculatorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Smoothie Macro Calculator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Select ingredients, adjust servings, and see total calories, protein, carbs, and
          fat for your smoothie. This is a fast way to sanity-check blends for weight
          loss, muscle gain, or everyday balance without opening a full nutrition app.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          All macros are rough estimates based on common reference values. Always check
          the label on your actual products if you need precise numbers.
        </p>
      </section>
      <SmoothieMacroCalculator />
      <section
        aria-label="How to think about smoothie macros"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Why tracking smoothie macros can actually be useful
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Smoothies are one of the easiest places to accidentally stack calories. Fruit,
            juice, nut butters, seeds, and sweetened yogurts all add up quickly, and it is
            easy to underestimate how much energy you are drinking when everything is
            blended. If you are trying to lose weight, build muscle, or just avoid
            surprise calorie spikes, it helps to have a quick way to see roughly what
            you are putting in the glass.
          </p>
          <p>
            This calculator focuses on the four numbers that matter most for most people:
            calories, protein, carbs, and fat. You choose ingredients and servings, and it
            adds everything up so you can see whether your “healthy smoothie” is actually
            closer to a light snack or a full meal.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            High-protein vs. high-carb smoothies
          </h3>
          <p>
            A smoothie built mostly from fruit and juice will lean heavily toward carbs
            with relatively little protein or fat. That can be great right before or after
            a workout when you want fast-digesting energy, but it may not keep you full
            for very long. On the other hand, adding Greek yogurt, protein powder, and
            milk can dramatically increase protein, which tends to improve satiety and
            support muscle recovery.
          </p>
          <p>
            If you want a higher-protein blend, bias your ingredients toward Greek yogurt,
            whey or plant protein, higher-protein milk options, and even cottage cheese.
            For higher-carb days, especially around training, you can lean harder on fruit,
            oats, and juice while keeping protein steady. The thresholds in the results
            card are intentionally simple and just meant to give you a quick label for what
            you have built.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            How nut butters, seeds, and yogurt change the macro profile
          </h3>
          <p>
            Nut butters and seeds do double duty: they add some protein and fiber but
            mostly bring calories from fat. A tablespoon or two of peanut butter or almond
            butter can quietly add 100–200 calories. Chia and flax bring healthy fats and
            fiber but still show up as fat in your macro split. Plain Greek yogurt adds
            a lot of protein with relatively modest carbs and almost no fat, while
            flavored yogurts tend to push the carb and sugar numbers up.
          </p>
          <p>
            This is why two smoothies that look almost identical in size can behave very
            differently in your day. One may be mostly fruit and juice with a small scoop
            of protein, while another adds oats, nut butter, and seeds on top of that
            base. Both can be fine; the key is knowing which you are drinking and whether
            it matches your overall calorie and macro targets.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Use this as a directional tool, not a lab report
          </h3>
          <p>
            The ingredient values in this calculator are approximate and based on common
            serving sizes. Real products vary by brand, flavor, and even batch. If you are
            preparing for a competition, working with a dietitian, or have strict medical
            requirements, always default to the exact label information and any guidance
            from your care team instead of this tool.
          </p>
          <p>
            For everyday use, the point is speed. You can sketch out a recipe in a few
            seconds, see whether you are in the right ballpark, and then decide whether to
            tweak ingredients. If you discover that your daily smoothie is effectively a
            full meal, you can decide whether that lines up with your goals and adjust the
            rest of your day accordingly.
          </p>
          <p>
            If you are thinking about macros in the context of your paycheck, the{" "}
            <Link
              href="/hourly-salary-tax-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Hourly → Salary → After-Tax Calculator
            </Link>{" "}
            can help you understand what your income looks like after taxes. When you just
            want ideas for your next meal instead of obsessing over nutrients, the{" "}
            <Link
              href="/random-meal-generator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Random Meal Generator
            </Link>{" "}
            can suggest something concrete to cook.
          </p>
          <p className="text-xs text-slate-600">
            None of this is nutrition, medical, or fitness advice. It is a quick way to
            visualize the macros of a smoothie recipe so you can make more informed,
            low-friction decisions about what you drink.
          </p>
        </div>
      </section>
    </div>
  );
}


