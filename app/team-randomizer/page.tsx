import type { Metadata } from "next";
import Link from "next/link";
import TeamRandomizer from "@/components/TeamRandomizer";

export const metadata: Metadata = {
  title: "Team Randomizer | LifeHackToolbox",
  description:
    "Create random teams for classes, sports, and group activities. Paste a list of names, choose the number of teams or team size, and instantly generate fair, random teams.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/team-randomizer"
  }
};

export default function TeamRandomizerPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Team Randomizer
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Paste a list of names, choose whether you want a fixed number of teams or a
          target team size, and let the tool build random teams for you. Great for
          classrooms, sports practices, tabletop games, and any situation where you want
          quick, reasonably fair teams without overthinking it.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Presets are stored locally in your browser only. They never leave this device and
          may be cleared if you reset site data.
        </p>
      </section>
      <TeamRandomizer />
      <section
        aria-label="How to use the team randomizer"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Where a random team generator is useful
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Random teams show up everywhere: splitting a classroom into groups for a
            project, running drills at practice, setting up balanced sides for a tabletop
            game, or breaking a workshop audience into smaller circles. Doing it manually
            often means you gravitate toward familiar patterns or accidentally favor the
            same people. A simple randomizer lets you move fast while avoiding some of that
            bias.
          </p>
          <p>
            For teachers, this tool works well with class rosters that change slightly each
            term. Save a preset per class, then re-roll teams whenever you need fresh
            groupings. Coaches can paste a roster, choose an appropriate number of teams
            for a drill, and quickly adjust the configuration as attendance shifts.
            Facilitators and game hosts can use team size mode to keep tables roughly
            balanced without micromanaging headcounts.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why randomization can make things feel fairer
          </h3>
          <p>
            When a person hand-picks teams, even with the best intentions, people notice
            patterns: friends end up together, strong players cluster, or the same few
            students get paired repeatedly. Letting a neutral randomizer assign teams
            reduces the sense that the organizer is playing favorites. If someone does not
            like the outcome, you can simply re-roll and blame the algorithm instead of
            your judgment.
          </p>
          <p>
            Of course, pure randomness is not always perfect. It might stack several strong
            or weak players on the same side by chance. In those cases, you can take the
            generated teams as a starting point and make one or two manual swaps to smooth
            out obvious imbalances while still keeping the overall process quick and
            transparent.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Tips for naming teams and balancing skill levels
          </h3>
          <p>
            Simple team labels like “Team 1” and “Team 2” work, but adding playful names
            can make activities feel less serious and more collaborative. You can read the
            randomized list and then assign color names, animals, or game-themed labels on
            the spot. If you need to worry about skill levels, one common approach is to
            manually rank a few anchor participants and then run the randomizer on the
            remaining names so each team starts with at least one experienced player.
          </p>
          <p>
            The re-roll button is helpful for avoiding obviously lopsided groupings.
            Generate a set of teams, glance at them, and if the distribution feels off,
            re-roll once or twice until you hit something that passes the eye test. Because
            re-rolls are cheap, you get a mix of fairness and speed without over-optimizing
            in advance.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Presets live only in your browser
          </h3>
          <p>
            Presets are stored with your browser&apos;s local storage, which means they are
            fast and private but also device-specific. Save a preset for each class, team,
            or recurring group you run, and you can re-use them every time you visit this
            page from the same browser. If you clear cookies or use a different device,
            you will need to recreate those presets.
          </p>
          <p>
            If you like how this tool cuts down on repetitive admin work, you may also
            appreciate other quick decision helpers on{" "}
            <Link
              href="/"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              LifeHackToolbox
            </Link>
            , such as the{" "}
            <Link
              href="/random-meal-generator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Random Meal Generator
            </Link>{" "}
            for deciding what to eat or the{" "}
            <Link
              href="/paint-coverage-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Paint Coverage Calculator
            </Link>{" "}
            for planning home projects.
          </p>
          <p className="text-xs text-slate-600">
            This tool does not send your names or presets anywhere; everything runs in your
            browser. If you are working with sensitive lists, you can clear presets at any
            time by deleting them from the presets list or clearing your browser data.
          </p>
        </div>
      </section>
    </div>
  );
}


