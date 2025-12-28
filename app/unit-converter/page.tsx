import UnitConverterApp from "@/components/UnitConverterApp";

export const metadata = {
  title: "Unit Converter | LifeHackToolbox",
  description:
    "Convert between units of length, weight, volume, energy, temperature, speed, area, pressure, data storage, and number bases with a fast, mobile-friendly unit converter. All in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/unit-converter"
  }
};

const UnitConverterPage = () => {
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="unit-converter-heading"
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1
            id="unit-converter-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Universal Unit Converter
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Quickly convert between units of length, weight, volume, energy,
            temperature, speed, area, pressure, data storage, and number
            bases in a clean, mobile-friendly interface.
          </p>
        </div>
        <UnitConverterApp />
      </section>
      <section
        aria-labelledby="unit-converter-education-heading"
        className="space-y-6 border-t border-slate-200 pt-6 text-sm text-slate-800"
      >
        <header className="space-y-2">
          <h2
            id="unit-converter-education-heading"
            className="text-xl font-semibold tracking-tight text-slate-900"
          >
            Why a good unit converter matters
          </h2>
          <p className="max-w-3xl text-sm text-slate-700">
            Units show up everywhere: in recipes, DIY projects, homework, lab
            reports, engineering specs, and software. A good unit converter
            should feel instant, be easy to use on a phone or laptop, and
            cover the most common categories without forcing you through
            complex menus or ads. This Universal Unit Converter is designed
            to be that everyday tool—fast, focused, and fully client-side.
          </p>
        </header>
        <article className="space-y-5">
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Supported categories and common conversions
            </h3>
            <p>
              The converter organizes units into clear categories so you can
              jump directly to what you need.{" "}
              <strong>Length</strong> covers meters, kilometers, centimeters,
              inches, feet, yards, and miles, so you can switch between
              metric and imperial without thinking about factors of 2.54 or
              1.609. <strong>Weight</strong> includes grams, kilograms,
              pounds, ounces, and metric tons, which is useful for cooking,
              shipping, and fitness tracking.
            </p>
            <p>
              <strong>Volume</strong> lets you convert between liters,
              milliliters, US gallons, cups, tablespoons, and teaspoons,
              making it easy to adapt recipes from one measurement system to
              another. <strong>Speed</strong> supports meters per second,
              kilometers per hour, miles per hour, and knots for everything
              from browser-based physics problems to real-world driving and
              aviation examples. <strong>Area</strong> and{" "}
              <strong>pressure</strong> include square meters, acres,
              hectares, psi, bar, kilopascals, and atmospheres—handy in
              engineering, environmental science, or tire and fluid
              calculations.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              How temperature conversion works
            </h3>
            <p>
              Temperature is one of the most commonly converted quantities,
              and it is also one of the easiest to get slightly wrong in your
              head. This converter treats Celsius, Fahrenheit, and Kelvin
              using their proper formulas instead of simple scale factors.
              That means it correctly handles the offset between Celsius and
              Fahrenheit (the +32 step) and the absolute-zero offset between
              Celsius and Kelvin (+273.15).
            </p>
            <p>
              Under the hood, the tool converts any temperature to Celsius
              as a neutral “base,” then converts from Celsius to your target
              unit. This matches how many textbooks define the relationships
              between scales and makes it easy to reason about. In the
              interface, you simply choose your source and target units,
              type a value, and read the result—no mental algebra required.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Data unit conversions: bytes, KB, MB, GB, TB
            </h3>
            <p>
              Data storage can be confusing because many systems mix decimal
              (10³) and binary (2¹⁰) prefixes. A “kilobyte” might mean
              1,000 bytes or 1,024 bytes depending on context, and the same
              applies to megabytes and gigabytes. This converter supports
              both decimal units (kB, MB, GB, TB) and binary units (KiB, MiB,
              GiB) so you can see both views at once.
            </p>
            <p>
              When planning backups, estimating download times, or
              interpreting disk usage reports, this distinction matters. By
              converting your value to a canonical byte representation first,
              then showing it in all the other units, the tool helps you
              understand how a single file size or storage quota looks across
              the different naming schemes used by operating systems and
              vendors.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Number base conversions: binary, decimal, hex
            </h3>
            <p>
              Programmers, electronics students, and anyone working close to
              hardware often switch between <strong>binary</strong>,
              <strong> octal</strong>, <strong>decimal</strong>, and{" "}
              <strong>hexadecimal</strong> representations of the same value.
              This converter includes a dedicated “Number bases” category
              that parses your input in one base and formats it in another.
              For example, you can paste a hex value like{" "}
              <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
                FF
              </code>{" "}
              and instantly see its decimal and binary equivalents.
            </p>
            <p>
              The tool validates digits based on the chosen base, so binary
              input accepts only 0s and 1s, octal accepts 0–7, decimal
              accepts 0–9, and hex allows 0–9 and A–F. This reduces subtle
              mistakes and makes it a handy teaching aid in computer science
              or digital logic classes. You can also save favorite base
              pairs—like binary ↔ hex—to jump into common conversions
              quickly.
            </p>
          </section>
          <section className="space-y-2">
            <h3 className="text-lg font-semibold text-slate-900">
              Privacy and offline behavior
            </h3>
            <p>
              Like other tools in LifeHackToolbox, this converter runs
              entirely in your browser. Values never leave your device, so
              you can safely paste sensitive measurements, lab results, or
              internal numbers without worrying about uploads or tracking.
              Basic preferences such as favorite unit pairs are stored in
              your browser&apos;s local storage to keep the experience
              snappy, even if your connection is slow or temporarily offline.
            </p>
            <p>
              If you are building a workflow around this, you might pair it
              with other calculators and helpers in the toolkit. For
              example, you can use the{" "}
              <a
                href="/time-duration-calculator"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Time Duration Calculator
              </a>{" "}
              for scheduling and elapsed-time problems, the{" "}
              <a
                href="/periodic-table"
                className="font-medium text-emerald-700 underline underline-offset-2"
              >
                Interactive Periodic Table
              </a>{" "}
              for chemistry work, or other finance and math tools as they are
              added. All of them share the same principles: no sign-up, no
              server-side storage, and a focus on fast, focused everyday
              problem solving.
            </p>
          </section>
        </article>
      </section>
    </div>
  );
};

export default UnitConverterPage;


