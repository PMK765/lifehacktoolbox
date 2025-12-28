import type { Metadata } from "next";
import PunnettSquareGenerator from "@/components/PunnettSquareGenerator";

export const metadata: Metadata = {
  title: "Punnett Square Generator (Simple + Dihybrid) | LifeHackToolbox",
  description:
    "Generate Punnett squares for single-gene and dihybrid crosses. See genotype and phenotype ratios, show steps, and export a branded PNG plus CSV/JSON outcomes. Runs entirely in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/punnett-square-generator"
  }
};

const PunnettSquareGeneratorPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Punnett Square Generator (Simple + Advanced)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Build Punnett squares for single-gene and dihybrid crosses, with clear genotype and
          phenotype ratios. This tool is designed for learning and includes an optional step-by-step
          explanation plus exports for PNG, CSV, and JSON.
        </p>
      </section>

      <section className="mt-6">
        <PunnettSquareGenerator />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          What is a Punnett square?
        </h2>
        <p>
          A Punnett square is a simple grid-based method used in genetics to predict the
          distribution of offspring genotypes from two parent genotypes. You list one parent’s
          possible gametes across the top, the other parent’s possible gametes down the side,
          and then fill in each grid cell by combining alleles.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Single-gene crosses vs dihybrid crosses
        </h3>
        <p>
          A <span className="font-semibold">single-gene</span> Punnett square tracks one gene
          with two alleles (for example, <span className="font-mono">A</span> and{" "}
          <span className="font-mono">a</span>). A <span className="font-semibold">dihybrid</span>{" "}
          square tracks two genes at the same time (for example,{" "}
          <span className="font-mono">AaBb</span>). Dihybrid squares are larger because there are
          more possible gamete combinations.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Genotype ratios and phenotype ratios
        </h3>
        <p>
          The genotype ratio counts the exact allele combinations (like{" "}
          <span className="font-mono">AA</span>,{" "}
          <span className="font-mono">Aa</span>,{" "}
          <span className="font-mono">aa</span>). The phenotype ratio groups genotypes into
          observable categories. This tool uses a simplified dominance model where an uppercase
          allele is treated as dominant.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Important disclaimer (real traits are complex)
        </h3>
        <p>
          Many real traits are not governed by a single dominant/recessive gene pair. Traits can be
          polygenic, influenced by environment, show incomplete dominance, codominance, linkage,
          epistasis, and many other effects. Use this Punnett square generator for educational
          practice and conceptual understanding, not medical or predictive decision-making.
        </p>
        <p>
          This tool runs entirely in your browser and stores your last-used settings in localStorage
          for convenience (clearing your browser data removes that history).
        </p>
      </section>
    </main>
  );
};

export default PunnettSquareGeneratorPage;


