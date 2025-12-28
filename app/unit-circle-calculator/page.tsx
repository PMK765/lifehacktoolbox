import UnitCircleExplorer from "@/components/UnitCircleExplorer";

export const metadata = {
  title: "Unit Circle Calculator & Trig Explorer | LifeHackToolbox",
  description:
    "Use this interactive unit circle calculator to explore angles in degrees and radians, and see sine, cosine, and tangent values with exact trig ratios. Perfect for trigonometry students.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/unit-circle-calculator"
  }
};

const UnitCircleCalculatorPage = () => {
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="unit-circle-heading"
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1
            id="unit-circle-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Unit Circle Calculator &amp; Interactive Trig Explorer
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Drag the point around the unit circle, switch between degrees and
            radians, and read off sine, cosine, and tangent values. This unit
            circle calculator is built for trigonometry students who want a
            fast, visual reference.
          </p>
        </div>
        <UnitCircleExplorer />
      </section>
      <section className="space-y-4 border-t border-slate-200 pt-6 text-sm text-slate-800 md:text-base">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Understanding the unit circle in trigonometry
        </h2>
        <p>
          The <strong>unit circle</strong> is a circle of radius 1 centered at
          the origin of the coordinate plane. It is one of the most important
          tools in trigonometry because every point on the unit circle
          corresponds to an angle and a pair of coordinates{" "}
          <strong>(cos θ, sin θ)</strong>. Instead of memorizing disconnected
          formulas, trigonometry students can use the unit circle as a single
          visual map that ties together angles, triangle side ratios, and the
          graphs of sine, cosine, and tangent.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Angles in degrees and radians
        </h3>
        <p>
          Angles on the unit circle can be measured in{" "}
          <strong>degrees</strong> or <strong>radians</strong>. One full
          revolution around the circle is 360°, which corresponds to 2π
          radians. That means 180° equals π radians, 90° equals π/2, and so on.
          A good <strong>unit circle calculator</strong> should make it easy to
          switch between these units without doing the fraction work manually.
          In this tool, you can toggle between degree and radian input, and the
          display automatically shows both decimal radians and a nice multiple
          of π for common angles.
        </p>
        <p>
          For example, when you set the angle to 30°, the calculator also shows
          π/6. At 45° you will see π/4, at 60° you see π/3, and at 90° you see
          π/2. Seeing these relationships on the unit circle helps reinforce
          why radians are often more natural than degrees in calculus and
          higher-level math, even though degrees can feel more intuitive at
          first.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Sine, cosine, and tangent on the unit circle
        </h3>
        <p>
          On the unit circle, every angle θ corresponds to a point (x, y) where
          x = cos θ and y = sin θ. This means the x-coordinate gives you the
          cosine, the y-coordinate gives you the sine, and the tangent tan θ =
          sin θ / cos θ whenever cos θ is not zero. Instead of thinking of sine
          and cosine only as ratios of sides in a right triangle, the unit
          circle lets you see them as coordinates on a circle that wraps around
          through all four quadrants.
        </p>
        <p>
          In this <strong>unit circle calculator</strong>, the draggable point
          shows exactly where (cos θ, sin θ) lives on the circle. The right
          triangle under the point represents the adjacent and opposite sides,
          and the value cards below the diagram show both decimal and exact
          trig ratios where possible. This makes it clear how{" "}
          <strong>sine, cosine, and tangent</strong> behave as you move through
          quadrants and how signs change depending on the direction from the
          origin.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Common unit circle angles and exact trig values
        </h3>
        <p>
          Many trigonometry problems focus on a standard set of angles:
          0°, 30°, 45°, 60°, 90°, and their reflections in other quadrants
          (120°, 135°, 150°, 210°, 225°, 240°, 300°, 315°, 330°, and 360°). At
          these angles, <strong>trig values</strong> have neat exact forms like
          1/2, √2/2, and √3/2. Memorizing these values is a common requirement
          in precalculus courses because they reappear in everything from
          triangle problems to limits in calculus.
        </p>
        <p>
          The reference table in this tool lists those common angles along with
          their exact sine, cosine, and tangent values. You can use it as a
          unit circle reference when doing homework or exams, or as a way to
          test how well you have internalized the patterns. The “snap to
          nearest common angle” option makes it easy to land exactly on those
          key angles while dragging around the circle.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          How to use this unit circle calculator
        </h3>
        <p>
          Start by selecting an angle using the quick buttons (like 30°, 45°,
          or 60°) or by dragging the point around the unit circle itself. The
          numeric readout shows the angle in degrees, radians, and as a multiple
          of π when appropriate. Below that, you will see the coordinates on
          the unit circle, followed by <strong>sin θ</strong>,{" "}
          <strong>cos θ</strong>, and <strong>tan θ</strong> expressed both as
          decimals and exact trig ratios where possible.
        </p>
        <p>
          You can switch the input mode between degrees and radians to match
          whatever your textbook or exam is using. Trigonometry students can
          keep this page open while working through practice problems, using it
          as a “live” <strong>trigonometry reference</strong> instead of a
          static chart. Teachers can use the draggable point on a projector to
          demonstrate how sine and cosine vary as you move through the unit
          circle.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Why the unit circle is important for precalculus and calculus
        </h3>
        <p>
          The unit circle is more than just a memorization task—it is the
          foundation for understanding periodic motion, wave behavior, complex
          numbers, and many calculus concepts. Once you know how to read{" "}
          <strong>sine, cosine, and tangent</strong> off the circle, you can
          better understand graph shapes, phase shifts, and the meaning of
          trig identities such as sin²θ + cos²θ = 1. Later, in calculus, the
          unit circle underlies key results like the derivatives of sin θ and
          cos θ and the behavior of trig limits.
        </p>
        <p>
          This unit circle calculator is designed to stay useful well beyond
          the first time you learn trigonometry. You can revisit it when
          studying for standardized tests, reviewing for a calculus course, or
          working through physics and engineering problems. It pairs well with
          other visual tools in LifeHackToolbox, such as the{" "}
          <a
            href="/periodic-table"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Interactive Periodic Table
          </a>
          , the{" "}
          <a
            href="/dna-sequence-explorer"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            DNA Sequence Explorer
          </a>
          , and the{" "}
          <a
            href="/unit-converter"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Universal Unit Converter
          </a>
          , creating a small but powerful set of interactive references for
          science and math students.
        </p>
      </section>
    </div>
  );
};

export default UnitCircleCalculatorPage;


