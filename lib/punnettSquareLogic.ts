export type PunnettMode = "single" | "dihybrid";

export type TraitPreset = {
  id: "custom" | "pea_seed_shape" | "pea_seed_color" | "pea_two_traits";
  name: string;
  mode: PunnettMode;
  locus1: { letter: string; dominantLabel: string; recessiveLabel: string };
  locus2?: { letter: string; dominantLabel: string; recessiveLabel: string };
  disclaimer: string;
};

export const TRAIT_PRESETS: TraitPreset[] = [
  {
    id: "custom",
    name: "Custom (choose allele letters yourself)",
    mode: "single",
    locus1: { letter: "A", dominantLabel: "Dominant", recessiveLabel: "Recessive" },
    disclaimer:
      "Traits in real organisms can be polygenic, influenced by environment, and not strictly Mendelian."
  },
  {
    id: "pea_seed_shape",
    name: "Pea plant: seed shape (R/r)",
    mode: "single",
    locus1: { letter: "R", dominantLabel: "Round", recessiveLabel: "Wrinkled" },
    disclaimer:
      "Classic Mendelian example. Real traits can have exceptions and context-dependent expression."
  },
  {
    id: "pea_seed_color",
    name: "Pea plant: seed color (Y/y)",
    mode: "single",
    locus1: { letter: "Y", dominantLabel: "Yellow", recessiveLabel: "Green" },
    disclaimer:
      "Classic Mendelian example. Real traits can have exceptions and context-dependent expression."
  },
  {
    id: "pea_two_traits",
    name: "Pea plant: seed shape (R/r) + seed color (Y/y)",
    mode: "dihybrid",
    locus1: { letter: "R", dominantLabel: "Round", recessiveLabel: "Wrinkled" },
    locus2: { letter: "Y", dominantLabel: "Yellow", recessiveLabel: "Green" },
    disclaimer:
      "This uses a simplified independent assortment model. Many traits do not assort independently."
  }
];

export type ParseGenotypeResult =
  | { ok: true; loci: [string, string][] }
  | { ok: false; message: string };

const clean = (s: string): string => s.trim().replace(/\s+/g, "");
const isLetter = (ch: string): boolean =>
  (ch >= "A" && ch <= "Z") || (ch >= "a" && ch <= "z");

const alleleSort = (a: string, b: string): [string, string] => {
  const aUpper = a.toUpperCase();
  const bUpper = b.toUpperCase();
  if (aUpper !== bUpper) {
    return [a, b];
  }
  const aIsUpper = a === aUpper;
  const bIsUpper = b === bUpper;
  if (aIsUpper === bIsUpper) return [a, b];
  return aIsUpper ? [a, b] : [b, a];
};

const normalizeLocus = (a: string, b: string): [string, string] => alleleSort(a, b);

export const parseGenotype = (
  genotypeInput: string,
  mode: PunnettMode
): ParseGenotypeResult => {
  const g = clean(genotypeInput);
  if (!g) {
    return { ok: false, message: "Enter a parent genotype." };
  }
  const expectedLen = mode === "single" ? 2 : 4;
  if (g.length !== expectedLen) {
    return {
      ok: false,
      message:
        mode === "single"
          ? 'Single-gene genotypes should look like "AA", "Aa", or "aa".'
          : 'Dihybrid genotypes should look like "AaBb" (four letters).'
    };
  }
  for (const ch of g) {
    if (!isLetter(ch)) {
      return { ok: false, message: "Genotypes must use letters only." };
    }
  }

  if (mode === "single") {
    const a = g[0];
    const b = g[1];
    if (a.toUpperCase() !== b.toUpperCase()) {
      return { ok: false, message: "Single-gene genotypes must use the same letter (e.g., Aa)." };
    }
    return { ok: true, loci: [normalizeLocus(a, b)] };
  }

  const a1 = g[0];
  const a2 = g[1];
  const b1 = g[2];
  const b2 = g[3];
  if (a1.toUpperCase() !== a2.toUpperCase()) {
    return { ok: false, message: "The first two letters must be the same gene (e.g., Aa)." };
  }
  if (b1.toUpperCase() !== b2.toUpperCase()) {
    return { ok: false, message: "The last two letters must be the same gene (e.g., Bb)." };
  }
  if (a1.toUpperCase() === b1.toUpperCase()) {
    return { ok: false, message: "Use two different genes for dihybrid crosses (e.g., AaBb)." };
  }
  return { ok: true, loci: [normalizeLocus(a1, a2), normalizeLocus(b1, b2)] };
};

export type Gamete = { alleles: string[]; label: string };

const uniqueBy = <T,>(items: T[], key: (item: T) => string): T[] => {
  const map = new Map<string, T>();
  items.forEach((i) => map.set(key(i), i));
  return Array.from(map.values());
};

export const gametesFor = (loci: [string, string][]): Gamete[] => {
  if (loci.length === 0) return [];
  const build = (idx: number, alleles: string[]): string[][] => {
    if (idx >= loci.length) return [alleles];
    const [a, b] = loci[idx];
    return [
      ...build(idx + 1, [...alleles, a]),
      ...build(idx + 1, [...alleles, b])
    ];
  };
  const raw = build(0, []);
  const gametes = raw.map((alleles) => ({ alleles, label: alleles.join("") }));
  return uniqueBy(gametes, (g) => g.label).sort((x, y) => x.label.localeCompare(y.label));
};

const combineLocus = (left: string, right: string): string => {
  const [a, b] = alleleSort(left, right);
  return `${a}${b}`;
};

export type PunnettCell = {
  rowGamete: Gamete;
  colGamete: Gamete;
  genotype: string;
  lociGenotypes: string[];
};

export type PunnettResult =
  | {
      ok: true;
      mode: PunnettMode;
      parent1: string;
      parent2: string;
      parent1Loci: [string, string][];
      parent2Loci: [string, string][];
      gametes1: Gamete[];
      gametes2: Gamete[];
      grid: PunnettCell[][];
      genotypeCounts: Record<string, number>;
      phenotypeCounts: Record<string, number>;
      genotypePercents: Record<string, number>;
      phenotypePercents: Record<string, number>;
      phenotypeLegend: Record<string, string>;
      steps: string[];
    }
  | { ok: false; message: string };

const buildRatios = (counts: Record<string, number>): Record<string, number> => {
  const total = Object.values(counts).reduce((s, v) => s + v, 0);
  const out: Record<string, number> = {};
  Object.entries(counts).forEach(([k, v]) => {
    out[k] = total > 0 ? (v / total) * 100 : 0;
  });
  return out;
};

const hasDominant = (pair: string): boolean => pair[0] === pair[0].toUpperCase() || pair[1] === pair[1].toUpperCase();

export const buildPunnettSquare = (
  mode: PunnettMode,
  parent1Input: string,
  parent2Input: string,
  locusLabels: { dominantLabel: string; recessiveLabel: string }[],
  showSteps: boolean
): PunnettResult => {
  const p1 = parseGenotype(parent1Input, mode);
  if (!p1.ok) return { ok: false, message: `Parent 1: ${p1.message}` };
  const p2 = parseGenotype(parent2Input, mode);
  if (!p2.ok) return { ok: false, message: `Parent 2: ${p2.message}` };
  if (p1.loci.length !== p2.loci.length) {
    return { ok: false, message: "Parents must use the same mode and number of genes." };
  }

  const gametes1 = gametesFor(p1.loci);
  const gametes2 = gametesFor(p2.loci);
  if (gametes1.length === 0 || gametes2.length === 0) {
    return { ok: false, message: "Could not derive gametes." };
  }

  const grid: PunnettCell[][] = gametes1.map((rowGamete) =>
    gametes2.map((colGamete) => {
      const lociGenotypes: string[] = [];
      for (let i = 0; i < p1.loci.length; i += 1) {
        lociGenotypes.push(combineLocus(rowGamete.alleles[i], colGamete.alleles[i]));
      }
      const genotype = lociGenotypes.join("");
      return { rowGamete, colGamete, genotype, lociGenotypes };
    })
  );

  const genotypeCounts: Record<string, number> = {};
  const phenotypeCounts: Record<string, number> = {};
  const phenotypeLegend: Record<string, string> = {};

  grid.forEach((row) => {
    row.forEach((cell) => {
      genotypeCounts[cell.genotype] = (genotypeCounts[cell.genotype] ?? 0) + 1;
      const phenotypeParts: string[] = [];
      cell.lociGenotypes.forEach((pair, idx) => {
        const labels = locusLabels[idx] ?? locusLabels[0];
        phenotypeParts.push(hasDominant(pair) ? labels.dominantLabel : labels.recessiveLabel);
      });
      const phenotypeKey = phenotypeParts.join(" + ");
      phenotypeCounts[phenotypeKey] = (phenotypeCounts[phenotypeKey] ?? 0) + 1;
      phenotypeLegend[phenotypeKey] = phenotypeParts.join(" + ");
    });
  });

  const steps: string[] = [];
  if (showSteps) {
    steps.push(`1) Parse parent genotypes: P1 = ${clean(parent1Input)}, P2 = ${clean(parent2Input)}.`);
    steps.push(
      `2) Derive possible gametes: P1 → ${gametes1.map((g) => g.label).join(", ")}; P2 → ${gametes2.map((g) => g.label).join(", ")}.`
    );
    steps.push("3) Fill the Punnett square by combining one gamete from each parent in every cell.");
    steps.push("4) Count genotypes and map each genotype to a simplified phenotype using dominance (uppercase = dominant allele).");
  }

  return {
    ok: true,
    mode,
    parent1: clean(parent1Input),
    parent2: clean(parent2Input),
    parent1Loci: p1.loci,
    parent2Loci: p2.loci,
    gametes1,
    gametes2,
    grid,
    genotypeCounts,
    phenotypeCounts,
    genotypePercents: buildRatios(genotypeCounts),
    phenotypePercents: buildRatios(phenotypeCounts),
    phenotypeLegend,
    steps
  };
};

export const punnettResultToCsv = (result: PunnettResult): string => {
  if (!result.ok) return "";
  const lines: string[] = [];
  lines.push(`mode,${result.mode}`);
  lines.push(`parent1,${result.parent1}`);
  lines.push(`parent2,${result.parent2}`);
  lines.push("");
  lines.push("genotype,count,percent");
  Object.entries(result.genotypeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([g, count]) => {
      lines.push(`${g},${count},${result.genotypePercents[g].toFixed(2)}`);
    });
  lines.push("");
  lines.push("phenotype,count,percent");
  Object.entries(result.phenotypeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([p, count]) => {
      lines.push(`"${p.replaceAll('"', '""')}",${count},${result.phenotypePercents[p].toFixed(2)}`);
    });
  return lines.join("\n");
};


