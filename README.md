# LifeHack Toolbox

48 small, free browser tools — calculators, converters, science and study explorers, and a few
creative toys. No accounts, no uploads, no tracking of what you type.

**Live: [lifehacktoolbox.com](https://lifehacktoolbox.com)**

## What makes it different

Everything runs in the browser. There is no backend, and there are no API routes in the repository
to check that claim against: OCR, PDF editing and signing, image conversion, audio and every
calculator run on the client. Files you open never leave the machine, and the only thing stored is
whatever a tool keeps in `localStorage` (settings, a workout log, a drawing).

That constraint drives most of the engineering decisions here — heavy work is done with WebAssembly
and browser APIs (Tesseract.js for OCR, pdf-lib and PDF.js for documents, Canvas for image
conversion, the Web Audio API for the drum machine and piano) instead of a server.

## The tools

48 tools across eight categories, indexed in [`lib/homeToolIndex.ts`](lib/homeToolIndex.ts), which
also powers search on the home page:

| Category | Examples |
| --- | --- |
| Math & converters | Function grapher, matrix calculator, unit converter, statistics explorer, probability simulator |
| Money & bills | Mortgage payoff, rent vs buy, hourly salary and tax, receipt splitter |
| Work, docs & developer tools | PDF signature editor, diff checker, JSON linter, regex playground, QR codes, résumé builder, email signatures |
| School, study & classroom tools | Periodic table, molecular weight, DNA sequence explorer, Punnett squares, unit circle, algorithm visualizer |
| Health, fitness & family | Workout tracker, body progress tracker, baby kick counter, smoothie macros |
| Home & everyday life | Paint coverage, grass seed, freezing times, time durations |
| Design & visual tools | Color palette extractor, image format converter, pixel drawing grid |
| Creative & fun | Drum machine, piano keyboard, dice roller, solar system and scale-of-the-universe explorers |

Each tool is its own route under `app/`, server-rendered with metadata and JSON-LD for search, with
the interactive part in a client component under `components/`.

## Stack

Next.js 14 (App Router) · React 18 · TypeScript · Tailwind CSS · deployed on Vercel.

Notable libraries: `tesseract.js` (OCR), `pdf-lib` and `pdfjs-dist` (PDF editing and rendering),
`docx`, `recharts`, `qrcode`, `html2canvas`, `diff`.

## Layout

```
app/          one directory per tool: route, metadata, SEO content
components/   the interactive client component for each tool
lib/          pure logic, kept out of components so it can be reasoned about on its own
data/         static datasets (periodic elements, atomic weights, solar system, names)
types/        ambient declarations for libraries without bundled types
```

Calculation logic lives in `lib/` rather than inside components on purpose: `matrixLogic.ts`,
`statisticsLogic.ts`, `projectileMotionLogic.ts` and friends are plain functions with no React in
them.

## Running it

```bash
npm install
npm run dev     # http://localhost:3000
npm run build
npm run lint
```

No environment variables and no database. `npm install && npm run dev` is the whole setup.

## License

MIT — see [LICENSE](LICENSE).
