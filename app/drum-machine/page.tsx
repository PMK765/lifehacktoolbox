import type { Metadata } from "next";
import DrumMachine from "@/components/DrumMachine";

export const metadata: Metadata = {
  title:
    "Online Drum Machine & 16-Step Beat Maker | LifeHackToolbox",
  description:
    "Create drum patterns in your browser with a 16-step sequencer for kick, snare, hi-hats, and bass. Adjustable tempo, mutes, pattern saving, and more.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/drum-machine"
  }
};

const DrumMachinePage = () => {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
          Online Beat Maker – 16-Step Drum Machine
        </h1>
        <p className="max-w-3xl text-sm text-slate-700">
          Program drum patterns with kick, snare, hi-hats, and bass in a
          browser-based 16-step sequencer. Adjust tempo, swing and volume, save
          patterns, and export JSON presets — all running locally with the Web
          Audio API.
        </p>
      </section>
      <section className="mt-6">
        <DrumMachine />
      </section>
      <section className="mt-10 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-800 md:p-7">
        <h2 className="text-base font-semibold tracking-tight text-slate-900">
          How to use the 16-step drum machine
        </h2>
        <p>
          This <span className="font-semibold">online drum machine</span> is
          built around a classic 16-step sequencer. Time is divided into sixteen
          equal slices, and each row represents a sound: kick, snare, closed
          hi-hat, and a short synth bass tone. To create a beat, tap the pads in
          the grid to turn individual steps on or off. When you press play, the
          sequencer loops from left to right, triggering any active steps in
          time with the selected tempo.
        </p>
        <p>
          You can start with a simple pattern by placing kicks on steps 1 and 9,
          snares on steps 5 and 13, and hi-hats on every second or fourth step.
          Then add bass notes on steps that feel good against the drums. Use the
          BPM controls to slow things down for a chill groove or speed them up
          for faster electronic rhythms. The play button starts and stops the
          loop instantly, making it easy to experiment in real time.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          What is a step sequencer?
        </h3>
        <p>
          A step sequencer is a way to program rhythms and melodies by dividing
          time into fixed steps instead of recording live performance. Each
          column in the grid is one step, usually a sixteenth note at common
          dance tempos. By toggling steps on and off, you can quickly sketch
          patterns that would be difficult to play by hand with perfect timing.
          Many classic drum machines and grooveboxes used simple 16-step layouts
          like this, which makes the interface familiar and fast to learn.
        </p>
        <p>
          The swing control slightly delays every second step to give the groove
          a more human, shuffled feel instead of a rigid machine feel. At 0%
          swing, the beat is completely straight; as you increase swing, the
          off-beat hi-hats and snares lean later in the bar, creating a more
          laid-back pocket that is common in hip-hop and house music.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Kick, snare, hi-hat, and bass explained
        </h3>
        <p>
          In most drum patterns, the <span className="font-semibold">kick</span>{" "}
          anchors the low end and marks the main beats. The{" "}
          <span className="font-semibold">snare</span> usually lands on the
          second and fourth beats of each bar, giving the groove its backbeat.
          The <span className="font-semibold">hi-hat</span> fills in the
          subdivisions and defines how busy or sparse the rhythm feels. The
          <span className="font-semibold">bass</span> in this tool is a short
          synth note that you can use to outline a simple bassline or reinforce
          the kick.
        </p>
        <p>
          Combining these four elements, you can build everything from minimal
          techno patterns to boom-bap, lo-fi hip-hop, or pop drum grooves. The
          step sequencer makes it easy to see which sounds land together and
          which are offset, which helps you understand how drum parts interlock
          to create a full beat.
        </p>
        <h3 className="text-sm font-semibold text-slate-900">
          Why browser-based beat makers are great for sketching ideas
        </h3>
        <p>
          Because this <span className="font-semibold">web audio beat maker</span>{" "}
          runs entirely in your browser, there is nothing to install and no
          account required. All sound is generated locally using the Web Audio
          API, and your patterns are stored in your own{" "}
          <span className="font-semibold">localStorage</span>, not on a server.
          You can save multiple presets, reload them later, and export a JSON
          file that captures the grid and tempo in a portable format.
        </p>
        <p>
          Browser-based tools are ideal for quick sketches: you can open this
          page, make beats in seconds, and then recreate the pattern in your
          main DAW or hardware later. Use it to audition groove ideas, practice
          counting sixteenth notes, or just have fun tapping out rhythms with a
          simple <span className="font-semibold">16 step sequencer</span> that
          responds instantly to your clicks and taps.
        </p>
      </section>
    </main>
  );
};

export default DrumMachinePage;


