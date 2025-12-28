import type { Metadata } from "next";
import Link from "next/link";
import SolarSystemVisualizer from "@/components/SolarSystemVisualizer";

export const metadata: Metadata = {
  title: "Solar System Orbit Simulator | LifeHackToolbox",
  description:
    "Explore a real-time, interactive map of the solar system. Watch the planets orbit the Sun, tap a planet to see stats like distance, mass, temperature, and more. Fully in-browser and mobile-friendly.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/solar-system-simulator"
  }
};

export default function SolarSystemSimulatorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Solar System Orbit Simulator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Watch a simplified, real-time map of the solar system. The eight
          planets orbit a glowing Sun, and you can tap each one to see its
          distance, year length, temperature, and more.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Everything is rendered in your browser only using approximate orbital
          periods and distances. No external APIs or data collection.
        </p>
      </section>
      <section className="rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 p-4 sm:p-6 shadow-xl">
        <SolarSystemVisualizer />
      </section>
      <section className="mt-4 space-y-4 rounded-lg bg-slate-950 px-4 py-6 text-sm text-slate-100 shadow-sm md:px-6 md:text-base">
        <h2 className="text-xl font-semibold text-slate-50">
          Explore the solar system from your browser
        </h2>
        <p>
          This solar system orbit simulator gives you a bird&apos;s‑eye view of
          the planets circling the Sun. Each world is placed on a simplified,
          circular track with an average distance from the Sun expressed in
          astronomical units (AU), where 1 AU is the mean distance from Earth to
          the Sun—about 150 million kilometers. Inner planets like Mercury and
          Venus trace tight loops, while the gas and ice giants sweep across
          much larger paths that have been compressed so they still fit on your
          screen.
        </p>
        <p>
          Time in the simulation is measured in Earth days and then scaled by a
          speed multiplier. At 1× speed, one second of real time equals one day
          of simulated orbital time; at 10× speed, the planets race ahead ten
          times faster. You can pause the motion to inspect a configuration or
          spin it up to see how quickly Mercury laps the Sun compared with
          distant Neptune, whose long year takes more than 160 Earth years.
        </p>
        <h3 className="text-lg font-semibold text-slate-50">
          Understanding orbits, years, and distances
        </h3>
        <p>
          In reality, planetary orbits are slightly elliptical and tilted
          relative to one another. For clarity this tool treats them as flat,
          circular paths around a common center. The orbital period for each
          planet comes from its true sidereal year, so even if the shapes are
          simplified, the timing relationships are preserved: Venus still takes
          about 225 days to complete a revolution, Jupiter still needs almost 12
          Earth years, and Neptune still crawls along on a 165‑year journey.
        </p>
        <p>
          When you select a planet, the info panel shows its approximate
          distance from the Sun both in AU and kilometers, as well as radius,
          mass, day length, and a rough average temperature. You will notice
          that the inner rocky planets have shorter days and hotter
          environments, while the outer giants are colder but rotate quickly.
          Axial tilt helps explain how extreme a planet&apos;s seasons can be:
          Earth&apos;s 23.4° tilt produces familiar seasons, whereas Uranus is
          tipped by almost 98°, giving it decades‑long periods of sunlight and
          darkness at its poles.
        </p>
        <h3 className="text-lg font-semibold text-slate-50">
          Limitations and what this simulator is (and isn&apos;t)
        </h3>
        <p>
          This visualization is intentionally simplified. It does not model
          gravitational interactions, orbital eccentricity, or precession, and
          it does not use precise astronomical ephemerides. Distances are
          heavily compressed, and planet sizes are exaggerated for visibility.
          The goal is not to predict exact positions on a given date but to
          build intuition about how fast different planets move and how they are
          spaced. For activities like spacecraft navigation, professional
          astronomers rely on far more detailed numerical models.
        </p>
        <p>
          Even with these simplifications, the tool can be a handy visual aid
          for students, teachers, and anyone curious about space. It can support
          classroom discussions about orbital periods, relative scales, or the
          difference between a day and a year on each world. Parents might use
          it alongside books or documentaries to help kids picture where the
          planets sit in relation to each other.
        </p>
        <h3 className="text-lg font-semibold text-slate-50">
          Private, interactive, and part of the LifeHackToolbox
        </h3>
        <p>
          Like the rest of LifeHackToolbox, this simulator runs entirely
          client‑side. It does not fetch remote data or send your interactions
          anywhere; everything from the orbit math to the animation happens in
          your browser. That makes it safe to use in classrooms, on shared
          computers, or offline environments where you want to avoid network
          dependencies.
        </p>
        <p>
          If you enjoy visual, interactive tools, you might also like the{" "}
          <Link
            href="/online-piano-keyboard"
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Online Piano Keyboard
          </Link>{" "}
          for exploring musical scales, or the{" "}
          <Link
            href="/random-meal-generator"
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Random Meal Generator
          </Link>{" "}
          when you need inspiration for dinner. For long‑term habit tracking,
          the{" "}
          <Link
            href="/body-progress-tracker"
            className="font-medium text-cyan-300 hover:text-cyan-200"
          >
            Body Progress Tracker
          </Link>{" "}
          provides charts and exports that stay on your device. All of these
          tools share the same philosophy: useful, focused helpers that load
          quickly, never demand a login, and respect your privacy.
        </p>
      </section>
    </div>
  );
}


