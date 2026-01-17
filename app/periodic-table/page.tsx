import type { Metadata } from "next";
import Link from "next/link";
import PeriodicTableApp from "@/components/PeriodicTableApp";
import { buildFaqPageJsonLd, buildWebApplicationJsonLd } from "@/lib/seoJsonLd";

export const metadata: Metadata = {
  title: "Periodic Table (Interactive): 118 Elements, Trends & Atomic Data | LifeHackToolbox",
  description:
    "Periodic table with 118 clickable elements, trend maps (electronegativity, radius, ionization energy), and fast atomic details. Study chemistry concepts and export a PNG snapshot. Runs in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/periodic-table"
  }
};

const PeriodicTablePage = () => {
  const webAppJsonLd = buildWebApplicationJsonLd({
    name: "Interactive Periodic Table",
    description:
      "Explore all 118 elements with clickable tiles, trend maps, and atomic details. Runs entirely in your browser.",
    url: "https://lifehacktoolbox.com/periodic-table",
    applicationCategory: "EducationalApplication"
  });

  const faqItems = [
    {
      question: "What is the periodic table used for?",
      answer:
        "The periodic table organizes chemical elements by atomic number and groups elements with similar chemical behavior. It helps you predict properties like reactivity, bonding, atomic radius, and electronegativity."
    },
    {
      question: "How do I read a periodic table tile?",
      answer:
        "A typical tile shows atomic number, element symbol, and atomic mass. In this tool you can click a tile to open a detail panel with properties like electronegativity, melting/boiling point, and a simplified electron-shell view."
    },
    {
      question: "What are periodic trends?",
      answer:
        "Periodic trends are patterns in properties across the table, such as electronegativity generally increasing toward the top-right and atomic radius generally increasing down a group. Trend maps make these patterns easier to see at a glance."
    },
    {
      question: "Do noble gases always have zero reactivity?",
      answer:
        "Noble gases are much less reactive than most elements because their valence shells are full, but they are not universally inert. Under certain conditions some noble gases form compounds, especially the heavier ones."
    },
    {
      question: "Does this periodic table upload my data?",
      answer:
        "No. This tool runs entirely in your browser. Your clicks, searches, and filters are not sent to a server."
    }
  ] as const;

  const faqJsonLd = buildFaqPageJsonLd([...faqItems]);

  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
              <Link
                href="/solar-system-simulator"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Solar System Orbit Simulator
              </Link>{" "}
              to think about planetary-scale patterns, the{" "}
              <Link
                href="/weighted-grade-calculator"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Weighted Grade Calculator
              </Link>{" "}
              to track your course grades, or the{" "}
              <Link
                href="/resume-builder"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Resume Builder
              </Link>{" "}
              when you are ready to present your STEM experience. All of these
              tools run entirely in your browser with no sign-up required.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Related tools
            </h3>
            <p>
              If you are studying science or building a quick reference set, these tools pair well with the periodic table:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                <Link href="/molecular-weight-calculator" className="font-medium text-emerald-700 underline underline-offset-2">
                  Molecular Weight (Molar Mass) Calculator
                </Link>
              </li>
              <li>
                <Link href="/unit-converter" className="font-medium text-emerald-700 underline underline-offset-2">
                  Universal Unit Converter
                </Link>
              </li>
              <li>
                <Link href="/statistics-explorer" className="font-medium text-emerald-700 underline underline-offset-2">
                  Statistics Explorer
                </Link>
              </li>
              <li>
                <Link href="/dna-sequence-explorer" className="font-medium text-emerald-700 underline underline-offset-2">
                  DNA Sequence Explorer
                </Link>
              </li>
            </ul>
          </section>
          <section className="space-y-3">
            <h2 className="text-xl font-semibold tracking-tight text-slate-900">
              Periodic table FAQ
            </h2>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-slate-900">
                What is the periodic table used for?
              </h3>
              <p>
                The periodic table is used to organize chemical elements and predict how they behave. Because elements are arranged by atomic number and electron structure, patterns emerge in reactivity, bonding, and properties like atomic radius and electronegativity.
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                What information is on each element tile?
              </h3>
              <p>
                Each tile shows the atomic number, symbol, and approximate atomic mass. Clicking opens a detail view with additional properties and a simplified electron-shell visualization so you can connect the table layout to atomic structure.
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Why do elements in the same group behave similarly?
              </h3>
              <p>
                Elements in the same group share a similar valence electron pattern, which strongly influences bonding and reactivity. That is why alkali metals are broadly reactive and noble gases are broadly stable compared to neighboring groups.
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Are the property values exact?
              </h3>
              <p>
                Many properties (like atomic mass) are reported as standard values that can be rounded depending on reference. For homework and study, small differences are normal; when you need high-precision reference data, check your course or lab’s preferred source.
              </p>
              <h3 className="text-lg font-semibold text-slate-900">
                Does this tool run offline?
              </h3>
              <p>
                Once loaded, the interactive periodic table works without sending your inputs to a server. Your browser still needs to load the page and assets, but element exploration and filtering are performed locally.
              </p>
            </div>
          </section>
        </article>
      </section>
    </div>
  );
};

export default PeriodicTablePage;


