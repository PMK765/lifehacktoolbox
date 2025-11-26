import NumberBaseConverterApp from "@/components/NumberBaseConverterApp";

export const metadata = {
  title:
    "Binary, Decimal, Hex, and Octal Converter & Bit Visualizer | LifeHackToolbox",
  description:
    "Convert between binary, decimal, hexadecimal, and octal with an interactive number base converter and bit visualizer. Great for computer science students learning how number systems work."
};

const BinaryDecimalHexConverterPage = () => {
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="number-base-heading"
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1
            id="number-base-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Binary / Decimal / Hex / Octal Converter &amp; Bit Visualizer
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Use this interactive number base converter to move between binary,
            decimal, hexadecimal, and octal, and see how each bit contributes to
            the value. It is designed as a teaching tool for computer science
            students learning how number systems and bits work.
          </p>
        </div>
        <NumberBaseConverterApp />
      </section>
      <section className="space-y-4 border-t border-slate-200 pt-6 text-sm text-slate-800 md:text-base">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Understanding binary, decimal, hex, and octal number systems
        </h2>
        <p>
          Modern computers store and process everything as bits, but people
          still think in decimal most of the time. A good{" "}
          <strong>binary to decimal converter</strong> bridges this gap and
          helps you see how the same integer can be written in different{" "}
          <strong>number bases</strong>. Decimal (base 10) uses digits 0–9;
          binary (base 2) uses just 0 and 1; octal (base 8) uses 0–7; and
          hexadecimal, or hex (base 16), uses 0–9 plus A–F. Each system is just
          a different way to write the same quantity, and understanding their
          relationships is essential for computer science students.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          What is the binary number system?
        </h3>
        <p>
          The <strong>binary number system</strong> is base 2, which means each
          digit represents a power of two instead of a power of ten. The right
          most bit is 2⁰ = 1, the next is 2¹ = 2, then 2² = 4, 2³ = 8, and so
          on. To convert binary to decimal, you add up the place values of all
          the bits that are set to 1. For example, the binary value{" "}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            101010
          </code>{" "}
          is 32 + 8 + 2 = 42 in decimal.
        </p>
        <p>
          The bit visualizer in this tool shows each bit as a small square
          labeled with its power of two. You can see at a glance which bits are
          set and how they combine to produce the total. This makes{" "}
          <strong>decimal to binary</strong> conversions feel less abstract,
          because you can literally see the powers of two lighting up instead
          of just trusting a calculator.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          How hexadecimal and octal relate to binary
        </h3>
        <p>
          Hexadecimal and octal are convenient “shorthand” for binary. In hex,
          each digit corresponds to exactly four bits (a nibble), because 2⁴ =
          16. In octal, each digit corresponds to three bits, because 2³ = 8.
          This is why it is common to group binary digits into chunks of 4 when
          converting to hex, or chunks of 3 when converting to octal. A{" "}
          <strong>hexadecimal to binary</strong> conversion is often just a
          matter of mapping each hex digit to its 4-bit binary equivalent.
        </p>
        <p>
          The converter on this page always shows hex values in uppercase and
          keeps the binary representation padded to your chosen bit width
          (8/16/32 bits). This makes the relationship between groups of 4 bits
          and hex digits very explicit, especially when you experiment with
          quick examples like 255 (all 8 bits set) or 4095 (12 bits set).
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Place values and powers of two
        </h3>
        <p>
          Every positional number system is built on place values. In decimal,
          the columns from right to left are 1, 10, 100, 1000, and so on. In
          binary, the columns are 1, 2, 4, 8, 16, 32, and so forth. In hex, the
          columns are 1, 16, 256, 4096, and so on. The place value table in this{" "}
          <strong>number base converter</strong> shows exactly how each digit
          (whether in binary, decimal, hex, or octal) multiplies a power of its
          base and contributes to the total.
        </p>
        <p>
          For example, in decimal, the value 1234 breaks down into 1×10³ +
          2×10² + 3×10¹ + 4×10⁰. In binary, a value like 101101 becomes 1×2⁵ +
          0×2⁴ + 1×2³ + 1×2² + 0×2¹ + 1×2⁰. Seeing these decompositions written
          out in a table helps reinforce why powers of two, powers of ten, and
          powers of sixteen matter in different contexts—from low-level machine
          code to human-friendly displays.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          How to use this binary, decimal, hex, and octal converter
        </h3>
        <p>
          To use the converter, type a value into any of the four input fields:
          decimal, binary, hexadecimal, or octal. The tool validates the digits
          according to the selected base and updates the other three fields in
          real time whenever the input is valid. This lets you treat it as a{" "}
          <strong>binary to decimal converter</strong>, a{" "}
          <strong>decimal to hex converter</strong>, an{" "}
          <strong>octal to decimal converter</strong>, or any other combination
          without switching modes.
        </p>
        <p>
          Below the inputs, the <strong>bit visualizer</strong> shows the value
          in 8, 16, or 32 bits. You can change the bit width to see how the same
          integer is represented in different-sized registers. Hovering over a
          bit explains which power of two it represents and whether it is
          contributing to the value. Further down, the place value table lets
          you drill into binary, decimal, hex, or octal expansions in more
          detail, which is especially useful when you are first learning
          positional notation.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Why CS students need to know these number bases
        </h3>
        <p>
          Understanding binary, hex, and octal is a core part of computer
          science, systems programming, and hardware design. Memory addresses,
          machine instructions, bitmasks, and many networking values are
          commonly shown in hex. File permissions on Unix systems are specified
          in octal. Binary shows up when you are designing logic gates, working
          with bit-level operations, or analyzing protocol fields.
        </p>
        <p>
          Tools like this converter and <strong>bit visualizer</strong> are
          meant to bridge the gap between abstract theory and concrete values.
          As you work through exercises or debug code, you can keep this page
          open to quickly sanity-check conversions or to understand how a
          specific bit pattern maps to decimal. It pairs nicely with other math
          and CS tools in LifeHackToolbox, such as the{" "}
          <a
            href="/unit-circle-calculator"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Unit Circle Calculator
          </a>{" "}
          for trigonometry, the{" "}
          <a
            href="/unit-converter"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Universal Unit Converter
          </a>{" "}
          for everyday calculations, and the{" "}
          <a
            href="/dna-sequence-explorer"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            DNA Sequence Explorer
          </a>{" "}
          for exploring patterns in biological sequences. Together, these tools
          form a practical, browser-based toolkit for students across math,
          science, and computer science.
        </p>
      </section>
    </div>
  );
};

export default BinaryDecimalHexConverterPage;


