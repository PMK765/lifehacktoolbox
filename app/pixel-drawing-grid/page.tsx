import type { Metadata } from "next";
import PixelDrawingGrid from "@/components/PixelDrawingGrid";

export const metadata: Metadata = {
  title:
    "Pixel Drawing Grid & Graph Paper Editor | LifeHackToolbox",
  description:
    "Draw pixel art or sketch on virtual graph paper. Adjust grid size, pick colors, undo/redo, and export your drawing as a PNG image or JSON file, all in your browser."
};

const PixelDrawingGridPage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Pixel Drawing Grid &amp; Graph Paper Editor
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Sketch pixel art, knitting charts, cross-stitch patterns, and tile
          designs on virtual graph paper. Adjust the grid, choose colors, and
          export your work as a PNG or JSON file — everything runs locally in
          your browser.
        </p>
      </section>
      <section className="mt-6">
        <PixelDrawingGrid />
      </section>
      <section className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 md:p-7">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          Draw pixel art right in your browser
        </h2>
        <p>
          This tool is a lightweight{" "}
          <span className="font-semibold">pixel art editor</span> and{" "}
          <span className="font-semibold">grid drawing tool</span> designed for
          quick sketches. Instead of installing a full graphics program, you can
          open this page and start drawing on a virtual grid in seconds. Each
          cell in the grid acts like one square of graph paper or one pixel in a
          sprite. You can resize the grid, pick any color, and switch between
          pencil, eraser, and fill tools to refine your design.
        </p>
        <p>
          Because the layout is simple and the grid stays aligned, it is easy to
          copy your design onto physical paper, a knitting chart, or a game
          engine&apos;s tile map. The undo and redo buttons make experimentation
          safe: you can explore new ideas, then step back a few moves if you
          change your mind.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          How to use the online graph paper editor
        </h3>
        <p>
          Start by choosing a grid size between 8×8 and 64×64. Smaller grids are
          great for simple icons and game sprites, while larger grids behave
          more like traditional{" "}
          <span className="font-semibold">online graph paper</span>. Pick a
          color from the color picker or from one of the preset swatches, then
          select the pencil tool and click or tap cells to draw. Dragging while
          you hold down the mouse or your finger paints continuous strokes,
          which feels similar to drawing with a marker on real paper.
        </p>
        <p>
          The eraser tool clears cells back to transparent so the background
          color shows through. The fill bucket floods an entire contiguous area
          with the active color, making it easy to recolor regions or create
          large blocks in one click. You can toggle grid lines on or off
          depending on whether you want a cleaner image or a more traditional
          graph paper look.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Ideas for knitting charts, cross-stitch, and game sprites
        </h3>
        <p>
          Many people use{" "}
          <span className="font-semibold">
            virtual graph paper
          </span>{" "}
          to plan fiber arts and craft projects. You can treat each cell as a
          stitch and design{" "}
          <span className="font-semibold">
            knitting chart generator
          </span>{" "}
          style patterns, colorwork motifs, or stranded designs before you pick
          up your needles. Cross-stitchers can do the same: each square becomes
          one stitch in a{" "}
          <span className="font-semibold">
            cross-stitch pattern grid
          </span>{" "}
          that you can print or reference while you work.
        </p>
        <p>
          Game developers and hobbyists can use the grid to block out simple
          sprites, tiles, and icons. Because the canvas is made of discrete
          pixels, it is easy to transfer designs into a game engine or sprite
          editor, one cell at a time. You can also use the tool for school math
          and geometry sketches, mapping out coordinates or drawing small
          diagrams that require an even grid.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Exporting your pixel designs as PNG or JSON
        </h3>
        <p>
          When you are happy with a design, you can export it as a PNG image or
          JSON data. PNG export captures exactly what you see on the canvas,
          including the background color and a small, subtle
          &ldquo;LifeHackToolbox.com&rdquo; watermark. The JSON export saves the
          grid dimensions and the full color matrix, making it easy to re-import
          later or feed into a custom script. Both formats are generated
          entirely in your browser; no images or data are sent to a server.
        </p>
        <p>
          Because all state is stored locally, this{" "}
          <span className="font-semibold">virtual graph paper</span> behaves
          like a private notebook. You can close the tab and return later to
          continue working from where you left off, or export your work to share
          with collaborators. Whether you are planning quilts, mapping out a
          crochet chart, designing sprites, or just doodling on a grid, this
          browser-based editor gives you a fast, focused place to work.
        </p>
      </section>
    </main>
  );
};

export default PixelDrawingGridPage;


