export type DnaBase = "A" | "C" | "G" | "T";

export type AminoAcidCode =
  | "Ala"
  | "Arg"
  | "Asn"
  | "Asp"
  | "Cys"
  | "Gln"
  | "Glu"
  | "Gly"
  | "His"
  | "Ile"
  | "Leu"
  | "Lys"
  | "Met"
  | "Phe"
  | "Pro"
  | "Ser"
  | "Thr"
  | "Trp"
  | "Tyr"
  | "Val"
  | "Stop";

export type CodonInfo = {
  codon: string;
  aminoAcid: AminoAcidCode;
  fullName: string;
  isStart: boolean;
  isStop: boolean;
};

export const CODON_TABLE: CodonInfo[] = [
  { codon: "TTT", aminoAcid: "Phe", fullName: "Phenylalanine", isStart: false, isStop: false },
  { codon: "TTC", aminoAcid: "Phe", fullName: "Phenylalanine", isStart: false, isStop: false },
  { codon: "TTA", aminoAcid: "Leu", fullName: "Leucine", isStart: false, isStop: false },
  { codon: "TTG", aminoAcid: "Leu", fullName: "Leucine", isStart: false, isStop: false },
  { codon: "TCT", aminoAcid: "Ser", fullName: "Serine", isStart: false, isStop: false },
  { codon: "TCC", aminoAcid: "Ser", fullName: "Serine", isStart: false, isStop: false },
  { codon: "TCA", aminoAcid: "Ser", fullName: "Serine", isStart: false, isStop: false },
  { codon: "TCG", aminoAcid: "Ser", fullName: "Serine", isStart: false, isStop: false },
  { codon: "TAT", aminoAcid: "Tyr", fullName: "Tyrosine", isStart: false, isStop: false },
  { codon: "TAC", aminoAcid: "Tyr", fullName: "Tyrosine", isStart: false, isStop: false },
  { codon: "TAA", aminoAcid: "Stop", fullName: "Stop", isStart: false, isStop: true },
  { codon: "TAG", aminoAcid: "Stop", fullName: "Stop", isStart: false, isStop: true },
  { codon: "TGT", aminoAcid: "Cys", fullName: "Cysteine", isStart: false, isStop: false },
  { codon: "TGC", aminoAcid: "Cys", fullName: "Cysteine", isStart: false, isStop: false },
  { codon: "TGA", aminoAcid: "Stop", fullName: "Stop", isStart: false, isStop: true },
  { codon: "TGG", aminoAcid: "Trp", fullName: "Tryptophan", isStart: false, isStop: false },
  { codon: "CTT", aminoAcid: "Leu", fullName: "Leucine", isStart: false, isStop: false },
  { codon: "CTC", aminoAcid: "Leu", fullName: "Leucine", isStart: false, isStop: false },
  { codon: "CTA", aminoAcid: "Leu", fullName: "Leucine", isStart: false, isStop: false },
  { codon: "CTG", aminoAcid: "Leu", fullName: "Leucine", isStart: false, isStop: false },
  { codon: "CCT", aminoAcid: "Pro", fullName: "Proline", isStart: false, isStop: false },
  { codon: "CCC", aminoAcid: "Pro", fullName: "Proline", isStart: false, isStop: false },
  { codon: "CCA", aminoAcid: "Pro", fullName: "Proline", isStart: false, isStop: false },
  { codon: "CCG", aminoAcid: "Pro", fullName: "Proline", isStart: false, isStop: false },
  { codon: "CAT", aminoAcid: "His", fullName: "Histidine", isStart: false, isStop: false },
  { codon: "CAC", aminoAcid: "His", fullName: "Histidine", isStart: false, isStop: false },
  { codon: "CAA", aminoAcid: "Gln", fullName: "Glutamine", isStart: false, isStop: false },
  { codon: "CAG", aminoAcid: "Gln", fullName: "Glutamine", isStart: false, isStop: false },
  { codon: "CGT", aminoAcid: "Arg", fullName: "Arginine", isStart: false, isStop: false },
  { codon: "CGC", aminoAcid: "Arg", fullName: "Arginine", isStart: false, isStop: false },
  { codon: "CGA", aminoAcid: "Arg", fullName: "Arginine", isStart: false, isStop: false },
  { codon: "CGG", aminoAcid: "Arg", fullName: "Arginine", isStart: false, isStop: false },
  { codon: "ATT", aminoAcid: "Ile", fullName: "Isoleucine", isStart: false, isStop: false },
  { codon: "ATC", aminoAcid: "Ile", fullName: "Isoleucine", isStart: false, isStop: false },
  { codon: "ATA", aminoAcid: "Ile", fullName: "Isoleucine", isStart: false, isStop: false },
  { codon: "ATG", aminoAcid: "Met", fullName: "Methionine", isStart: true, isStop: false },
  { codon: "ACT", aminoAcid: "Thr", fullName: "Threonine", isStart: false, isStop: false },
  { codon: "ACC", aminoAcid: "Thr", fullName: "Threonine", isStart: false, isStop: false },
  { codon: "ACA", aminoAcid: "Thr", fullName: "Threonine", isStart: false, isStop: false },
  { codon: "ACG", aminoAcid: "Thr", fullName: "Threonine", isStart: false, isStop: false },
  { codon: "AAT", aminoAcid: "Asn", fullName: "Asparagine", isStart: false, isStop: false },
  { codon: "AAC", aminoAcid: "Asn", fullName: "Asparagine", isStart: false, isStop: false },
  { codon: "AAA", aminoAcid: "Lys", fullName: "Lysine", isStart: false, isStop: false },
  { codon: "AAG", aminoAcid: "Lys", fullName: "Lysine", isStart: false, isStop: false },
  { codon: "AGT", aminoAcid: "Ser", fullName: "Serine", isStart: false, isStop: false },
  { codon: "AGC", aminoAcid: "Ser", fullName: "Serine", isStart: false, isStop: false },
  { codon: "AGA", aminoAcid: "Arg", fullName: "Arginine", isStart: false, isStop: false },
  { codon: "AGG", aminoAcid: "Arg", fullName: "Arginine", isStart: false, isStop: false },
  { codon: "GTT", aminoAcid: "Val", fullName: "Valine", isStart: false, isStop: false },
  { codon: "GTC", aminoAcid: "Val", fullName: "Valine", isStart: false, isStop: false },
  { codon: "GTA", aminoAcid: "Val", fullName: "Valine", isStart: false, isStop: false },
  { codon: "GTG", aminoAcid: "Val", fullName: "Valine", isStart: false, isStop: false },
  { codon: "GCT", aminoAcid: "Ala", fullName: "Alanine", isStart: false, isStop: false },
  { codon: "GCC", aminoAcid: "Ala", fullName: "Alanine", isStart: false, isStop: false },
  { codon: "GCA", aminoAcid: "Ala", fullName: "Alanine", isStart: false, isStop: false },
  { codon: "GCG", aminoAcid: "Ala", fullName: "Alanine", isStart: false, isStop: false },
  { codon: "GAT", aminoAcid: "Asp", fullName: "Aspartic acid", isStart: false, isStop: false },
  { codon: "GAC", aminoAcid: "Asp", fullName: "Aspartic acid", isStart: false, isStop: false },
  { codon: "GAA", aminoAcid: "Glu", fullName: "Glutamic acid", isStart: false, isStop: false },
  { codon: "GAG", aminoAcid: "Glu", fullName: "Glutamic acid", isStart: false, isStop: false },
  { codon: "GGT", aminoAcid: "Gly", fullName: "Glycine", isStart: false, isStop: false },
  { codon: "GGC", aminoAcid: "Gly", fullName: "Glycine", isStart: false, isStop: false },
  { codon: "GGA", aminoAcid: "Gly", fullName: "Glycine", isStart: false, isStop: false },
  { codon: "GGG", aminoAcid: "Gly", fullName: "Glycine", isStart: false, isStop: false }
];

export const codonMap: Record<string, CodonInfo> = CODON_TABLE.reduce(
  (accumulator, entry) => {
    accumulator[entry.codon] = entry;
    return accumulator;
  },
  {} as Record<string, CodonInfo>
);


