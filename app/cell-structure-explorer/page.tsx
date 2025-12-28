import type { Metadata } from "next";
import CellStructureExplorer from "@/components/CellStructureExplorer";

export const metadata: Metadata = {
  title: "Cell Structure Explorer (Interactive Cell Diagram) | LifeHackToolbox",
  description:
    "Learn animal cell organelles with an interactive cell structure diagram, searchable organelle list, and a study-mode quiz. Export a branded PNG of the selected organelle info card. Runs in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/cell-structure-explorer"
  }
};

const CellStructureExplorerPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Cell Structure Explorer (Interactive Cell Diagram)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Explore a beautiful, interactive animal cell diagram. Tap organelles to learn what
          they do, search for terms, and use Study Mode to quiz yourself. Everything runs
          locally in your browser.
        </p>
      </section>

      <section className="mt-6">
        <CellStructureExplorer />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          How to use this cell structure explorer
        </h2>
        <p>
          Cells are the basic units of life. Inside an animal cell, organelles act like
          specialized tools: some store genetic instructions, some produce energy, some
          build proteins, and others package or recycle materials. This interactive cell
          structure explorer helps you learn organelles by combining a labeled visual with
          short explanations and a study quiz.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Tap-to-learn organelles
        </h3>
        <p>
          Tap any organelle in the diagram to highlight it and open a detail card with its
          name, function, a fun fact, and a memory tip. Use the search box if you want to
          jump directly to an organelle like the nucleus, mitochondria, Golgi apparatus,
          rough ER, or lysosome.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Study mode quiz
        </h3>
        <p>
          Study Mode turns the diagram into a quick quiz. The tool asks you to identify
          organelles by name. Your best score is saved in localStorage so you can come back
          later and keep practicing. This is designed to be beginner-friendly and fast.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Exporting a study card
        </h3>
        <p>
          You can export a branded PNG snapshot of the selected organelle’s info card for
          notes, flashcards, or classroom handouts. The export is generated in your browser
          without uploading your data to a server.
        </p>
        <p>
          This tool is educational and the diagram is stylized, not to scale. For deeper
          biology learning, pair this with practice questions and reference diagrams from
          your class materials.
        </p>
      </section>
    </main>
  );
};

export default CellStructureExplorerPage;


