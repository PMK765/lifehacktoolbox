"use client";

import { useMemo, useState } from "react";

type MealType = "breakfast" | "lunch" | "dinner" | "snack";

type DietTag =
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "high-protein"
  | "low-carb";

type EstimatedCostLevel = "low" | "medium" | "high";

type DietaryPreferenceFilter =
  | "none"
  | "vegetarian"
  | "vegan"
  | "pescatarian"
  | "high-protein"
  | "low-carb";

type Meal = {
  id: string;
  name: string;
  description: string;
  mealType: MealType;
  dietTags: DietTag[];
  calories: number;
  prepTimeMinutes: number;
  estimatedCostLevel: EstimatedCostLevel;
};

const meals: Meal[] = [
  {
    id: "overnight-oats-berries",
    name: "Overnight Oats with Berries",
    description: "Rolled oats soaked in almond milk with chia, maple, and fresh berries.",
    mealType: "breakfast",
    dietTags: ["vegetarian", "vegan", "high-protein"],
    calories: 420,
    prepTimeMinutes: 10,
    estimatedCostLevel: "low"
  },
  {
    id: "greek-yogurt-parfait",
    name: "Greek Yogurt Parfait",
    description: "Thick Greek yogurt layered with granola, honey, and seasonal fruit.",
    mealType: "breakfast",
    dietTags: ["vegetarian", "high-protein"],
    calories: 380,
    prepTimeMinutes: 8,
    estimatedCostLevel: "low"
  },
  {
    id: "avocado-toast-egg",
    name: "Avocado Toast with Egg",
    description: "Sourdough toast topped with mashed avocado, fried egg, and chili flakes.",
    mealType: "breakfast",
    dietTags: ["vegetarian"],
    calories: 450,
    prepTimeMinutes: 12,
    estimatedCostLevel: "medium"
  },
  {
    id: "veggie-omelet",
    name: "Veggie Omelet",
    description: "Three-egg omelet loaded with spinach, peppers, onions, and cheese.",
    mealType: "breakfast",
    dietTags: ["vegetarian", "high-protein", "low-carb"],
    calories: 430,
    prepTimeMinutes: 15,
    estimatedCostLevel: "medium"
  },
  {
    id: "protein-smoothie",
    name: "Berry Protein Smoothie",
    description: "Blended berries, banana, protein powder, and spinach with almond milk.",
    mealType: "breakfast",
    dietTags: ["vegetarian", "vegan", "high-protein"],
    calories: 360,
    prepTimeMinutes: 7,
    estimatedCostLevel: "medium"
  },
  {
    id: "chicken-burrito-bowl",
    name: "Chicken Burrito Bowl",
    description: "Grilled chicken, rice, beans, salsa, and avocado in a hearty bowl.",
    mealType: "lunch",
    dietTags: ["high-protein"],
    calories: 650,
    prepTimeMinutes: 25,
    estimatedCostLevel: "medium"
  },
  {
    id: "quinoa-buddha-bowl",
    name: "Quinoa Buddha Bowl",
    description: "Roasted veggies, chickpeas, quinoa, and tahini dressing.",
    mealType: "lunch",
    dietTags: ["vegetarian", "vegan", "high-protein"],
    calories: 540,
    prepTimeMinutes: 30,
    estimatedCostLevel: "medium"
  },
  {
    id: "caprese-sandwich",
    name: "Caprese Sandwich",
    description: "Fresh mozzarella, tomato, basil, and pesto on toasted ciabatta.",
    mealType: "lunch",
    dietTags: ["vegetarian"],
    calories: 520,
    prepTimeMinutes: 15,
    estimatedCostLevel: "medium"
  },
  {
    id: "grilled-salmon-salad",
    name: "Grilled Salmon Salad",
    description: "Salmon over mixed greens with avocado, cucumber, and lemon vinaigrette.",
    mealType: "lunch",
    dietTags: ["pescatarian", "high-protein", "low-carb"],
    calories: 580,
    prepTimeMinutes: 22,
    estimatedCostLevel: "high"
  },
  {
    id: "lentil-soup",
    name: "Hearty Lentil Soup",
    description: "Slow-simmered lentils with carrots, celery, and tomatoes.",
    mealType: "lunch",
    dietTags: ["vegetarian", "vegan", "high-protein"],
    calories: 430,
    prepTimeMinutes: 35,
    estimatedCostLevel: "low"
  },
  {
    id: "chicken-stir-fry",
    name: "Chicken Veggie Stir-Fry",
    description: "Wok-seared chicken with mixed vegetables over jasmine rice.",
    mealType: "dinner",
    dietTags: ["high-protein"],
    calories: 700,
    prepTimeMinutes: 30,
    estimatedCostLevel: "medium"
  },
  {
    id: "tofu-stir-fry",
    name: "Crispy Tofu Stir-Fry",
    description: "Crispy tofu with broccoli, peppers, and a ginger-garlic sauce.",
    mealType: "dinner",
    dietTags: ["vegetarian", "vegan", "high-protein"],
    calories: 620,
    prepTimeMinutes: 30,
    estimatedCostLevel: "medium"
  },
  {
    id: "margherita-pizza",
    name: "Margherita Pizza",
    description: "Thin-crust pizza with tomato, mozzarella, basil, and olive oil.",
    mealType: "dinner",
    dietTags: ["vegetarian"],
    calories: 780,
    prepTimeMinutes: 35,
    estimatedCostLevel: "medium"
  },
  {
    id: "burger-and-fries",
    name: "Classic Burger and Fries",
    description: "Beef burger with lettuce and tomato, served with crispy fries.",
    mealType: "dinner",
    dietTags: ["high-protein"],
    calories: 950,
    prepTimeMinutes: 30,
    estimatedCostLevel: "medium"
  },
  {
    id: "shrimp-tacos",
    name: "Shrimp Tacos",
    description: "Spiced shrimp in soft tortillas with slaw and lime crema.",
    mealType: "dinner",
    dietTags: ["pescatarian", "high-protein"],
    calories: 640,
    prepTimeMinutes: 25,
    estimatedCostLevel: "medium"
  },
  {
    id: "zoodle-bolognese",
    name: "Zucchini Noodle Bolognese",
    description: "Beef or lentil bolognese over zucchini noodles for a lighter twist.",
    mealType: "dinner",
    dietTags: ["low-carb", "high-protein"],
    calories: 520,
    prepTimeMinutes: 35,
    estimatedCostLevel: "medium"
  },
  {
    id: "grain-bowl-chicken",
    name: "Chicken Grain Bowl",
    description: "Brown rice, roasted veggies, grilled chicken, and lemon yogurt sauce.",
    mealType: "dinner",
    dietTags: ["high-protein"],
    calories: 690,
    prepTimeMinutes: 30,
    estimatedCostLevel: "medium"
  },
  {
    id: "mediterranean-salad",
    name: "Mediterranean Chickpea Salad",
    description: "Chickpeas, cucumber, tomato, feta, olives, and herb dressing.",
    mealType: "lunch",
    dietTags: ["vegetarian", "vegan"],
    calories: 480,
    prepTimeMinutes: 18,
    estimatedCostLevel: "low"
  },
  {
    id: "turkey-sandwich",
    name: "Turkey Avocado Sandwich",
    description: "Sliced turkey, avocado, greens, and mustard on whole-grain bread.",
    mealType: "lunch",
    dietTags: ["high-protein"],
    calories: 520,
    prepTimeMinutes: 12,
    estimatedCostLevel: "medium"
  },
  {
    id: "salmon-quinoa-bowl",
    name: "Salmon Quinoa Bowl",
    description: "Baked salmon, quinoa, roasted broccoli, and lemon-dill sauce.",
    mealType: "dinner",
    dietTags: ["pescatarian", "high-protein", "low-carb"],
    calories: 670,
    prepTimeMinutes: 30,
    estimatedCostLevel: "high"
  },
  {
    id: "hummus-veggie-wrap",
    name: "Hummus Veggie Wrap",
    description: "Soft wrap filled with hummus, crunchy veggies, and greens.",
    mealType: "lunch",
    dietTags: ["vegetarian", "vegan"],
    calories: 430,
    prepTimeMinutes: 12,
    estimatedCostLevel: "low"
  },
  {
    id: "fruit-and-nuts",
    name: "Fruit and Nut Snack Plate",
    description: "Apple slices, berries, mixed nuts, and a small piece of dark chocolate.",
    mealType: "snack",
    dietTags: ["vegetarian", "vegan", "low-carb"],
    calories: 260,
    prepTimeMinutes: 5,
    estimatedCostLevel: "medium"
  },
  {
    id: "protein-snack-box",
    name: "Protein Snack Box",
    description: "Boiled eggs, cheese cubes, nuts, and cucumber slices.",
    mealType: "snack",
    dietTags: ["high-protein", "low-carb"],
    calories: 310,
    prepTimeMinutes: 8,
    estimatedCostLevel: "medium"
  },
  {
    id: "chips-and-guac",
    name: "Chips and Guacamole",
    description: "Tortilla chips with fresh guacamole and salsa.",
    mealType: "snack",
    dietTags: ["vegetarian", "vegan"],
    calories: 420,
    prepTimeMinutes: 10,
    estimatedCostLevel: "medium"
  },
  {
    id: "peanut-butter-toast",
    name: "Peanut Butter Banana Toast",
    description: "Whole-grain toast with peanut butter and banana slices.",
    mealType: "snack",
    dietTags: ["vegetarian", "high-protein"],
    calories: 320,
    prepTimeMinutes: 5,
    estimatedCostLevel: "low"
  },
  {
    id: "veggie-pasta",
    name: "Roasted Veggie Pasta",
    description: "Penne tossed with roasted vegetables, olive oil, and parmesan.",
    mealType: "dinner",
    dietTags: ["vegetarian"],
    calories: 720,
    prepTimeMinutes: 30,
    estimatedCostLevel: "low"
  },
  {
    id: "tofu-grain-bowl",
    name: "Tofu Grain Bowl",
    description: "Marinated tofu, farro, roasted veggies, and sesame dressing.",
    mealType: "dinner",
    dietTags: ["vegetarian", "vegan", "high-protein"],
    calories: 640,
    prepTimeMinutes: 30,
    estimatedCostLevel: "medium"
  },
  {
    id: "breakfast-burrito",
    name: "Breakfast Burrito",
    description:
      "Scrambled eggs, potatoes, cheese, and salsa wrapped in a warm tortilla.",
    mealType: "breakfast",
    dietTags: ["high-protein"],
    calories: 610,
    prepTimeMinutes: 20,
    estimatedCostLevel: "medium"
  },
  {
    id: "tofu-scramble-wrap",
    name: "Tofu Scramble Wrap",
    description:
      "Seasoned tofu scramble with peppers and spinach wrapped in a whole-wheat tortilla.",
    mealType: "breakfast",
    dietTags: ["vegetarian", "vegan", "high-protein"],
    calories: 540,
    prepTimeMinutes: 18,
    estimatedCostLevel: "medium"
  },
  {
    id: "steak-and-greens",
    name: "Steak and Greens Plate",
    description:
      "Grilled flank steak served with garlic sautéed greens and roasted carrots.",
    mealType: "dinner",
    dietTags: ["high-protein", "low-carb"],
    calories: 720,
    prepTimeMinutes: 30,
    estimatedCostLevel: "high"
  },
  {
    id: "sushi-roll-platter",
    name: "Simple Sushi Roll Platter",
    description:
      "Assorted salmon and veggie rolls with soy sauce and pickled ginger.",
    mealType: "dinner",
    dietTags: ["pescatarian", "low-carb"],
    calories: 680,
    prepTimeMinutes: 35,
    estimatedCostLevel: "high"
  },
  {
    id: "chickpea-coconut-curry",
    name: "Chickpea Coconut Curry",
    description:
      "Creamy coconut curry with chickpeas and spinach served over rice.",
    mealType: "dinner",
    dietTags: ["vegetarian", "vegan"],
    calories: 640,
    prepTimeMinutes: 30,
    estimatedCostLevel: "low"
  },
  {
    id: "cottage-cheese-bowl",
    name: "Cottage Cheese Power Bowl",
    description:
      "Cottage cheese with cucumber, cherry tomatoes, olive oil, and everything seasoning.",
    mealType: "snack",
    dietTags: ["high-protein", "low-carb"],
    calories: 280,
    prepTimeMinutes: 7,
    estimatedCostLevel: "medium"
  }
];

type MealTypeFilter = "any" | MealType;

type RandomMealGeneratorState = {
  mealType: MealTypeFilter;
  dietaryPreference: DietaryPreferenceFilter;
  minCaloriesInput: string;
  maxCaloriesInput: string;
};

export default function RandomMealGenerator() {
  const [state, setState] = useState<RandomMealGeneratorState>({
    mealType: "any",
    dietaryPreference: "none",
    minCaloriesInput: "",
    maxCaloriesInput: ""
  });
  const [calorieError, setCalorieError] = useState<string | null>(null);
  const [currentMeal, setCurrentMeal] = useState<Meal | null>(null);
  const [lastFilterKey, setLastFilterKey] = useState<string | null>(null);

  const parsedMinCalories = useMemo(() => {
    const value = parseFloat(state.minCaloriesInput);
    if (!Number.isFinite(value)) {
      return undefined;
    }
    return Math.max(0, Math.floor(value));
  }, [state.minCaloriesInput]);

  const parsedMaxCalories = useMemo(() => {
    const value = parseFloat(state.maxCaloriesInput);
    if (!Number.isFinite(value)) {
      return undefined;
    }
    return Math.max(0, Math.floor(value));
  }, [state.maxCaloriesInput]);

  const filterKey = useMemo(
    () =>
      [
        state.mealType,
        state.dietaryPreference,
        parsedMinCalories ?? "",
        parsedMaxCalories ?? ""
      ].join("|"),
    [state.mealType, state.dietaryPreference, parsedMinCalories, parsedMaxCalories]
  );

  const filteredMeals = useMemo(() => {
    if (parsedMinCalories !== undefined && parsedMaxCalories !== undefined) {
      if (parsedMinCalories > parsedMaxCalories) {
        return [];
      }
    }

    return meals.filter((meal) => {
      if (state.mealType !== "any" && meal.mealType !== state.mealType) {
        return false;
      }

      if (state.dietaryPreference !== "none") {
        const requiredTag = state.dietaryPreference as Exclude<
          DietaryPreferenceFilter,
          "none"
        >;
        if (!meal.dietTags.includes(requiredTag as DietTag)) {
          return false;
        }
      }

      if (parsedMinCalories !== undefined && meal.calories < parsedMinCalories) {
        return false;
      }

      if (parsedMaxCalories !== undefined && meal.calories > parsedMaxCalories) {
        return false;
      }

      return true;
    });
  }, [
    parsedMinCalories,
    parsedMaxCalories,
    state.mealType,
    state.dietaryPreference
  ]);

  const chooseRandomMeal = (pool: Meal[]) => {
    if (pool.length === 0) {
      return null;
    }
    if (pool.length === 1) {
      return pool[0];
    }
    const randomIndex = Math.floor(Math.random() * pool.length);
    return pool[randomIndex];
  };

  const handleRandomize = () => {
    if (
      parsedMinCalories !== undefined &&
      parsedMaxCalories !== undefined &&
      parsedMinCalories > parsedMaxCalories
    ) {
      setCalorieError(
        "Min calories cannot be greater than max calories. Adjust the range and try again."
      );
      setCurrentMeal(null);
      return;
    }

    setCalorieError(null);

    const pool = filteredMeals;

    if (pool.length === 0) {
      setCurrentMeal(null);
      setLastFilterKey(filterKey);
      return;
    }

    setLastFilterKey(filterKey);
    setCurrentMeal(chooseRandomMeal(pool));
  };

  const handleReroll = () => {
    if (
      lastFilterKey !== filterKey ||
      parsedMinCalories !== undefined &&
        parsedMaxCalories !== undefined &&
        parsedMinCalories > parsedMaxCalories
    ) {
      handleRandomize();
      return;
    }

    const pool = filteredMeals;

    if (pool.length === 0) {
      setCurrentMeal(null);
      return;
    }

    const next = chooseRandomMeal(pool);

    setCurrentMeal(next);
  };

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const prettyMealType = (mealType: MealType) => {
    if (mealType === "breakfast") {
      return "Breakfast";
    }
    if (mealType === "lunch") {
      return "Lunch";
    }
    if (mealType === "dinner") {
      return "Dinner";
    }
    return "Snack";
  };

  const prettyCost = (cost: EstimatedCostLevel) => {
    if (cost === "low") {
      return "Low";
    }
    if (cost === "medium") {
      return "Medium";
    }
    return "High";
  };

  const tagsLabel = (meal: Meal) =>
    meal.dietTags
      .map((tag) => {
        if (tag === "high-protein") {
          return "High protein";
        }
        if (tag === "low-carb") {
          return "Low carb";
        }
        if (tag === "pescatarian") {
          return "Pescatarian";
        }
        if (tag === "vegetarian") {
          return "Vegetarian";
        }
        return "Vegan";
      })
      .join(" · ");

  return (
    <div className="space-y-6">
      <section aria-label="Random meal filters" className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <label
              htmlFor="mealType"
              className="text-sm font-medium text-slate-800"
            >
              Meal type
            </label>
            <div className="relative">
              <select
                id="mealType"
                value={state.mealType}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    mealType: event.target.value as MealTypeFilter
                  }))
                }
                className={selectBaseClasses}
              >
                <option value="any">Any</option>
                <option value="breakfast">Breakfast</option>
                <option value="lunch">Lunch</option>
                <option value="dinner">Dinner</option>
                <option value="snack">Snack</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 8l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
          <div className="space-y-1">
            <label
              htmlFor="dietaryPreference"
              className="text-sm font-medium text-slate-800"
            >
              Dietary preference
            </label>
            <div className="relative">
              <select
                id="dietaryPreference"
                value={state.dietaryPreference}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    dietaryPreference: event.target.value as DietaryPreferenceFilter
                  }))
                }
                className={selectBaseClasses}
              >
                <option value="none">No preference</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescatarian">Pescatarian</option>
                <option value="high-protein">High protein</option>
                <option value="low-carb">Low carb</option>
              </select>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg
                  className="h-4 w-4 text-slate-400"
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M6 8l4 4 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-sm font-medium text-slate-800">
            Target calorie range
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label
                htmlFor="minCalories"
                className="text-xs font-medium text-slate-600"
              >
                Min calories (optional)
              </label>
              <input
                id="minCalories"
                type="number"
                min={0}
                step="10"
                value={state.minCaloriesInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    minCaloriesInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
                placeholder="e.g. 400"
                inputMode="decimal"
              />
            </div>
            <div className="space-y-1">
              <label
                htmlFor="maxCalories"
                className="text-xs font-medium text-slate-600"
              >
                Max calories (optional)
              </label>
              <input
                id="maxCalories"
                type="number"
                min={0}
                step="10"
                value={state.maxCaloriesInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    maxCaloriesInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
                placeholder="e.g. 800"
                inputMode="decimal"
              />
            </div>
          </div>
          {calorieError && (
            <p className="text-xs text-red-600">{calorieError}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleRandomize}
            className="inline-flex items-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            Randomize meal
          </button>
          {currentMeal && filteredMeals.length > 1 && (
            <button
              type="button"
              onClick={handleReroll}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
            >
              Give me another option
            </button>
          )}
          <p className="text-xs text-slate-500">
            Filters and calories are approximate. Use this to get unstuck, not
            as a strict meal plan.
          </p>
        </div>
      </section>
      <section aria-label="Random meal result">
        {parsedMinCalories !== undefined &&
          parsedMaxCalories !== undefined &&
          parsedMinCalories > parsedMaxCalories && (
            <div className="rounded-md border border-red-100 bg-red-50 p-4 text-sm text-red-800">
              Min calories is higher than max calories. Adjust the range before
              generating a meal.
            </div>
          )}
        {parsedMinCalories === undefined &&
          parsedMaxCalories === undefined &&
          !currentMeal && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              Set your filters and click{" "}
              <span className="font-semibold">Randomize meal</span> to get a
              suggestion.
            </div>
          )}
        {lastFilterKey === filterKey &&
          filteredMeals.length === 0 &&
          !currentMeal &&
          !calorieError && (
            <div className="rounded-md border border-amber-100 bg-amber-50 p-4 text-sm text-amber-900">
              No meals match your filters. Try widening your calorie range or
              relaxing dietary restrictions.
            </div>
          )}
        {currentMeal && (
          <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="text-lg font-semibold text-slate-900">
                {currentMeal.name}
              </h2>
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800">
                {prettyMealType(currentMeal.mealType)}
              </span>
            </div>
            <p className="mt-2 text-sm text-slate-700">
              {currentMeal.description}
            </p>
            <dl className="mt-4 grid gap-3 text-sm text-slate-800 sm:grid-cols-2">
              <div className="space-y-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Dietary tags
                </dt>
                <dd>{tagsLabel(currentMeal)}</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Calories
                </dt>
                <dd>{currentMeal.calories.toLocaleString("en-US")} kcal</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Prep time
                </dt>
                <dd>{currentMeal.prepTimeMinutes} minutes</dd>
              </div>
              <div className="space-y-0.5">
                <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Approximate cost
                </dt>
                <dd>{prettyCost(currentMeal.estimatedCostLevel)}</dd>
              </div>
            </dl>
          </div>
        )}
      </section>
    </div>
  );
}


