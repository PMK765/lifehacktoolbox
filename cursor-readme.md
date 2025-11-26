# LifeHackToolbox – Cursor Project README

This README defines the **global rules and conventions** for the LifeHackToolbox project inside Cursor.

Treat this document as the **source of truth** whenever creating, editing, or refactoring code.

---

## 1. Project Overview

**LifeHackToolbox** is a collection of high-quality, free, browser-based tools:

- Calculators (finance, math, time, unit conversion, etc.)
- Educational tools (periodic table, DNA explorer, unit circle, CS number-base converter, etc.)
- Fun/utility tools (dice roller, color palette extractor, workout trackers, etc.)

Core goals:

- **No logins**, no accounts.
- **100% client-side** for all tools whenever possible.
- **Fast, mobile-friendly, and visually clean**.
- **SEO-optimized** per tool (route + metadata + content section).
- Each tool feels like a **tiny polished app**.

---

## 2. Tech Stack & Architecture

- **Framework:** Next.js **14+** with **App Router** (`app/` directory).
- **Language:** TypeScript **everywhere**.
- **Styling:** Tailwind CSS.
- **Components:**
  - Prefer **server components** by default.
  - Use **client components** only for interactive / browser-only features (events, `window`, canvas, Web Audio, etc.).
- **Deployment:** Vercel.
- **Data storage:** `localStorage` only (no backend) for:
  - Settings
  - Recent activity
  - Simple histories

---

## 3. Global Rules (IMPORTANT)

Cursor must always follow these rules:

1. **TypeScript everywhere.**  
   No `.js` files; use `.ts` and `.tsx`.

2. **App Router only.**  
   - Use `app/` directory for routing.
   - No legacy `pages/` routing.

3. **No `try/catch` blocks.**  
   - Use conditional checks and defensive coding instead.
   - If something might fail (e.g., `localStorage`, `navigator.clipboard`, DOM refs), guard with `typeof window !== "undefined"` or presence checks.

4. **No placeholder comments.**  
   - Do **not** add comments like `// existing code`, `// TODO`, or `// rest of code`.
   - When editing a file, produce **full, real code**, not abbreviated.

5. **No backend or external API calls for tools (unless explicitly requested).**  
   - All tools should run **fully client-side**:  
     - Calculations  
     - Visualizations  
     - Rendering  
   - Use browser APIs (Canvas, Web Audio, etc.) and small, in-bundle helper libraries when needed.

6. **Tailwind for styling.**  
   - Use Tailwind classes for layout and design.
   - Keep styling consistent with existing site:
     - Rounded cards.
     - Soft shadows.
     - Modern, minimal UI.

7. **Accessibility & responsiveness.**
   - Mobile-first designs.
   - Inputs large enough on touch devices.
   - Semantic HTML (`<main>`, `<section>`, `<nav>`, headings in order).

---

## 4. File & Folder Structure

General structure (simplified):

- `app/`
  - `page.tsx` – homepage
  - `[tool-name]/page.tsx` – one folder per tool route
- `components/`
  - Shared UI components (buttons, cards, layout pieces)
  - Tool-specific components (e.g. `UnitCircleExplorer.tsx`, `DiceRollerApp.tsx`)
- `data/`
  - Static datasets (elements, codon tables, reference tables, etc.)
- `lib/`
  - Generic helpers and utilities (math, number conversion, color utils, etc.)
- `public/`
  - Images, icons, static assets (logos, planets, etc.)

When adding a new tool:

1. Add a folder under `app/<tool-route>/`.
2. Add a `page.tsx` there.
3. Add one or more components under `components/`.
4. Add any helper data under `data/` or `lib/` as appropriate.
5. Update the homepage `app/page.tsx` with a new card/link.

---

## 5. Pattern for New Tools (MUST FOLLOW)

Every new tool should follow this pattern:

### 5.1 Route

- Add a new route folder under `app/`, e.g.:

  ```txt
  app/<tool-slug>/page.tsx
The route name should be SEO-friendly, e.g.:

/unit-converter

/unit-circle-calculator

/binary-decimal-hex-converter

/periodic-table

/dna-sequence-explorer

/dice-roller

/color-palette-extractor

5.2 metadata
Each page.tsx must export metadata with an SEO-focused title/description:

ts
Copy code
export const metadata = {
  title: "Tool Name with Keywords | LifeHackToolbox",
  description:
    "Brief, SEO-focused description with important keywords and what the tool does."
};
Include primary keywords like “calculator”, “converter”, “unit circle”, “DNA sequence explorer”, etc.

Mention “LifeHackToolbox” in the description.

5.3 Page Component
The page.tsx file should:

Be a server component by default.

Import and render the main client component for interactivity:

tsx
Copy code
import { UnitCircleExplorer } from "@/components/UnitCircleExplorer";

export default function Page() {
  return (
    <main className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl md:text-4xl font-semibold tracking-tight mb-6">
        Unit Circle Calculator & Trig Explorer
      </h1>
      <UnitCircleExplorer />
      {/* SEO content section below */}
      <section className="mt-12 space-y-4 text-sm md:text-base text-slate-100">
        {/* ...educational SEO text... */}
      </section>
    </main>
  );
}
After the main component, include a semantic SEO section with headings and copy explaining:

What the tool is

How to use it

Relevant domain knowledge (math, chemistry, CS, etc.)

Why it’s useful

That it runs fully in the browser and doesn’t store data on a server

6. Client Components
When a tool needs interaction (which is most of them), create a client component under components/.

Pattern:

tsx
Copy code
"use client";

import { useState, useEffect, useRef } from "react";
// other imports...

export function ToolNameComponent() {
  // state, refs, etc. here
  // no try/catch

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:p-6 space-y-4">
      {/* UI layout and logic */}
    </div>
  );
}
Client component rules:

Must start with "use client";.

Use React hooks appropriately (useState, useEffect, useRef).

Guard browser-only APIs:

ts
Copy code
if (typeof window === "undefined") return;
No try/catch.

7. LocalStorage Usage
When storing user preferences or history:

Always guard window and localStorage usage:

ts
Copy code
if (typeof window === "undefined") return;
const saved = window.localStorage.getItem("key");
Serialize to JSON with JSON.stringify / JSON.parse only after simple checks.

Keep keys namespaced, e.g.:

"lht_unit_converter_favorites_v1"

"lht_dice_history_v1"

"lht_number_base_last_value_v1"

Never rely on localStorage for core functionality; only enhancements.

8. Exporting as PNG / JSON (Branding Rules)
Some tools export visual outputs (PNG screenshots, images of tables, palettes, or cards).

Rules:

Use a client-side approach like html2canvas (or similar) only inside client components.

Wrap the content to export in a container with ref.

When exporting PNG:

Ensure the exported area includes small, non-intrusive branding:

e.g. a footer or header: LifeHackToolbox.com.

For JSON exports:

Include metadata:

generatedAt (ISO timestamp)

source or toolName

No try/catch around exports — just conditional guards.

9. Homepage Cards (MUST UPDATE)
For every new tool, the homepage (app/page.tsx) must be updated with a new card/link.

Card pattern:

Category sections (e.g. “Math & Converters”, “Science & Education”, “Fun & Games”, “Design & Visual Tools”).

Each card includes:

Tool name as title

One-sentence description

Internal link to the tool route

Example:

tsx
Copy code
<Link
  href="/unit-circle-calculator"
  className="group block rounded-2xl border border-slate-800 bg-slate-900/70 p-4 hover:border-emerald-400 hover:bg-slate-900 transition"
>
  <h3 className="text-lg font-semibold mb-1">
    Unit Circle Calculator & Trig Explorer
  </h3>
  <p className="text-sm text-slate-300">
    Explore the unit circle with interactive sine, cosine, and tangent values in degrees and radians.
  </p>
</Link>
10. SEO Content for Each Tool
Every tool page must include a SEO section below the main interactive component:

Use semantic HTML:

<section>

<h2>, <h3>

<p>, <ul>, etc.

Length: typically 400–1000 words depending on tool.

Must:

Explain the concept the tool addresses (math, physics, chemistry, CS, etc.).

Include the main keywords (e.g. “unit circle calculator”, “binary to decimal converter”, “interactive periodic table”).

Explain usage and benefits.

Mention that the tool runs entirely in the browser and doesn’t store user data on servers.

Link to other relevant tools in LifeHackToolbox.


Style & UX Notes

Use simple, readable typography.

Prefer clear labels over clever wording.

Use cards and sections to organize tools.

Ensure consistent spacing, padding, and margins.

Provide feedback for user actions (e.g. “Copied!”, “Saved”, etc.).

14. Safety & Privacy

Tools must never send user-entered data to remote APIs unless explicitly requested.

All computation should happen locally in the browser.

When using localStorage, only store what is necessary and non-sensitive.