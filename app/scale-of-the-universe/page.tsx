import type { Metadata } from "next";
import ScaleOfUniverseExplorer from "@/components/ScaleOfUniverseExplorer";

export const metadata: Metadata = {
  title: "Scale of the Universe Explorer (Interactive Zoom) | LifeHackToolbox",
  description:
    "Explore the scale of the universe from subatomic sizes to galaxies and the observable universe with a smooth interactive zoom. Search objects, save favorites, use a guided tour, and export a branded PNG info card.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/scale-of-the-universe"
  }
};

const ScaleOfTheUniversePage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Scale of the Universe Explorer (Interactive Zoom)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Zoom across orders of magnitude—from atoms and DNA to planets, galaxies, and the observable
          universe. This tool uses a curated dataset and a log-scale zoom so you can build intuition
          for sizes, units, and comparisons. Everything runs in your browser.
        </p>
      </section>

      <section className="mt-6">
        <ScaleOfUniverseExplorer />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Why scale is hard to intuit (and why log scales help)
        </h2>
        <p>
          The universe spans an extreme range of sizes. A proton is around \(10^{-15}\) meters,
          while the observable universe is around \(10^{26}\) meters across. That’s about 41 orders
          of magnitude. A linear slider can’t represent that range well, so this explorer uses a
          logarithmic (log) scale: each equal step represents a multiplicative change, not an
          additive one.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          From microscopic to cosmic
        </h3>
        <p>
          Use the search to jump directly to objects like DNA, bacteria, a human, Earth, the Sun,
          or the Milky Way. The guided tour provides a curated path across scales, which is often
          the fastest way to build intuition if you’re learning these ideas for the first time.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Units: meters, kilometers, AU, light-years
        </h3>
        <p>
          Small sizes are easiest to read in nanometers and micrometers; human scale is in meters;
          Earth-scale and beyond uses kilometers; solar system distances are commonly expressed in
          astronomical units (AU); and interstellar scales use light-years. This tool switches to
          astronomy-friendly units at large sizes so the numbers stay readable.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Privacy and exports
        </h3>
        <p>
          You can favorite objects and export a branded PNG snapshot of the selected object card.
          Favorites and your last zoom level are stored in localStorage. This tool runs entirely in
          the browser and does not upload your inputs to a server.
        </p>
      </section>
    </main>
  );
};

export default ScaleOfTheUniversePage;


