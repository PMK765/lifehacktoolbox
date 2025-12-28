import type { Metadata } from "next";
import RentVsBuyCalculator from "@/components/RentVsBuyCalculator";

export const metadata: Metadata = {
  title:
    "Rent vs Buy Calculator | Compare Renting and Buying a Home | LifeHackToolbox",
  description:
    "Use this rent vs buy calculator to compare monthly costs, long-term net worth, and the break-even year between renting and buying a house. See how appreciation, rent inflation, and investing your savings change the math.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/rent-vs-buy-calculator"
  }
};

const RentVsBuyPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Rent vs Buy Calculator
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Compare renting versus buying a home with full monthly cost breakdown,
          net worth over time, and a clear break-even year under your
          assumptions. Everything runs in your browser and uses transparent,
          adjustable inputs.
        </p>
      </section>
      <section className="mt-6">
        <RentVsBuyCalculator />
      </section>
      <section className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 md:p-7">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          How this rent vs buy calculator works
        </h2>
        <p>
          This <span className="font-semibold">rent vs buy calculator</span>{" "}
          compares two simplified scenarios over a time horizon you choose. In
          the buying scenario, you purchase a home with a mortgage, pay
          property taxes, homeowners insurance, HOA dues, and a maintenance
          reserve, and your home value grows according to an annual appreciation
          rate. In the renting scenario, you continue renting, your rent rises
          with an annual inflation rate, and you invest the money you would have
          used for the down payment, closing costs, and any yearly savings when
          renting is cheaper than owning.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          What costs are included when you own a home?
        </h3>
        <p>
          Owning a home involves more than just the principal and interest
          portion of your mortgage payment. This calculator includes estimated
          monthly principal and interest, annual property taxes based on the
          home value, homeowners insurance, HOA dues (if any), and a simple
          maintenance allowance as a percentage of the property value. It also
          spreads buyer closing costs over the analysis horizon so you can see
          how they affect your effective annual cost. The goal is not to model
          every expense perfectly, but to capture the major components that
          drive long-term affordability.
        </p>
        <p>
          At the end of each year, the calculator tracks how much mortgage
          principal you have repaid, how much interest you have paid, and how
          much equity you have built as the home appreciates. When estimating
          net worth, it subtracts selling costs (for example real estate
          commissions and fees) from the home&apos;s estimated value so you see
          what you might walk away with if you sold at that point.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          How investing the down payment changes the math
        </h3>
        <p>
          In the renting path, the tool assumes you invest the would-be down
          payment and closing costs from day one. It then adds additional
          contributions in any year where renting is cheaper than owning,
          compounding those investments at the rate you enter. This lets you
          compare the equity you might build in a home with the portfolio you
          could accumulate by staying a renter and investing the difference.
          Because investment returns are uncertain, you can test multiple
          scenarios by moving the return slider.
        </p>
        <p>
          The comparison chart shows two lines: projected net worth if you buy
          (home equity minus estimated selling costs) and net worth if you keep
          renting (your investment balance). Where these lines cross, the tool
          marks a break-even year, showing roughly when buying becomes better
          or worse than renting in terms of wealth.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Limitations: what this calculator cannot predict
        </h3>
        <p>
          No calculator can perfectly answer the question{" "}
          <span className="font-semibold">
            &ldquo;should I rent or buy a house?&rdquo;
          </span>{" "}
          Real life includes changing incomes, job moves, unexpected repairs,
          interest-rate shifts, and tax rules that vary by country and even by
          household. This tool intentionally ignores income taxes, mortgage
          interest deductions, and capital gains rules so that the math stays
          transparent and comparable across locations. It also assumes your
          lifestyle and credit remain stable and that you can actually qualify
          for the mortgage described.
        </p>
        <p>
          Think of this as a{" "}
          <span className="font-semibold">
            home affordability calculator
          </span>{" "}
          for intuition, not a definitive answer. It helps you see how different
          appreciation rates, rent inflation, and investment returns affect the
          long-term tradeoffs between renting and buying. Use it as one input
          among many when making housing decisions, ideally alongside advice
          from a financial planner or housing counselor who understands your
          full situation.
        </p>
      </section>
    </main>
  );
};

export default RentVsBuyPage;


