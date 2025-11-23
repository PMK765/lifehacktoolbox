import type { Metadata } from "next";
import Link from "next/link";
import HourlySalaryTaxCalculator from "@/components/HourlySalaryTaxCalculator";

export const metadata: Metadata = {
  title: "Hourly to Salary to After-Tax Calculator | LifeHackTools",
  description:
    "Convert your hourly wage into weekly, monthly, and annual salary, then estimate your after-tax income using simplified U.S. federal, state, and FICA assumptions."
};

export default function HourlySalaryTaxCalculatorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Hourly to Salary to After-Tax Calculator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Enter your hourly wage, hours, and U.S. location to see your gross
          salary along with a rough estimate of taxes and take-home pay. This
          tool focuses on U.S. income only and uses simplified assumptions, so
          treat the output as a directional estimate rather than an exact tax
          calculation.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Results do not account for deductions, credits, benefits, or local
          taxes. Always confirm important decisions with a qualified tax
          professional.
        </p>
      </section>
      <HourlySalaryTaxCalculator />
      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">
          How this calculator works
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            To convert hourly pay into salary, the calculator multiplies your
            hourly wage by the number of hours you work per week and the number
            of weeks you work per year. For example, an hourly rate of{" "}
            <span className="font-medium">$25</span>, at{" "}
            <span className="font-medium">40</span> hours per week and{" "}
            <span className="font-medium">52</span> weeks per year, produces a
            gross salary of roughly{" "}
            <span className="font-medium">$52,000 per year</span>.
          </p>
          <p>
            Federal income tax is approximated using progressive U.S. tax
            brackets based on your filing status. Income is split across
            brackets so higher portions of income are taxed at higher
            percentages, while lower portions stay at lower rates.
          </p>
          <p>
            State income tax is modeled as a flat effective rate that depends on
            the location you choose. Generic U.S. uses a modest flat rate,
            California and New York use higher effective rates, and Texas is set
            to zero to reflect the absence of state income tax on wages.
          </p>
          <p>
            FICA combines Social Security and Medicare into a single percentage
            applied to your gross income for a simple, consistent approximation.
            The calculator then subtracts estimated federal, state, and FICA
            amounts from your gross salary to show an estimated take-home pay on
            yearly, monthly, bi-weekly, and weekly bases.
          </p>
          <p className="text-xs text-slate-600">
            This is not a full tax engine and cannot know your personal
            deductions, credits, benefits, or local taxes. Use it to get a fast
            sense of your income, then review the results with a tax
            professional before making commitments like signing a lease,
            choosing a job offer, or planning large purchases.
          </p>
        </div>
      </section>
      <section
        aria-label="Browse more tools"
        className="space-y-3 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Browse more tools
        </h2>
        <p className="text-sm text-slate-700">
          LifeHackTools is growing into a focused set of calculators and
          utilities built for quick, real-world decisions. Start from the
          homepage and keep an eye out for new tools as they appear.
        </p>
        <div>
          <Link
            href="/"
            className="text-sm font-medium text-emerald-700 hover:text-emerald-800"
          >
            Back to homepage
          </Link>
        </div>
      </section>
    </div>
  );
}


