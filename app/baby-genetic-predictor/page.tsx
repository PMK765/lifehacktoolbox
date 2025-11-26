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
    canonical: "/baby-genetic-predictor"
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
    </main>
  );
};

export default BabyGeneticPredictorPage;


