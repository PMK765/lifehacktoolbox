import type { Metadata } from "next";
import MolecularWeightCalculator from "@/components/MolecularWeightCalculator";

export const metadata: Metadata = {
  title: "Molecular Weight (Molar Mass) Calculator | LifeHackToolbox",
  description:
    "Calculate molecular weight (molar mass) from chemical formulas like Ca(OH)2 and Al2(SO4)3. Get a per-element breakdown, percent composition, and export JSON/CSV. Runs entirely in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/molecular-weight-calculator"
  }
};

const MolecularWeightCalculatorPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Molecular Weight (Molar Mass) Calculator
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Compute molar mass from a chemical formula, including parentheses and multipliers.
          You’ll get a total molar mass in g/mol plus a per-element breakdown and percent
          composition. Everything runs locally in your browser.
        </p>
      </section>

      <section className="mt-6">
        <MolecularWeightCalculator />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          What is molar mass?
        </h2>
        <p>
          Molar mass (sometimes called molecular weight) is the mass of one mole of a substance.
          For a pure chemical compound, the molar mass is found by adding the atomic masses of
          each element in the formula, multiplied by how many atoms of that element appear in the
          compound. The usual unit is grams per mole (g/mol).
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          How to read chemical formulas with parentheses
        </h3>
        <p>
          Parentheses group atoms together so a multiplier applies to everything inside the group.
          For example, in <span className="font-mono">Ca(OH)2</span>, the 2 applies to both O and H,
          meaning the formula contains 1 Ca, 2 O, and 2 H. In{" "}
          <span className="font-mono">Al2(SO4)3</span>, the 3 applies to S and O4, so you have 2 Al,
          3 S, and 12 O.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Percent composition
        </h3>
        <p>
          Percent composition tells you what fraction of the total molar mass comes from each
          element. This is useful for chemistry homework, preparing lab solutions, and checking
          whether an experimental measurement is consistent with a proposed formula.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Notes about accuracy and references
        </h3>
        <p>
          Atomic masses are standard average atomic weights. Different references may round
          values differently or use isotopic masses for specialized problems, so small differences
          are expected depending on context. Use the breakdown table to see exactly which atomic
          masses were used in the calculation.
        </p>
        <p>
          This molar mass calculator runs entirely in your browser and does not upload your
          formulas to a server. It stores your last-used formula in localStorage for convenience
          (clearing your browser data removes that history).
        </p>
      </section>
    </main>
  );
};

export default MolecularWeightCalculatorPage;


