import PeriodicTableApp from "@/components/PeriodicTableApp";

export const metadata = {
  title: "Interactive Periodic Table | LifeHackToolbox",
  description:
    "A fully interactive periodic table with clickable elements, atomic details, group filters, trends, electron configurations, and educational visualizations. Completely free and runs entirely in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/periodic-table"
  }
};

const PeriodicTablePage = () => {
  return (
    <div className="space-y-10">
      <section aria-labelledby="periodic-table-heading" className="space-y-4">
        <div className="space-y-2">
          <h1
            id="periodic-table-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Interactive Periodic Table
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Explore all 118 elements with category colors, property maps, and a
            detailed slide-out panel for each element. Everything runs locally
            in your browser.
          </p>
        </div>
        <PeriodicTableApp />
      </section>
      <section
        aria-labelledby="periodic-table-education-heading"
        className="space-y-6 border-t border-slate-200 pt-6 text-sm text-slate-800"
      >
        <header className="space-y-2">
          <h2
            id="periodic-table-education-heading"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Learn the periodic table, trends, and electron shells
          </h2>
          <p className="max-w-3xl text-sm text-slate-700">
            This interactive periodic table is designed as a fast study aid and
            reference for chemistry students, teachers, and anyone who wants to
            build intuition for how the elements are organized.
          </p>
        </header>
        <article className="space-y-5">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              What is the periodic table?
            </h3>
            <p>
              The periodic table is a structured map of all known chemical
              elements, arranged by atomic number, electron configuration, and
              recurring chemical properties. Each column (group) and row
              (period) reflects patterns in reactivity, bonding behavior, and
              the way electrons are arranged around the nucleus. Elements in the
              same group share similar chemistry because they have the same
              number of valence electrons, while elements in the same period
              gradually change properties as protons and electrons are added.
            </p>
            <p>
              In this tool, each tile shows the element&apos;s symbol, atomic
              number, approximate atomic mass, and a color-coded category. You
              can hover across the grid to see entire rows and columns light up,
              then click any element to open a detailed panel with melting and
              boiling points, density, electronegativity, ionization energy,
              and a simplified electron-shell diagram. This makes it easier to
              connect the abstract layout of the table with concrete physical
              trends.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Periodic trends: electronegativity, radius, and more
            </h3>
            <p>
              One of the main reasons the periodic table is so powerful is that
              many important atomic properties change smoothly across it. As you
              move from left to right in a period, the effective nuclear charge
              increases, often pulling electrons closer and increasing
              electronegativity and ionization energy. As you move down a group,
              additional electron shells are added, which usually increases
              atomic radius and can reduce ionization energy despite the greater
              nuclear charge.
            </p>
            <p>
              The property map controls in this tool let you recolor the table
              by electronegativity, an atomic-radius proxy, ionization energy,
              or thermal properties like melting and boiling point. Tiles shift
              along a cool-to-warm color gradient so you can see, for example,
              how electronegativity rises toward the top-right of the table, or
              how many metals cluster with higher melting points. Hover states
              and filters make it easier to compare related elements without
              losing the overall context of the table.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Element categories and blocks
            </h3>
            <p>
              The colored backgrounds indicate broad chemical families. Alkali
              metals and alkaline earth metals on the far left are highly
              reactive, forming positive ions easily. Transition metals fill the
              center of the table and often form colored compounds and multiple
              oxidation states. Post-transition metals are generally softer and
              less conductive, while metalloids sit on the staircase between
              metals and nonmetals and often act as semiconductors.
            </p>
            <p>
              On the right side, nonmetals, halogens, and noble gases show a
              very different style of bonding and reactivity, from reactive
              halogens that readily gain electrons to nearly inert noble gases.
              The separate lanthanide and actinide rows at the bottom are the
              f-block elements, which fit between groups 3 and 4 but are pulled
              out to keep the table compact. In this tool, you can toggle each
              category to focus only on the groups that matter for a given
              lesson or problem.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              How electron shells work
            </h3>
            <p>
              Electrons in atoms occupy discrete energy levels, often described
              as shells and subshells. The first shell can hold up to two
              electrons, the second up to eight, the third up to eighteen, and
              so on. Within each shell, electrons fill subshells (s, p, d, f) in
              a specific order that balances energy and electron–electron
              interactions. These arrangements are summarized in the electron
              configuration strings shown for each element in the detail panel.
            </p>
            <p>
              The simplified shell diagrams in this app treat lighter elements
              as electrons on concentric rings around the nucleus. While not a
              full quantum-mechanical picture, it is an intuitive way to see why
              helium is stable with two electrons, why the noble gases have full
              outer shells, and why alkali metals with a single valence electron
              tend to react strongly. Connecting these pictures with the color
              categories and property maps gives a more three-dimensional feel
              for periodic trends than static charts alone.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              How to use this tool as a study aid
            </h3>
            <p>
              You can use this periodic table for quick homework lookups, to
              prepare for quizzes, or to explore trends before exams. Search by
              name, symbol, or atomic number to jump to a specific element,
              toggle category filters to see which groups cluster together, and
              experiment with different property views to understand how
              electronegativity and radius change across the table. The PNG
              export button lets you save a snapshot of the current view,
              complete with group and period labels, for use in slide decks,
              notes, or printed study sheets.
            </p>
            <p>
              If you are building a larger study workflow, this tool pairs well
              with other visual tools in LifeHackToolbox. For example, you can
              use the{" "}
              <a
                href="/solar-system-simulator"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Solar System Orbit Simulator
              </a>{" "}
              to think about planetary-scale patterns, the{" "}
              <a
                href="/weighted-grade-calculator"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Weighted Grade Calculator
              </a>{" "}
              to track your course grades, or the{" "}
              <a
                href="/resume-builder"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Resume Builder
              </a>{" "}
              when you are ready to present your STEM experience. All of these
              tools run entirely in your browser with no sign-up required.
            </p>
          </section>
        </article>
      </section>
    </div>
  );
};

export default PeriodicTablePage;


