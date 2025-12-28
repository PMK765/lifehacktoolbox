export type HomeToolEntry = {
  href: string;
  title: string;
  description: string;
  category: string;
};

export const HOME_TOOL_INDEX: HomeToolEntry[] = [
  {
    href: "/function-grapher",
    title: "Function Grapher (Interactive)",
    description:
      "Graph functions like x^2 and sin(x) with pan/zoom, intercepts, a value table, shareable links, and PNG export.",
    category: "Math & converters"
  },
  {
    href: "/matrix-calculator",
    title: "Matrix Calculator & Visualizer",
    description:
      "Matrix multiplication, transpose, determinant, inverse, and solving Ax=b with keyboard-friendly editing plus JSON/CSV export.",
    category: "Math & converters"
  },
  {
    href: "/probability-simulator",
    title: "Probability Simulator (Coin/Dice/Cards)",
    description:
      "Compare theoretical probability vs simulation with histograms and convergence charts, plus CSV export and branded PNG snapshots.",
    category: "Math & converters"
  },
  {
    href: "/statistics-explorer",
    title: "Statistics Explorer (Charts + Summary)",
    description:
      "Paste numbers or upload CSV to compute mean/median/std dev, quartiles, IQR outliers, plus histogram and box plot with CSV and PNG exports.",
    category: "Math & converters"
  },
  {
    href: "/hourly-salary-tax-calculator",
    title: "Hourly to Salary Paycheck & After-Tax",
    description:
      "Convert between hourly and salary pay and see your estimated take-home pay after taxes by state.",
    category: "Money & bills"
  },
  {
    href: "/mortgage-payoff-calculator",
    title: "Mortgage Payoff & Amortization",
    description:
      "Estimate your monthly payment, see a full payoff schedule, and explore how extra payments can reduce interest and shorten your mortgage term.",
    category: "Money & bills"
  },
  {
    href: "/receipt-bill-splitter",
    title: "Receipt Bill Splitter",
    description:
      "Enter receipt items, pick who ordered what (or who is sharing), and let the tool split the bill with tax and tip included. Everything runs on your device.",
    category: "Money & bills"
  },
  {
    href: "/rent-vs-buy-calculator",
    title: "Rent vs Buy Calculator",
    description:
      "Compare renting versus buying a home with full monthly cost breakdown, net worth over time, and a clear break-even year under your assumptions.",
    category: "Money & bills"
  },
  {
    href: "/random-meal-generator",
    title: "Random Meal Generator",
    description:
      "Stuck on what to eat? Get a random meal idea filtered by diet and calories.",
    category: "Home & everyday life"
  },
  {
    href: "/smoothie-macro-calculator",
    title: "Smoothie Macro Calculator",
    description:
      "Build a custom smoothie and see total calories, protein, carbs, and fat.",
    category: "Home & everyday life"
  },
  {
    href: "/paint-coverage-calculator",
    title: "Paint Coverage Calculator",
    description:
      "Estimate how many gallons of paint you need for one or more rooms, including doors, windows, ceilings, and coats.",
    category: "Home & everyday life"
  },
  {
    href: "/grass-seed-calculator",
    title: "Grass Seed Coverage Calculator",
    description:
      "Estimate how many bags of grass seed you need. Supports top brands, new lawns, reseeding, and custom mixes.",
    category: "Home & everyday life"
  },
  {
    href: "/how-long-to-freeze",
    title: "How Long to Freeze?",
    description:
      "Pick a food, freezer type, and frozen-on date to see how long it's recommended to keep it frozen and when quality starts to drop.",
    category: "Home & everyday life"
  },
  {
    href: "/baby-kick-counter",
    title: "Baby Kick Counter",
    description:
      "Count and time baby movements in a calm, mobile-friendly tracker. Includes recent session history. Not medical advice.",
    category: "Health, fitness & family"
  },
  {
    href: "/body-progress-tracker",
    title: "Body Progress Tracker",
    description:
      "Log your weight and measurements, see BMI and calorie estimates, and track progress toward your goals over time.",
    category: "Health, fitness & family"
  },
  {
    href: "/workout-tracker",
    title: "Workout Tracker",
    description:
      "Log your strength and cardio sessions, track lifts over time, and export your training log as CSV or shareable charts.",
    category: "Health, fitness & family"
  },
  {
    href: "/baby-name-generator",
    title: "Baby Name Generator",
    description:
      "Explore boy, girl, and neutral names by origin and meaning, then randomize first and middle names with your last name.",
    category: "Health, fitness & family"
  },
  {
    href: "/baby-genetic-predictor",
    title: "Baby Genetic Predictor",
    description:
      "Predict your baby’s height, eye color, and hair color with beautiful data-driven visualizations.",
    category: "Health, fitness & family"
  },
  {
    href: "/life-expectancy-explorer",
    title: "Life Expectancy Explorer",
    description:
      "Estimate your remaining years of life by age, sex, country, and lifestyle, with survival curves and risk visualizations.",
    category: "Health, fitness & family"
  },
  {
    href: "/weighted-grade-calculator",
    title: "Weighted Grade Calculator",
    description:
      "Add class categories and weights to see your current grade as a weighted percentage.",
    category: "School, study & classroom tools"
  },
  {
    href: "/time-duration-calculator",
    title: "Time Duration Calculator",
    description:
      "Find the time between two dates or add/subtract days, hours, minutes, and seconds from a specific date and time.",
    category: "School, study & classroom tools"
  },
  {
    href: "/unit-converter",
    title: "Universal Unit Converter",
    description:
      "Convert between units of length, weight, volume, temperature, speed, area, pressure, data, and more in a clean, mobile-friendly interface.",
    category: "School, study & classroom tools"
  },
  {
    href: "/unit-circle-calculator",
    title: "Unit Circle Calculator & Trig Explorer",
    description:
      "Explore the unit circle with an interactive trig calculator. See angles in degrees and radians, and view sine, cosine, and tangent values with exact trig ratios.",
    category: "School, study & classroom tools"
  },
  {
    href: "/periodic-table",
    title: "Interactive Periodic Table",
    description:
      "Explore all 118 elements with category filters, property maps, and detailed atomic data in a fully interactive table.",
    category: "School, study & classroom tools"
  },
  {
    href: "/dna-sequence-explorer",
    title: "DNA Sequence Explorer",
    description:
      "Visualize DNA sequences, codons, and amino acids with an interactive viewer and exportable charts and tables.",
    category: "School, study & classroom tools"
  },
  {
    href: "/solar-system-simulator",
    title: "Solar System Orbit Simulator",
    description:
      "Watch the planets circle the Sun in real time and tap each one to explore orbital periods, distances, and temperatures.",
    category: "School, study & classroom tools"
  },
  {
    href: "/team-randomizer",
    title: "Team Randomizer",
    description:
      "Split a class, roster, or group into fair random teams in seconds.",
    category: "School, study & classroom tools"
  },
  {
    href: "/resume-builder",
    title: "Resume Builder",
    description:
      "Create an ATS-friendly resume in your browser with no login, then export it to PDF, Word, plain text, or Markdown.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/pdf-signature-editor",
    title: "PDF Signature & Form Filler",
    description:
      "Sign PDFs and add basic text form fields directly in your browser. No upload, fully client-side.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/email-signature-generator",
    title: "Email Signature Generator",
    description:
      "Build a professional HTML email signature with your details, links, and logo, then copy the HTML or export a PNG preview.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/json-linter",
    title: "JSON Linter & Formatter",
    description:
      "Validate and format JSON locally, then copy or download the result with no data sent to a server.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/diff-checker",
    title: "Diff Checker",
    description:
      "Compare two blocks of text or code, highlight additions and deletions, and download a simple diff.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/qr-code-generator",
    title: "QR Code Generator",
    description:
      "Build QR codes for links, Wi‑Fi networks, and messages, customize colors, and download a PNG with optional branding.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/password-generator",
    title: "Random Password Generator",
    description:
      "Generate strong random passwords with custom character sets and a quick strength estimate, all in your browser.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/binary-decimal-hex-converter",
    title: "Binary / Decimal / Hex / Octal Converter",
    description:
      "Convert between binary, decimal, hexadecimal, and octal, and visualize bits and place values. Perfect for computer science students.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/image-format-converter",
    title: "HEIC to JPG & Image Converter",
    description:
      "Convert HEIC, JPG, PNG, and WEBP images directly in your browser with optional max file size and quality controls. Nothing is uploaded.",
    category: "Work, docs & developer tools"
  },
  {
    href: "/color-palette-extractor",
    title: "Color Picker & Palette Extractor",
    description:
      "Upload any image to extract a full color palette with HEX, RGB, and HSL values. Click to pick colors and export palettes as PNG or JSON.",
    category: "Design & visual tools"
  },
  {
    href: "/online-piano-keyboard",
    title: "Online Piano Keyboard",
    description:
      "Play a virtual piano in your browser using your mouse or QWERTY keyboard across multiple octaves.",
    category: "Creative & fun"
  },
  {
    href: "/dice-roller",
    title: "Custom Dice Roller & RPG Dice Simulator",
    description:
      "Roll d4, d6, d8, d10, d12, and d20 dice with modifiers, animations, and roll history. Perfect for DnD and tabletop RPGs.",
    category: "Creative & fun"
  },
  {
    href: "/drum-machine",
    title: "Online Beat Maker",
    description:
      "Build drum patterns with a 16-step sequencer for kick, snare, hi-hats, and bass. Runs entirely in your browser using the Web Audio API.",
    category: "Creative & fun"
  },
  {
    href: "/pixel-drawing-grid",
    title: "Pixel Drawing Grid & Graph Paper",
    description:
      "Draw pixel art and graph paper designs with an adjustable grid, color picker, undo/redo, and PNG export, all in your browser.",
    category: "Creative & fun"
  }
];


