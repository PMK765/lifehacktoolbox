import type { Metadata } from "next";
import StatisticsExplorer from "@/components/StatisticsExplorer";

export const metadata: Metadata = {
  title: "Statistics Explorer (Mean/Median/Std Dev + Charts) | LifeHackToolbox",
  description:
    "Compute descriptive statistics (mean, median, mode, variance, standard deviation, quartiles, IQR) from pasted numbers or a CSV column. Includes histogram and box plot charts, CSV summary export, and branded PNG reports.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/statistics-explorer"
  }
};

const StatisticsExplorerPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Statistics Explorer (Mean / Median / Std Dev + Charts)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Paste a dataset or upload a CSV and instantly compute core descriptive statistics.
          This tool includes a histogram and a box plot, outlier detection using the IQR rule,
          plus exports for a CSV summary and a branded PNG report. Everything runs in your browser.
        </p>
      </section>

      <section className="mt-6">
        <StatisticsExplorer />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          What this statistics explorer calculates
        </h2>
        <p>
          Descriptive statistics summarize a dataset in a way that is easier to interpret than
          a long list of raw values. This statistics explorer computes the most common summary
          measures used in school, research, and analytics: count, min/max, range, mean, median,
          mode, variance, standard deviation, quartiles, and interquartile range (IQR).
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Mean, median, and mode
        </h3>
        <p>
          The <span className="font-semibold">mean</span> is the arithmetic average. The{" "}
          <span className="font-semibold">median</span> is the middle value when the data is
          sorted and is more robust to extreme values. The <span className="font-semibold">mode</span>{" "}
          is the most frequent value, which can be useful for discrete datasets.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Variance, standard deviation, quartiles, and IQR
        </h3>
        <p>
          The <span className="font-semibold">variance</span> and{" "}
          <span className="font-semibold">standard deviation</span> describe spread around the mean.
          Quartiles split the sorted data into four parts: Q1 (25th percentile), median (50th),
          and Q3 (75th). The IQR is Q3 − Q1 and is a robust measure of spread that focuses on the
          middle half of the data.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Outlier detection (IQR rule)
        </h3>
        <p>
          A common rule of thumb flags values below{" "}
          <span className="font-mono">Q1 − 1.5×IQR</span> or above{" "}
          <span className="font-mono">Q3 + 1.5×IQR</span> as outliers. This is not a definitive
          judgement about correctness; it is a quick way to spot unusually extreme values that
          may deserve a second look.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Charts: histogram and box plot
        </h3>
        <p>
          The histogram shows the distribution across bins, which helps you see skew, clusters,
          and spread. The box plot summarizes quartiles and the median in a compact visual.
          Adjusting the number of bins changes the histogram’s level of detail.
        </p>
        <p>
          This tool runs entirely in the browser and stores your last dataset and settings in
          localStorage for convenience. If you are working with sensitive data, consider clearing
          your browser storage afterward.
        </p>
      </section>
    </main>
  );
};

export default StatisticsExplorerPage;


