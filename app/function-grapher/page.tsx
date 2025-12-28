import type { Metadata } from "next";
import FunctionGrapher from "@/components/FunctionGrapher";

export const metadata: Metadata = {
  title: "Function Grapher (Interactive Graphing Calculator) | LifeHackToolbox",
  description:
    "Graph math functions like x^2, sin(x), and log(x) with an interactive function grapher. Pan, zoom, find intercepts, export PNG graphs, and share links. Runs entirely in your browser.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/function-grapher"
  }
};

const FunctionGrapherPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Function Grapher (Interactive Graphing Calculator)
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Type a function of x and explore it visually. This graphing calculator supports
          common expressions, shows intercepts and a value table, lets you pan and zoom,
          and can export a branded PNG or a shareable link. Everything runs locally in
          your browser.
        </p>
      </section>
      <section className="mt-6">
        <FunctionGrapher />
      </section>
      <section className="mt-12 space-y-4 text-slate-800 text-sm md:text-base">
        <h2 className="text-lg font-semibold tracking-tight text-slate-900">
          How to use this function grapher
        </h2>
        <p>
          A function grapher is a visual way to understand how a mathematical rule turns
          an input value x into an output value f(x). Instead of calculating one value at
          a time, you see the entire relationship as a curve. This is helpful for spotting
          patterns like growth, symmetry, curvature, periodic motion, and where a function
          crosses important reference lines.
        </p>
        <p>
          To get started, enter an expression like{" "}
          <span className="font-mono">x^2</span>,{" "}
          <span className="font-mono">2x+3</span>,{" "}
          <span className="font-mono">sin(x)</span>, or{" "}
          <span className="font-mono">log(x)</span>. You can then drag to pan and use your
          scroll wheel or trackpad to zoom in on interesting regions. The viewport controls
          let you set the domain (x min/max) and range (y min/max) directly if you want a
          precise window.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Intercepts and sample values
        </h3>
        <p>
          Two especially useful features when studying a graph are intercepts and tables.
          The <span className="font-semibold">y-intercept</span> is the value at x = 0,
          written as f(0). The <span className="font-semibold">x-intercepts</span> are the
          points where f(x) = 0, meaning the curve crosses the x-axis. This tool estimates
          intercepts numerically, which is fast and practical for many functions, even when
          solving the equation by hand would be tedious.
        </p>
        <p>
          The included table of values shows sample x points across your current domain and
          the corresponding f(x). This helps you sanity-check the shape of the curve and
          connect the picture back to specific numbers. If you see discontinuities or very
          steep behavior, zoom in and adjust the viewport to get a clearer view.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Degrees vs radians for trig graphs
        </h3>
        <p>
          Trigonometric functions like sin(x), cos(x), and tan(x) can be interpreted using
          degrees or radians. In most math classes beyond basic geometry, radians are the
          default because they make calculus and periodic reasoning cleaner. In many real
          world contexts, degrees are more intuitive. This function grapher includes a
          toggle so you can match the convention you need and avoid confusing a 90° input
          with a 90-radian input.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Sharing and exporting graphs
        </h3>
        <p>
          You can copy a link that encodes the current function, viewport, and trig mode so
          someone else can open the same graph instantly. You can also export a PNG snapshot
          that includes subtle LifeHackToolbox branding at the top and bottom. Both options
          are helpful for homework, lesson notes, and quick explanations with screenshots.
        </p>
        <p>
          This is an educational tool that runs entirely in the browser. It does not upload
          your inputs to a server, and it is designed to be fast and usable on both mobile
          and desktop. If you want to keep exploring, you can also try the{" "}
          <a
            href="/unit-circle-calculator"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Unit Circle Calculator
          </a>{" "}
          or the{" "}
          <a
            href="/binary-decimal-hex-converter"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Number Base Converter
          </a>
          .
        </p>
      </section>
    </main>
  );
};

export default FunctionGrapherPage;


