import type { Metadata } from "next";
import Link from "next/link";
import BabyNameGenerator from "@/components/BabyNameGenerator";

export const metadata: Metadata = {
  title: "Baby Name Generator by Origin & Meaning | LifeHackToolbox",
  description:
    "Discover boy, girl, and gender-neutral baby names by origin and meaning. Filter by country or region, search meanings, and randomize first and middle names with your last name.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/baby-name-generator"
  }
};

export default function BabyNameGeneratorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Baby Name Generator &amp; Meaning Finder
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Browse boy, girl, and neutral baby names, filter by origin and
          meaning, and randomize first and middle names to see how they look
          with your last name.
        </p>
      </section>
      <BabyNameGenerator />
      <section
        aria-label="How to choose baby names"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Explore baby names by origin, meaning, and full-name flow
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Choosing a baby name is part meaning, part sound, and part family
            story. Some parents start with the meaning they want—names related
            to strength, light, peace, or nature—while others look for names
            that honor relatives or reflect cultural roots. This generator lets
            you browse boy, girl, and gender‑neutral names across regions and
            quickly see how different combinations feel with your last name.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Look beyond a single first name
          </h3>
          <p>
            A name rarely stands alone. The first name you fall in love with may
            sound very different when paired with a specific middle and last
            name. By randomizing or selecting first and middle names and viewing
            the full combination together, you can hear the rhythm and see
            whether initials or nicknames feel right. Saving your favorite
            combinations makes it easy to compare a short list over time instead
            of starting from scratch in each discussion.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Gendered and neutral names
          </h3>
          <p>
            Names in this tool are tagged as boy, girl, neutral, or overlapping
            (boy/girl). The tabs at the top let you narrow your search or see
            everything at once. Many names are used across genders in different
            countries or time periods, so you might find something in the
            &quot;neutral&quot; or &quot;boy/girl&quot; categories that matches
            your style even if you started with a specific label in mind.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Filter by region to surface cultural roots
          </h3>
          <p>
            Filtering by region or country code can help you discover names from
            particular cultures—whether you want to honor ancestry, match
            siblings, or simply explore sounds from another part of the world.
            Regions such as Western Europe, South Asia, East Asia, and
            Sub‑Saharan Africa group names broadly without getting bogged down
            in long country lists. As the dataset grows, you can expect more
            representation from each area.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Keep your search private and flexible
          </h3>
          <p>
            All filtering and randomization happens directly in your browser;
            nothing is sent to a server. Your saved combinations and filters are
            stored using local storage on your device so they are easy to return
            to later, but they can be cleared if you wipe browser data or move
            to another device. That makes this tool handy for brainstorming and
            discussion without turning your name search into another account or
            online profile.
          </p>
          <p>
            For other family‑oriented tools, you can use the{" "}
            <Link
              href="/baby-kick-counter"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Baby Kick Counter
            </Link>{" "}
            to track movement late in pregnancy or the{" "}
            <Link
              href="/how-long-to-freeze"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              How Long to Freeze? calculator
            </Link>{" "}
            for planning freezer meals. When life gets busy, tools like the{" "}
            <Link
              href="/random-meal-generator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Random Meal Generator
            </Link>{" "}
            on LifeHackToolbox can help with everyday decisions while you focus
            on bigger ones—like picking the right name.
          </p>
        </div>
      </section>
    </div>
  );
}


