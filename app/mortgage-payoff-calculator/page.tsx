import type { Metadata } from "next";
import Link from "next/link";
import MortgagePayoffCalculator from "@/components/MortgagePayoffCalculator";

export const metadata: Metadata = {
  title: "Mortgage Payoff & Amortization Calculator | LifeHackToolbox",
  description:
    "Calculate your monthly mortgage payment, generate a full amortization schedule, and see how extra payments can save you interest and shorten your payoff date.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/mortgage-payoff-calculator"
  }
};

export default function MortgagePayoffCalculatorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Mortgage Payoff &amp; Amortization Calculator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Enter your mortgage details to see your monthly payment, total interest, and a
          full payoff schedule. Add extra payments to see how much time and interest you
          can save over the life of the loan.
        </p>
      </section>
      <MortgagePayoffCalculator />
      <section
        aria-label="About mortgage amortization"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Understanding your mortgage payoff and amortization schedule
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            A mortgage amortization schedule is a month-by-month breakdown of how your
            loan balance drops over time. Each payment is split between interest (the
            cost of borrowing) and principal (the amount that actually pays down your
            loan). Early in the schedule, most of your payment goes to interest because
            the balance is still high. As the balance falls, a larger share of each
            payment goes toward principal.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            How monthly payments are split between principal and interest
          </h3>
          <p>
            For a fixed-rate mortgage, your required monthly payment stays the same, but
            the mix of interest and principal inside that payment changes every month.
            Interest is calculated as a percentage of your remaining balance, so the
            interest portion slowly shrinks while the principal portion grows. The
            amortization table in this tool shows that split for every payment, along
            with the remaining balance after each month.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why total interest on a 30-year loan is so large
          </h3>
          <p>
            Stretching a loan over 30 years keeps the monthly payment manageable, but it
            also means you pay interest for a very long time. Even a modest interest
            rate can generate a large total interest cost when applied to a big balance
            for hundreds of months. By comparing the total interest on a 30-year term vs.
            a shorter term in this calculator, you can see how much more you pay over
            time just for the convenience of a lower monthly payment.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            15-year vs. 30-year mortgages
          </h3>
          <p>
            A 15-year mortgage generally comes with a lower interest rate and a much
            shorter payoff horizon, but the monthly payment can be significantly higher.
            A 30-year mortgage spreads the same principal over twice as many payments,
            so the monthly payment is lower but total interest is higher. This
            calculator lets you experiment with each option and see how the payment,
            total interest, and payoff dates change.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            How extra payments reduce interest and shorten payoff time
          </h3>
          <p>
            Any extra money you send beyond the required payment goes directly toward
            principal, which lowers your balance faster. Because interest is calculated
            on that balance, every extra dollar you pay today reduces the interest
            charged in future months. Regular extra monthly payments can shave off years
            from your payoff date, and a one-time lump sum can noticeably reduce your
            remaining term even if your required payment stays the same.
          </p>
          <p>
            Use the extra-payment options in this tool to compare a standard mortgage
            schedule with one that includes additional payments. You can see both the
            interest saved and how many months earlier the payoff date arrives. This
            makes it easier to decide whether to focus on extra principal payments,
            savings goals, or other priorities.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            This tool is for estimates only
          </h3>
          <p>
            This calculator is designed for quick, educational estimates and does not
            replace official numbers from your lender. Your actual payment and payoff
            schedule may differ based on exact closing dates, escrow, insurance, taxes,
            and lender-specific rules. Always confirm details with your mortgage company
            before making major financial decisions.
          </p>
          <p className="text-xs text-slate-600">
            If you are planning around dates or milestones, tools like the{" "}
            <Link
              href="/time-duration-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Time Duration Calculator
            </Link>{" "}
            can help you work backward from a target date. You can always return to the{" "}
            <Link
              href="/"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              LifeHackToolbox homepage
            </Link>{" "}
            to explore other calculators as they are added.
          </p>
        </div>
      </section>
    </div>
  );
}


