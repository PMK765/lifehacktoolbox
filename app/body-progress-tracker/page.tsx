import type { Metadata } from "next";
import Link from "next/link";
import BodyProgressTracker from "@/components/BodyProgressTracker";

export const metadata: Metadata = {
  title:
    "Body Progress Tracker, BMI & Goal Calculator | LifeHackToolbox",
  description:
    "Track your weight and measurements over time, calculate BMI, BMR and TDEE, set weight goals, and visualize your progress with charts. Export your data as CSV or shareable images. 100% free, no login required.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/body-progress-tracker"
  }
};

export default function BodyProgressTrackerPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Body Progress Tracker &amp; BMI Goals
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Log your weight and measurements, track progress toward your target
          weight, and see estimated BMI, BMR, and TDEE. Visualize how things
          change over time with simple charts and exportable summaries.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Your progress data is stored only in this browser using local storage.
          Clearing your browser data or using a different device may remove your
          history. Export a CSV or image periodically to keep a backup.
        </p>
      </section>
      <BodyProgressTracker />
      <section
        aria-label="About tracking body progress"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Track your body progress with BMI, BMR, and TDEE
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Body weight on its own is a blunt tool. What usually matters more is
            how your weight and measurements change over weeks and months, not
            what the scale says on a single day. This tracker lets you record
            weight and key measurements like waist, chest, and hips, so you can
            see real progress even when the scale seems stubborn.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            How BMI fits into the picture
          </h3>
          <p>
            Body mass index (BMI) is a simple ratio of weight and height. It is
            easy to calculate and useful for population-level trends, but it has
            limitations. Very muscular people can show up as &quot;overweight&quot;
            or &quot;obese&quot; even when their body fat is low, and it does
            not consider where body fat is carried. Use BMI here as one signal
            among many, not the final word on your health.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why measurements over time matter more than any single weigh-in
          </h3>
          <p>
            Day-to-day weight can swing because of water, sodium, sleep, and
            digestion. By logging entries regularly and focusing on the overall
            trend, you can see whether you are actually moving toward your goal.
            Waist and other measurements often change before the scale does,
            which can be especially encouraging when you are lifting weights or
            recomposing your body.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            BMR, TDEE, and calorie targets
          </h3>
          <p>
            Your basal metabolic rate (BMR) is an estimate of how many calories
            your body would use at rest for basic functions. Total daily energy
            expenditure (TDEE) adjusts that number for activity level. This tool
            uses standard formulas to estimate BMR and TDEE, then applies your
            goal type and weekly pace to suggest an approximate daily calorie
            target for losing, gaining, or maintaining weight. These are rough
            estimates, not prescriptions, and real-world results depend on
            consistency and individual differences.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Healthy, sustainable progress
          </h3>
          <p>
            Very aggressive weight changes are hard to sustain and can be
            unhealthy. Many people do better with modest, steady changes, such
            as roughly 0.25–0.5 kg (about 0.5–1.0 lb) per week in either
            direction. Use the pace options in this tracker as a guide, but
            always adjust based on your own energy, performance, and feedback
            from your body. This tool is for general information only and is not
            medical advice. If you have health concerns, talk with a doctor or
            registered dietitian.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Privacy and backups
          </h3>
          <p>
            All data in this Body Progress Tracker stays in your browser and is
            never sent to a server. That keeps your information private, but it
            also means it can be lost if you clear browser storage, switch
            devices, or reinstall your browser. Use the CSV and image export
            buttons regularly if you want a long-term record of your progress.
          </p>
          <p>
            If you enjoy tracking workouts alongside your body stats, you can
            pair this with a future{" "}
            <Link
              href="/workout-tracker"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              workout tracker
            </Link>{" "}
            and other tools on{" "}
            <Link
              href="/mortgage-payoff-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              LifeHackToolbox
            </Link>
            . Over time, you might also see new fitness utilities such as a{" "}
            <Link
              href="/one-rep-max-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              one-rep-max calculator
            </Link>{" "}
            or{" "}
            <Link
              href="/fitness-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              general fitness calculator
            </Link>
            , alongside existing finance tools like the{" "}
            <Link
              href="/mortgage-payoff-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Mortgage Payoff &amp; Amortization Calculator
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}


