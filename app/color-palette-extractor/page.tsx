import ColorPaletteExtractor from "@/components/ColorPaletteExtractor";

export const metadata = {
  title: "Color Picker & Palette Extractor | LifeHackToolbox",
  description:
    "Upload an image to extract a dominant color palette with HEX, RGB, and HSL values. Click to pick colors, copy codes, and export palettes as PNG or JSON. Everything runs in your browser."
};

const ColorPaletteExtractorPage = () => {
  return (
    <main className="mx-auto max-w-5xl space-y-10 px-4 py-8">
      <section
        aria-labelledby="color-palette-extractor-heading"
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1
            id="color-palette-extractor-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Color Picker &amp; Palette Extractor
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Upload any PNG or JPEG image, extract a dominant color palette, and
            inspect colors in HEX, RGB, and HSL. Click directly on the image to
            sample pixels, copy color values, and export your palette as a
            branded PNG strip or JSON metadata.
          </p>
        </div>
        <ColorPaletteExtractor />
      </section>
      <section className="space-y-4 border-t border-slate-200 pt-6 text-sm text-slate-800 md:text-base">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Extract colors from any image
        </h2>
        <p>
          This <strong>color picker</strong> and{" "}
          <strong>image color extractor</strong> lets you turn any PNG or JPEG
          into a reusable color palette in just a few clicks. Instead of
          guessing colors by eye or manually sampling pixels in a heavyweight
          design tool, you can drop an image onto this page, extract its
          dominant colors, and immediately see their HEX, RGB, and HSL values.
          The extracted palette appears as a grid of swatches so you can compare
          relative hues, saturation, and brightness at a glance.
        </p>
        <p>
          Under the hood, the tool uses a hidden canvas to analyze thousands of
          pixels and cluster them into a set of representative colors. You can
          choose how many colors you want (from 3 to 12), which is perfect for
          everything from minimal branding palettes to richer UI themes. The
          heaviest colors in the image appear first, and each swatch shows its
          approximate frequency so you know which tones dominate the source.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          How to use the color picker
        </h3>
        <p>
          To get started, click the upload field at the top of the tool and
          select a PNG or JPEG image from your device. Once the preview loads,
          the image is drawn onto an off-screen canvas ready for analysis. Use
          the color count slider to choose how many colors you want in your
          palette and click <strong>Extract palette</strong>. Within a moment,
          the tool runs a simple clustering algorithm to identify the dominant
          colors and displays them as clickable swatches.
        </p>
        <p>
          You can click any swatch to make it the active selection, or you can
          click directly on the image preview to pick the exact color of a
          pixel. When you click the image, the tool reads the pixel&apos;s
          color via the canvas and updates the selected swatch, giving you a
          precise <strong>HEX to RGB</strong> and <strong>HEX to HSL</strong>{" "}
          conversion. This makes it easy to grab a specific highlight, a brand
          color, or a subtle background tone that might not be among the most
          common palette entries.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          HEX, RGB, and HSL explained
        </h3>
        <p>
          Designers and developers frequently move between different color
          formats. <strong>HEX</strong> codes like{" "}
          <code className="rounded bg-slate-900 px-1 py-0.5 text-xs">
            #1F2933
          </code>{" "}
          are compact and widely used in CSS, design tools, and style guides.
          <strong> RGB</strong> values such as{" "}
          <code className="rounded bg-slate-900 px-1 py-0.5 text-xs">
            rgb(31, 41, 51)
          </code>{" "}
          make it clear how much red, green, and blue a color contains.{" "}
          <strong>HSL</strong> values like{" "}
          <code className="rounded bg-slate-900 px-1 py-0.5 text-xs">
            hsl(210, 25%, 16%)
          </code>{" "}
          describe a color by its hue, saturation, and lightness, which is
          often more intuitive when building a cohesive palette.
        </p>
        <p>
          In this <strong>color palette generator</strong>, every swatch shows
          all three formats at once. When you select a color, you can copy the
          HEX, RGB, or HSL string with a single click. This is especially useful
          when you are moving between design tools and code—copy HEX values into
          your design system, drop RGB or HSL into your CSS, and keep a text
          snippet of your palette for documentation or collaboration.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Why designers use palette extractors
        </h3>
        <p>
          A high-quality <strong>palette extractor</strong> is a powerful aid
          for branding, UI design, illustration, and data visualization. When
          you find a photograph, painting, or screenshot with colors you love,
          a good tool can reverse engineer that look into a structured set of
          swatches. From there you can identify a primary brand color, pick
          supporting accent tones, and choose neutral grays that complement the
          rest of the palette.
        </p>
        <p>
          Because this image color extractor shows a frequency percentage for
          each swatch, you can quickly see which colors dominate and which are
          better suited as accents. This helps you avoid overusing intense
          highlight colors or accidentally basing your design on a rare pixel
          that doesn&apos;t actually represent the overall feel of the image.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Exporting palettes as PNG and JSON
        </h3>
        <p>
          Once you&apos;re happy with your palette, you can export it in two
          useful ways. The <strong>PNG palette</strong> export creates a
          high-resolution image strip or grid of your colors, wrapped in a
          subtle LifeHackToolbox-branded frame. This is perfect for dropping
          into presentations, mood boards, or documentation. Because the tool
          uses a client-side canvas capture, the PNG is rendered entirely in
          your browser without uploading the original image.
        </p>
        <p>
          The <strong>JSON palette</strong> export is designed for developers
          and power users. The JSON includes metadata such as the number of
          colors, the original image dimensions, generation timestamp, and a
          list of colors with HEX, RGB, HSL, and relative frequency. You can
          use this JSON in your own <strong>color palette generator</strong>,
          design handoff tools, or build custom scripts that synchronize
          palettes across multiple projects.
        </p>
        <h3 className="text-lg font-semibold text-slate-50">
          Privacy: everything runs in your browser
        </h3>
        <p>
          Like all tools in LifeHackToolbox, this{" "}
          <strong>color picker and palette extractor</strong> is 100%{" "}
          client-side. The images you upload never leave your device; they are
          drawn into a hidden canvas solely for pixel analysis and are not sent
          to any server. Preferences such as your preferred number of palette
          colors are stored in your browser&apos;s localStorage so the tool
          remembers your settings without creating an account.
        </p>
        <p>
          If you&apos;re building a workflow around design and development, this
          tool pairs well with other visual and technical helpers in
          LifeHackToolbox. For example, you can combine it with the{" "}
          <a
            href="/unit-circle-calculator"
            className="font-medium text-emerald-400 underline underline-offset-2"
          >
            Unit Circle Calculator
          </a>{" "}
          for trigonometry visualizations, the{" "}
          <a
            href="/binary-decimal-hex-converter"
            className="font-medium text-emerald-400 underline underline-offset-2"
          >
            Binary / Decimal / Hex / Octal Converter
          </a>{" "}
          for working with color values in code, or the{" "}
          <a
            href="/unit-converter"
            className="font-medium text-emerald-400 underline underline-offset-2"
          >
            Universal Unit Converter
          </a>{" "}
          when you need to switch between units while designing. Every tool is
          free, fast, and focused on solving one problem well.
        </p>
      </section>
    </main>
  );
};

export default ColorPaletteExtractorPage;


