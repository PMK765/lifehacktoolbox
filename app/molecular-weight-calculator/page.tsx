import type { Metadata } from "next";
import Link from "next/link";
import MolecularWeightCalculator from "@/components/MolecularWeightCalculator";
import { buildFaqPageJsonLd, buildWebApplicationJsonLd } from "@/lib/seoJsonLd";

export const metadata: Metadata = {
  title: "Molar Mass Calculator: Molecular Weight + Percent Composition | LifeHackToolbox",
  description:
    "Molar mass calculator for chemical formulas (supports parentheses and multipliers). Get molecular weight in g/mol, per-element breakdown, percent composition, and JSON/CSV export. Runs in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/molecular-weight-calculator"
  }
};

const MolecularWeightCalculatorPage = () => {
  const webAppJsonLd = buildWebApplicationJsonLd({
    name: "Molecular Weight (Molar Mass) Calculator",
    description:
      "Calculate molar mass from a chemical formula with parentheses and multipliers, plus percent composition and exports.",
    url: "https://lifehacktoolbox.com/molecular-weight-calculator",
    applicationCategory: "EducationalApplication"
  });

  const faqItems = [
    {
      question: "What is molar mass (molecular weight)?",
      answer:
        "Molar mass is the mass of one mole of a substance. For a compound, it is the sum of each element’s atomic mass multiplied by the number of atoms of that element in the formula. It is usually reported in g/mol."
    },
    {
      question: "How do parentheses affect molar mass calculations?",
      answer:
        "Parentheses group atoms so a multiplier applies to everything inside the group. For example, Ca(OH)2 contains two O and two H because the 2 multiplies the whole (OH) group."
    },
    {
      question: "What is percent composition?",
      answer:
        "Percent composition is the percentage of the total molar mass contributed by each element. It is useful for homework, empirical formula work, and quick consistency checks."
    },
    {
      question: "Why might my answer differ from a textbook?",
      answer:
        "Small differences are often rounding differences in atomic weights or a reference using isotopic masses. This tool uses standard average atomic weights."
    },
    {
      question: "Does this tool upload my formulas?",
      answer:
        "No. The calculation runs entirely in your browser and does not upload your inputs to a server."
    }
  ] as const;

  const faqJsonLd = buildFaqPageJsonLd([...faqItems]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
          How to use this molar mass calculator
        </h3>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-medium">Enter a formula</span> using element symbols and optional multipliers, for example{" "}
            <span className="font-mono">H2O</span>, <span className="font-mono">C6H12O6</span>,{" "}
            <span className="font-mono">Ca(OH)2</span>, or <span className="font-mono">Al2(SO4)3</span>.
          </li>
          <li>
            <span className="font-medium">Check the breakdown</span> to see each element’s count, atomic weight used, mass contribution, and percent of the total.
          </li>
          <li>
            <span className="font-medium">Export</span> as JSON or CSV when you need to attach results to a lab write-up, worksheet, or study notes.
          </li>
        </ul>
        <h3 className="text-base font-semibold text-slate-900">
          Supported syntax and limitations
        </h3>
        <p>
          This calculator supports nested grouping with parentheses, brackets, or braces (for example{" "}
          <span className="font-mono">K4[Fe(CN)6]</span>) and integer multipliers after an element or group. It ignores whitespace.
        </p>
        <p>
          It does not currently support dot/hydrate notation (like <span className="font-mono">CuSO4·5H2O</span>), ionic charge annotations (like <span className="font-mono">SO4^2-</span>), or isotopic notation. If your course uses those formats, convert the compound to an equivalent expanded formula before calculating.
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
        <h3 className="text-base font-semibold text-slate-900">
          Related tools
        </h3>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <Link href="/periodic-table" className="font-medium text-emerald-700 underline underline-offset-2">
              Interactive Periodic Table
            </Link>
          </li>
          <li>
            <Link href="/unit-converter" className="font-medium text-emerald-700 underline underline-offset-2">
              Universal Unit Converter
            </Link>
          </li>
          <li>
            <Link href="/statistics-explorer" className="font-medium text-emerald-700 underline underline-offset-2">
              Statistics Explorer
            </Link>
          </li>
          <li>
            <Link href="/dna-sequence-explorer" className="font-medium text-emerald-700 underline underline-offset-2">
              DNA Sequence Explorer
            </Link>
          </li>
        </ul>
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Molar mass FAQ
        </h2>
        <h3 className="text-base font-semibold text-slate-900">
          What is the difference between molar mass and molecular weight?
        </h3>
        <p>
          In many classroom contexts, “molecular weight” is used informally for molar mass. Technically, molar mass is mass per mole (g/mol), while molecular weight is a relative, unitless comparison. Most homework problems mean g/mol.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Why do parentheses matter in formulas?
        </h3>
        <p>
          Parentheses indicate a group that is multiplied. In <span className="font-mono">Ca(OH)2</span>, the 2 applies to both O and H, so the compound contains two oxygen atoms and two hydrogen atoms.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          What is percent composition used for?
        </h3>
        <p>
          Percent composition is commonly used to connect measured mass percentages to a formula, check an empirical formula, or explain why one element dominates the mass of a compound.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Why is my result slightly different from another calculator?
        </h3>
        <p>
          Different references round atomic weights differently, and some problems use isotopic masses instead of average atomic weights. Small differences are normal; for grading, use the same reference your course expects.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Is my formula uploaded to the internet?
        </h3>
        <p>
          No. The calculator runs locally in your browser and does not upload the formula you enter.
        </p>
      </section>
    </main>
  );
};

export default MolecularWeightCalculatorPage;


