import type { Metadata } from "next";
import LifeExpectancyExplorer from "@/components/LifeExpectancyExplorer";

export const metadata: Metadata = {
  title:
    "Life Expectancy Explorer & Remaining Years Calculator | LifeHackToolbox",
  description:
    "Estimate your remaining years of life based on age, sex, country, and lifestyle factors. Explore how smoking, exercise, BMI, and stress affect your life expectancy with interactive charts."
};

const LifeExpectancyExplorerPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Life Expectancy Explorer
        </h1>
        <p className="max-w-2xl text-sm text-slate-700">
          Use this non-medical life expectancy explorer to see how age, sex,
          country, and lifestyle choices can shift your estimated remaining
          years of life. Everything runs in your browser and uses simplified
          population-style models, not medical records.
        </p>
      </section>
      <section className="mt-6">
        <LifeExpectancyExplorer />
      </section>
      <section className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 md:p-7">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          How this life expectancy calculator works
        </h2>
        <p>
          Life expectancy is a statistical concept: it describes the average
          number of years a person in a particular population is expected to
          live, given their current age. It is based on large life tables that
          track how many people, on average, survive from one age to the next.
          Those tables blend many factors together, including changes in public
          health, access to care, accidents, and long-term disease trends. An
          individual person&apos;s outcome can be very different from the
          average, but the averages still offer a useful, big-picture view.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          How life tables estimate remaining years of life
        </h3>
        <p>
          Traditional life tables start with a large group of people at birth
          and then apply age-specific mortality rates to estimate how many are
          likely to be alive at each future age. From that survival curve,
          statisticians can calculate the average remaining years of life at any
          age. For example, someone who has already reached 60 typically has a
          higher remaining life expectancy than &ldquo;life expectancy at
          birth&rdquo; might suggest, because they have already lived through
          earlier, higher-risk years. This tool mimics that idea using simplified
          formulas, so your remaining years do not just equal life expectancy at
          birth minus your current age.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          What factors affect life expectancy?
        </h3>
        <p>
          At the population level, life expectancy varies by sex, country,
          region, and birth cohort. In many countries, women have a higher life
          expectancy than men. Countries with stronger public health systems,
          safer transportation, and lower rates of extreme poverty tend to see
          longer average lifespans. Within each population, lifestyle patterns
          such as smoking, long-term alcohol use, physical activity, body
          weight, stress, and sleep quality are all linked to changes in
          long-term risk. The sliders and dropdowns in this life expectancy
          calculator are meant to approximate those patterns in a simple way.
        </p>
        <p>
          In this tool, lifestyle choices are modeled as small positive or
          negative adjustments to a baseline estimate. A heavy smoking profile
          can reduce estimated remaining years, while high regular exercise and
          good sleep can add a few years relative to the baseline for your age,
          sex, and country. These adjustments are intentionally conservative and
          do not attempt to quantify the full impact of any one habit.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Why your personal risk is different from population averages
        </h3>
        <p>
          Even the best life tables cannot predict what will happen to a single
          person. Real people have unique medical histories, genetic
          predispositions, accidents, illnesses, and life events that are never
          fully captured in population statistics. Two people of the same age
          and lifestyle can have very different health trajectories. This is why
          the results you see here are described as approximate and framed as
          probabilities rather than promises.
        </p>
        <p>
          When you see phrases like &ldquo;probability of reaching age
          90&rdquo; or &ldquo;remaining years of life,&rdquo; they are based on
          the shape of a model survival curve, not on your individual medical
          data. It is normal for real outcomes to land far above or below these
          averages. Use these numbers to develop intuition about trends, not to
          make precise predictions.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Using this life expectancy calculator responsibly
        </h3>
        <p>
          This life expectancy explorer is a{" "}
          <span className="font-semibold">
            non-medical estimator
          </span>{" "}
          built for education and reflection. It can help you understand how
          population-level{" "}
          <span className="font-semibold">
            life expectancy by age
          </span>{" "}
          and{" "}
          <span className="font-semibold">
            health and lifestyle risk factors
          </span>{" "}
          interact, but it cannot diagnose conditions or tell you how long you
          personally will live. If seeing these numbers raises questions or
          worries, the best next step is to talk with a doctor or another
          qualified professional who can look at your full medical history.
        </p>
        <p>
          Like any{" "}
          <span className="font-semibold">
            life expectancy calculator
          </span>
          , this tool has important limits. It uses simple math, does not
          include every disease or treatment, and assumes that your lifestyle
          stays relatively stable over time. Treat the outputs as a starting
          point for thinking about healthy changes, not as a forecast. The most
          productive takeaway is usually not the exact number of remaining years
          of life, but the reminder that better habits today can shift the odds
          in your favor over the long run.
        </p>
      </section>
    </main>
  );
};

export default LifeExpectancyExplorerPage;


