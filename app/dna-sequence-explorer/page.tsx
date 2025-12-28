import DnaSequenceExplorer from "@/components/DnaSequenceExplorer";

export const metadata = {
  title: "DNA Sequence Explorer | LifeHackToolbox",
  description:
    "Visualize DNA sequences, codons, and reading frames. Translate bases to amino acids, inspect base frequencies, and export charts and data. Fully interactive and runs in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/dna-sequence-explorer"
  }
};

const DnaSequenceExplorerPage = () => {
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="dna-sequence-explorer-heading"
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1
            id="dna-sequence-explorer-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            DNA Sequence Explorer
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Paste a DNA sequence, explore its bases, codons, and reading
            frames, then translate it into amino acids. Everything runs locally
            in your browser with no uploads.
          </p>
        </div>
        <DnaSequenceExplorer />
      </section>
      <section
        aria-labelledby="dna-seo-education-heading"
        className="space-y-6 border-t border-slate-200 pt-6 text-sm text-slate-800"
      >
        <header className="space-y-2">
          <h2
            id="dna-seo-education-heading"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Understand DNA, bases, codons, and reading frames
          </h2>
          <p className="max-w-3xl text-sm text-slate-700">
            This DNA Sequence Explorer is built as a practical companion for
            biology and genetics students who want to see how raw sequences map
            to codons and amino acids in real time.
          </p>
        </header>
        <article className="space-y-5">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              What is DNA?
            </h3>
            <p>
              Deoxyribonucleic acid (DNA) is the long, double-stranded molecule
              that encodes genetic information in almost all living organisms. A
              DNA molecule is built from four types of nucleotides, each
              identified by a base letter: A (adenine), C (cytosine), G
              (guanine), and T (thymine). The order of these bases along a
              strand forms a sequence, and specific segments of that sequence
              encode proteins, regulatory instructions, or structural elements.
            </p>
            <p>
              In this tool, the sequence you paste is cleaned and normalized so
              that only A, C, G, and T bases remain. You can see base-level
              patterns, such as GC-rich regions, and how those regions translate
              into codons and amino acids. By toggling views and frames, you can
              connect the abstract sequence to concrete biological meaning.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Bases and base pairing (A–T, C–G)
            </h3>
            <p>
              DNA is double-stranded, with two complementary chains running in
              opposite directions. The bases follow strict pairing rules: A
              pairs with T and C pairs with G. When you enable the complementary
              strand in this explorer, every A in your sequence is mirrored by a
              T below it, and every C is mirrored by a G. This simple rule is
              what allows DNA to be copied accurately during replication and to
              be transcribed into RNA.
            </p>
            <p>
              The GC content metric in the stats panel highlights how many bases
              are G or C. GC-rich regions often have different physical
              properties, such as higher melting temperatures, and can be
              important in regulatory regions or genomes with unusual base
              composition. The small bar chart in the side panel gives a quick
              visual sense of how balanced or skewed your sequence is across the
              four bases.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Codons and the genetic code
            </h3>
            <p>
              Proteins are built from amino acids, and cells use a three-base
              code called a codon to specify which amino acid to add next. For
              example, the codon ATG encodes methionine, while TTT encodes
              phenylalanine. Most amino acids are encoded by more than one
              codon, but the mapping from triplets to amino acids is consistent
              and is known as the standard genetic code.
            </p>
            <p>
              In the codon view of this tool, your DNA sequence is chunked into
              triplets according to the selected reading frame. Each codon card
              shows its three-letter code and the amino acid it encodes. Start
              codons like ATG are highlighted, and stop codons such as TAA, TAG,
              and TGA are flagged so you can quickly see where translation would
              begin and end. Clicking any codon reveals its amino acid name,
              frame, and the number of times it appears in the sequence.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Reading frames and why they matter
            </h3>
            <p>
              Because codons are groups of three bases, the position where you
              start reading determines how the rest of the sequence is
              partitioned. There are three possible reading frames on a single
              DNA strand: starting at the first base, the second base, or the
              third base. A shift in frame changes every codon downstream and
              can completely alter the resulting amino acid sequence. Frameshift
              mutations, where bases are inserted or deleted, often cause
              dramatic changes in protein structure.
            </p>
            <p>
              The DNA Sequence Explorer lets you flip between frame 1, 2, and 3
              and watch both the codon list and translated amino-acid sequence
              update instantly. This makes it easier to visualize how a small
              shift can turn a stretch of meaningful codons into many stop
              codons or unrelated amino acids. On the translation tab, you can
              switch between one-letter and three-letter amino-acid codes to
              match textbook notation or protein-sequence databases.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Start and stop codons
            </h3>
            <p>
              Although many codons encode amino acids, not all of them are
              treated equally by the cell. ATG typically acts as a start codon
              in coding sequences, signaling the ribosome to begin translation
              and inserting methionine as the first amino acid. In contrast,
              stop codons (TAA, TAG, TGA) do not code for amino acids at all;
              they instruct the ribosome to terminate translation and release
              the completed polypeptide.
            </p>
            <p>
              This explorer highlights start codons in green and stop codons in
              red so you can see potential open reading frames more easily. By
              scanning along the codon view for ATG followed by long stretches
              without stop codons, you can spot candidate coding regions for
              further analysis in other tools or in class discussions.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              How this tool helps students and educators
            </h3>
            <p>
              All analysis in this DNA Sequence Explorer happens entirely in
              your browser. No sequence data is uploaded or stored on a server,
              making it a safe option for classroom exercises, assignments, or
              personal exploration. You can export the current visualization as
              a PNG for slides or lab reports, and download a CSV codon table
              for use in spreadsheets or downstream coding projects.
            </p>
            <p>
              This tool is ideal for high school biology classes, introductory
              college genetics, or anyone who wants to understand how strings of
              A, C, G, and T map to the language of proteins. It pairs well with
              other science tools in LifeHackToolbox, such as the{" "}
              <a
                href="/periodic-table"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Interactive Periodic Table
              </a>{" "}
              for exploring atomic structure or the{" "}
              <a
                href="/solar-system-simulator"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Solar System Orbit Simulator
              </a>{" "}
              for visualizing planetary motion. All of these tools run locally
              in the browser, require no sign-up, and are designed to support
              modern, visual science education.
            </p>
          </section>
        </article>
      </section>
    </div>
  );
};

export default DnaSequenceExplorerPage;


