import type { Metadata } from "next";
import Link from "next/link";
import GrassSeedCalculator from "@/components/GrassSeedCalculator";

export const metadata: Metadata = {
  title: "Grass Seed Coverage Calculator | LifeHackToolbox",
  description:
    "Estimate how many bags of grass seed you need. Supports major brands, new lawns, reseeding, and custom seed mixes."
};

export default function GrassSeedCalculatorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Grass Seed Coverage Calculator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Choose whether you are planting a brand new lawn or overseeding an existing one,
          pick a grass seed brand and bag size, and estimate how many bags you need. You
          can also plug in a custom mix with your own bag weight and seed rate.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Coverage numbers are approximate and based on typical manufacturer guidance.
          Always check the directions on your specific bag and adjust based on your soil,
          spreader, and local conditions.
        </p>
      </section>
      <GrassSeedCalculator />
      <section
        aria-label="How grass seed coverage works"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          How to think about grass seed coverage for new lawns vs. overseeding
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            New lawns and overseeding projects are not the same job. On bare soil, every
            plant has to come from seed, so you need a much heavier application rate to
            avoid thin, patchy coverage. When you overseed an existing lawn, you are
            mostly filling gaps and thickening what is already there, so you can get away
            with far less seed per square foot. That is why most bags list two numbers:
            one for new lawns and one for overseeding.
          </p>
          <p>
            As a rule of thumb, new cool-season lawns often land around 8–10 pounds of
            seed per 1,000 square feet, while overseeding is closer to 3–5 pounds per
            1,000 square feet. The presets in this calculator take those ranges into
            account, and you can always override the rate if you prefer to follow a
            specific manufacturer recommendation.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why different brands and mixes cover different amounts
          </h3>
          <p>
            Not all seed mixes are created equal. Some bags are mostly inexpensive
            perennial ryegrass for fast germination, while others lean on tall fescue or
            Kentucky bluegrass for deeper roots and long-term durability. Seed coatings
            and filler materials also change how dense a bag really is. Two 20-pound bags
            from different brands can legitimately claim different coverage numbers even
            when you are aiming for similar lawn types.
          </p>
          <p>
            The coverage table in this tool gives you a quick way to compare those labeled
            differences. You can see how many square feet each bag is rated for under new
            and reseed directions, and the approximate pounds per 1,000 square feet those
            numbers imply. Use that as a sanity check if a bag&apos;s marketing claims
            look too good to be true.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Seed mixes, cool-season vs. warm-season, and regional fit
          </h3>
          <p>
            Sun and shade mixes like the ones listed here are typically cool-season
            grasses meant for northern climates: tall fescue, perennial ryegrass, and
            Kentucky bluegrass in different ratios. In warmer regions that favor
            warm-season grasses like Bermuda, zoysia, or St. Augustine, coverage behavior
            and recommended rates can look different. Seed may also be expensive or
            limited if your local turf spreads primarily by stolons or plugs instead of
            dense seeding.
          </p>
          <p>
            Whatever mix you choose, the basics are the same: prep the soil by removing
            debris and thatch, lightly loosen the top layer, spread seed evenly, and then
            get good contact by raking or rolling. Topdressing with a thin layer of peat
            or compost can help retain moisture during germination, especially on slopes
            or in exposed areas.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Watering and timing matter as much as coverage
          </h3>
          <p>
            Even perfect math will not fix poor watering or bad timing. New seed needs the
            top layer of soil to stay consistently moist (not soaked) until seedlings are
            established. That often means light, frequent watering rather than occasional
            deep soaks. Planting during the right season for your grass type—usually early
            fall or spring for cool-season lawns—also makes it easier to hit those
            moisture and temperature windows without fighting extreme heat.
          </p>
          <p>
            Use this calculator to pick a reasonable number of bags, then treat the
            instructions on the bag as the final word. If you have tricky slopes, heavy
            shade, or compacted soil, it can be worth talking to a local lawn pro for
            region-specific guidance instead of relying purely on generic numbers.
          </p>
          <p>
            If you are planning a larger renovation that includes painting or other home
            projects, the{" "}
            <Link
              href="/paint-coverage-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Paint Coverage Calculator
            </Link>{" "}
            and the{" "}
            <Link
              href="/hourly-salary-tax-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Hourly → Salary → After-Tax Calculator
            </Link>{" "}
            can help you estimate material needs and understand how those costs fit into
            your monthly budget. You can always head back to the{" "}
            <Link
              href="/"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              LifeHackToolbox homepage
            </Link>{" "}
            to browse more tools as they are added.
          </p>
          <p className="text-xs text-slate-600">
            Nothing here replaces local agronomy advice or the directions on your seed
            bag. Use this calculator to get into the right range, then adjust based on
            what your soil, climate, and lawn actually need.
          </p>
        </div>
      </section>
    </div>
  );
}


