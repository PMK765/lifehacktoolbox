import type { Metadata } from "next";
import BabyGeneticPredictorApp from "./components/BabyGeneticPredictorApp";

const title = "Baby Genetic Predictor | LifeHackToolbox";
const description =
  "Predict your baby’s height, eye color, and hair color using science-based probabilistic models. Beautiful visualizations, charts, and phenotype percentages. Fast, free, and fully client-side.";

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL("https://lifehacktoolbox.com"),
  alternates: {
    canonical: "https://lifehacktoolbox.com/baby-genetic-predictor"
  },
  openGraph: {
    title,
    description,
    url: "https://lifehacktoolbox.com/baby-genetic-predictor",
    siteName: "LifeHackToolbox",
    type: "website"
  },
  keywords: [
    "baby height predictor",
    "eye color calculator",
    "hair color genetics",
    "child phenotype prediction",
    "genetic trait probability",
    "baby eye color predictor",
    "baby hair color predictor",
    "baby genetics calculator"
  ]
};

const BabyGeneticPredictorPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-4">
        <BabyGeneticPredictorApp />
      </section>
      <section className="mt-12 space-y-4 text-slate-300 text-sm md:text-base rounded-2xl border border-slate-800 bg-slate-950 p-6">
        <h2 className="text-lg font-semibold text-slate-50">
          How the Baby Genetic Predictor estimates traits
        </h2>
        <p>
          This baby genetic predictor is designed to be an educational way to explore
          how probabilities show up in common traits like adult height, eye color, and
          hair color. It does not read DNA, it does not know your family tree, and it
          cannot account for medical history or ancestry in the way a real genetic test
          might. Instead, it combines a few well-known population-style models into one
          clear interface so you can see approximate outcomes and how sensitive they
          are to different parent traits.
        </p>
        <h3 className="text-base font-semibold text-slate-50">
          Height prediction: mid-parental height + natural variation
        </h3>
        <p>
          For height, the tool uses the classic mid-parental height formula, which is a
          rough method often used to estimate a child’s adult height from parent heights.
          Real outcomes vary widely because height is polygenic (influenced by many
          genes) and also shaped by environment, nutrition, and health over childhood.
          To reflect that uncertainty, the tool shows a likely range around the estimate
          and visualizes a simple probability distribution rather than one “exact” number.
        </p>
        <h3 className="text-base font-semibold text-slate-50">
          Eye and hair color: probability charts, not Mendelian certainty
        </h3>
        <p>
          Eye color and hair color are not single-gene traits in the way simple classroom
          genetics examples sometimes imply. Multiple genes interact, and different
          populations have different baseline frequencies. For that reason, this tool
          uses counselor-style probability tables as an approximation. The donut chart
          for eye color and the percentage bars for hair color are meant to communicate
          relative likelihoods, not guarantees.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <span className="font-semibold text-slate-100">Eye color calculator:</span>{" "}
            estimates probabilities for brown, hazel, green, blue, and gray outcomes based
            on common parent-pair charts.
          </li>
          <li>
            <span className="font-semibold text-slate-100">Hair color genetics:</span>{" "}
            uses simplified dominance patterns and a recessive-style red hair model to
            estimate black, brown, blonde, and red outcomes.
          </li>
        </ul>
        <h3 className="text-base font-semibold text-slate-50">
          Privacy: your inputs stay on your device
        </h3>
        <p>
          Like the rest of LifeHackToolbox, this calculator runs entirely in the browser.
          There is no login, no account, and no server upload of the values you enter.
          That means you can explore different combinations privately, export an image if
          you want to share results, and then close the page without leaving data behind
          on a backend.
        </p>
        <p>
          If you want to keep exploring family and growth tools, you can also try the{" "}
          <a
            href="/baby-name-generator"
            className="font-medium text-emerald-300 underline underline-offset-2"
          >
            Baby Name Generator
          </a>{" "}
          or the{" "}
          <a
            href="/baby-kick-counter"
            className="font-medium text-emerald-300 underline underline-offset-2"
          >
            Baby Kick Counter
          </a>
          .
        </p>
      </section>
    </main>
  );
};

export default BabyGeneticPredictorPage;


