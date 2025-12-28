import type { Metadata } from "next";
import Link from "next/link";
import WorkoutTracker from "@/components/WorkoutTracker";

export const metadata: Metadata = {
  title: "Workout Tracker & Strength Progress Charts | LifeHackToolbox",
  description:
    "Track your workouts, sets, reps, and weights, visualize strength progress over time, and export your training log as CSV or shareable images. 100% free, no login required.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/workout-tracker"
  }
};

export default function WorkoutTrackerPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Workout Tracker &amp; Progress Charts
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Log your strength and cardio sessions, track sets and reps, and see
          how your lifts progress over time without creating an account. All
          data stays in your browser and can be exported whenever you like.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Your workout history is stored only in this browser using local
          storage. If you clear your browser data or use a different device, the
          history may be lost. Export a CSV regularly if you want a long-term
          backup of your training log.
        </p>
      </section>
      <WorkoutTracker />
      <section
        aria-label="About workout tracking"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Why tracking workouts helps you get stronger
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Strength and fitness changes slowly, and it is easy to forget what
            you did last week or last month. A simple workout log helps you
            apply progressive overload, notice patterns, and avoid repeating the
            same session forever. By writing down sets, reps, and weights, you
            can see that you are actually moving forward even when a single
            workout feels flat.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            From sets and reps to long‑term progress
          </h3>
          <p>
            This tracker lets you record each workout with a date, name, and
            exercises. For strength movements, you can enter sets with reps and
            weight; for cardio, you can log distance and duration. The progress
            charts then combine those entries into trends, using your heaviest
            working set to estimate a one‑rep max (1RM) for each lift. That
            makes it easy to see when your squat or bench press has stalled, and
            when it is quietly climbing in the background.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Estimated 1RM and training volume
          </h3>
          <p>
            The one‑rep max estimate uses the common Epley formula, which
            approximates a max from submaximal sets. It is not perfect, but it
            gives a consistent way to compare sessions: a set of 5 at 100 kg
            shows a higher estimated 1RM than a set of 5 at 95 kg, even if you
            never test an actual single. Volume charts show the total
            weight&nbsp;×&nbsp;reps you accumulate for a chosen exercise in each
            session, which can be helpful for planning deloads or building
            phases.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Local‑only data and simple exports
          </h3>
          <p>
            Unlike many workout apps, this tool does not require an account and
            does not send your data to a server. Everything is stored locally in
            your browser using local storage. That is good for privacy, but it
            also means your log can be lost if you clear your cache, reinstall
            your browser, or switch devices. Use the CSV export to download a
            copy of your training data, and the image export to share a clean
            summary of a workout with a coach, training partner, or group chat.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Make this part of your broader fitness toolkit
          </h3>
          <p>
            Pairing a workout log with basic body metrics can make trends much
            easier to understand. You might track lifts here alongside the{" "}
            <Link
              href="/body-progress-tracker"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Body Progress Tracker &amp; BMI Goals tool
            </Link>{" "}
            or a future{" "}
            <Link
              href="/one-rep-max-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              one‑rep‑max calculator
            </Link>
            . For planning time blocks or rest days, utilities like the{" "}
            <Link
              href="/time-duration-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Time Duration Calculator
            </Link>{" "}
            can help line up your training schedule with work and travel.
          </p>
          <p>
            LifeHackToolbox focuses on small, practical tools like this workout
            tracker that run entirely in your browser. There are no logins, no
            subscriptions, and no hidden syncing. You stay in control of your
            data and decide what to save, export, or share.
          </p>
        </div>
      </section>
    </div>
  );
}


