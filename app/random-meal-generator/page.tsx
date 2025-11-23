import type { Metadata } from "next";
import RandomMealGenerator from "@/components/RandomMealGenerator";

export const metadata: Metadata = {
  title: "Random Meal Generator | LifeHackTools",
  description:
    "Stuck on what to eat? Use the Random Meal Generator to pick a meal based on type, dietary preference, and calories."
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
          meal for you. Filter by meal type, dietary preference, and a rough
          calorie range, then roll the dice to get a concrete idea you can act
          on.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Meals are simple, hard-coded suggestions meant to spark ideas, not a
          full nutrition or meal-planning system. Always adjust portions and
          ingredients to match your own needs and constraints.
        </p>
      </section>
      <RandomMealGenerator />
    </div>
  );
}


