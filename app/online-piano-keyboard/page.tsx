import type { Metadata } from "next";
import Link from "next/link";
import PianoKeyboard from "@/components/PianoKeyboard";

export const metadata: Metadata = {
  title: "Online Piano Keyboard | LifeHackToolbox",
  description:
    "Play piano directly in your browser with a clickable keyboard and correct pitches using the Web Audio API. Supports mouse and keyboard input, with multiple octaves.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/online-piano-keyboard"
  }
};

export default function OnlinePianoKeyboardPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Online Piano Keyboard
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Play a virtual piano directly in your browser. Click on the keys or
          use your computer keyboard to hear accurate pitches generated with the
          Web Audio API.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Audio is generated locally on your device with no external audio
          files and no data sent to any server.
        </p>
      </section>
      <PianoKeyboard />
      <section
        aria-label="About the online piano keyboard"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          A browser-based piano for quick ideas and ear training
        </h2>
        <p>
          This online piano keyboard uses the Web Audio API to synthesize notes
          in real time. Each key is tuned using equal temperament, the same
          standard used by most modern pianos and digital instruments. The
          pitches are calculated from MIDI note numbers, with A4 (the concert
          tuning reference) set to 440 Hz, and the other notes spaced in
          half-steps according to the standard formula. That means you can rely
          on this keyboard for basic ear training, songwriting sketches, and
          music theory practice without worrying about detuning.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Mouse, touch, and QWERTY input
        </h3>
        <p>
          You can play this keyboard by clicking or tapping on the keys, or by
          using a QWERTY layout for fast input. The A–K keys map to the white
          notes from C4 up to C5, while W, E, T, Y, and U provide the sharps in
          between. This mapping makes it easy to play simple melodies with one
          hand while keeping focus in your browser window. On touch devices, tap
          the keys directly; the Web Audio engine will still generate the same
          pitches using your device&apos;s audio output.
        </p>
        <p>
          Above the keyboard you can switch between octave ranges such as C3–C5
          or C4–C6, change waveforms (sine, triangle, square, sawtooth), and
          adjust volume. These options let you move between a round, organ-like
          sound and a brighter, more cutting tone. Because everything runs in
          real time, you can tweak settings without restarting playback.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          How the Web Audio synthesis works
        </h3>
        <p>
          Under the hood, the tool manages a single AudioContext with a
          polyphonic set of oscillator nodes. When you press a key, it creates
          an oscillator at the appropriate frequency for that note and routes it
          through a gain node that shapes the attack and release. Multiple notes
          can sound at once, so you can play simple chords as well as melodies.
          Each oscillator uses the selected waveform type, and a master gain
          node controls the overall volume. When you release a key, the gain
          ramps down over a short release time to avoid clicks.
        </p>
        <h3 className="text-base font-semibold text-slate-900">
          Privacy and offline-friendly design
        </h3>
        <p>
          Like other LifeHackToolbox utilities, this piano keyboard is fully
          client-side. There are no audio streams or network calls involved in
          generating sound. As long as your browser supports Web Audio, the tool
          can run even on slow or offline connections. It is safe to use on
          shared or work machines because it does not store or transmit any
          personal data.
        </p>
        <p>
          You can pair this with other tools on LifeHackToolbox for a broader
          creative workflow. For example, you might log practice sessions or
          exercise routines in the{" "}
          <Link
            href="/workout-tracker"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            Workout Tracker
          </Link>
          , generate quick QR codes for sharing rehearsal links using the{" "}
          <Link
            href="/qr-code-generator"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            QR Code Generator
          </Link>
          , or browse fun naming ideas in the{" "}
          <Link
            href="/baby-name-generator"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            Baby Name Generator
          </Link>{" "}
          if you are naming a band or project. All of these tools share the same
          philosophy: simple, focused, and privacy-first.
        </p>
      </section>
    </div>
  );
}


