import type { Metadata } from "next";
import ProbabilitySimulator from "@/components/ProbabilitySimulator";

export const metadata: Metadata = {
  title: "Probability Simulator (Coin/Dice/Cards) | LifeHackToolbox",
  description:
    "Simulate probability experiments for coin flips, dice rolls, and card draws. Compare theoretical probability vs simulation, view histograms and convergence, export PNG reports, and download CSV.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/probability-simulator"
  }
};

const ProbabilitySimulatorPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Probability Simulator (Coin / Dice / Cards)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Run simulations for classic probability scenarios and compare the results to the
          theoretical distribution when it’s known. Adjust the number of trials to see
          convergence, export a branded PNG snapshot, or download the outcomes as CSV.
        </p>
      </section>

      <section className="mt-6">
        <ProbabilitySimulator />
      </section>

      <section className="mt-12 space-y-4 text-sm text-slate-800 md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          Why simulate probability?
        </h2>
        <p>
          A probability simulator is a practical way to understand randomness. Many problems
          have clean mathematical formulas, but the intuition behind them can be hard to build
          from symbols alone. By simulating coin flips, dice rolls, or card draws thousands of
          times, you can see patterns emerge and develop a stronger sense of what outcomes are
          common, what outcomes are rare, and how probability behaves as you repeat an experiment.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Theoretical probability vs simulated probability
        </h3>
        <p>
          When an experiment has a known distribution, you can compute theoretical probabilities.
          For example, the number of heads in n fair coin flips follows a binomial distribution.
          The number of hearts in a hand of cards without replacement follows a hypergeometric
          distribution. This tool overlays the theoretical distribution with the simulated
          histogram so you can compare them directly.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Law of large numbers and convergence
        </h3>
        <p>
          One of the most important ideas in probability is the law of large numbers: as the number
          of trials increases, the observed frequency of an outcome tends to get closer to the true
          probability. That does not mean the results become perfectly smooth or predictable; it
          means the average behavior becomes more stable over time. The convergence chart in this
          simulator shows a running estimate for a chosen outcome so you can watch it settle.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Classroom and practical uses
        </h3>
        <p>
          Students can use this probability simulator to verify homework answers, explore “what if”
          questions, and understand distributions like sums of dice rolls. In practice, simulation
          is also used in finance, operations research, engineering, and risk modeling, especially
          when a closed-form solution is hard or when you want to validate assumptions with a model.
        </p>
        <p>
          This tool runs entirely in the browser and does not upload your data to a server. It saves
          your last-used scenario and settings in localStorage for convenience (clearing your browser
          data removes that history).
        </p>
      </section>
    </main>
  );
};

export default ProbabilitySimulatorPage;


