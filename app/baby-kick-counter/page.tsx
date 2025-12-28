import type { Metadata } from "next";
import Link from "next/link";
import BabyKickCounter from "@/components/BabyKickCounter";

export const metadata: Metadata = {
  title: "Baby Kick Counter | LifeHackToolbox",
  description:
    "Track your baby’s movements with an easy kick counter. Time kicks, see how long it takes to reach 10 kicks, and review recent sessions. Not a substitute for medical advice.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/baby-kick-counter"
  }
};

export default function BabyKickCounterPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Baby Kick Counter
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Use this simple tool to count baby movements during a session. Tap once for each
          kick, and the counter will track total kicks, elapsed time, and how long it
          takes to reach 10 movements.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          Kick counting can help you notice patterns over time, but it cannot tell you if
          your baby is healthy. Always contact your healthcare provider right away if you
          notice fewer movements or feel uneasy, even if this tool looks normal.
        </p>
      </section>
      <BabyKickCounter />
      <section
        aria-label="About baby kick counting"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          How to use kick counting as a gentle check-in, not a diagnosis
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Kick counting is a simple way some providers suggest tracking how active your
            baby feels on a typical day. It usually means choosing a quiet window, paying
            attention to movements, and seeing roughly how long it takes to feel a certain
            number of kicks, rolls, or flutters. The goal is not a perfect score; it is to
            build a sense of what is normal for your baby so you can notice when something
            feels off.
          </p>
          <p>
            Many guides talk about timing how long it takes to reach 10 movements, but the
            exact number and time frame can vary with your baby, your body, and your
            stage of pregnancy. Some babies are very active in short bursts, others spread
            movements out over longer periods. Rather than fixating on a specific cutoff,
            focus on changes compared to your usual pattern and follow your intuition if
            something feels different.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Patterns, not perfection
          </h3>
          <p>
            This tool shows total kicks, elapsed time, an approximate kicks-per-hour
            estimate, and how long it took to reach 10 kicks when that happens. Those
            numbers are meant to help you remember how a session felt, not to grade your
            pregnancy. If a session looks slower or faster than usual, you can note it and
            bring it up with your midwife or doctor if you are unsure.
          </p>
          <p>
            A single slower session does not automatically mean something is wrong, and a
            strong session does not guarantee that everything is fine. Reduced movement,
            a gut feeling that something is off, or other symptoms should always be taken
            seriously even if the counter looks “normal”.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Tips for counting kicks without stressing yourself out
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Pick a consistent time.</span> Many people
              count once a day during a time when baby is usually active, often after a
              meal or in the evening.
            </li>
            <li>
              <span className="font-medium">Get comfortable.</span> Lying on your side or
              reclining comfortably, with your phone within easy reach, makes it easier to
              focus on movements.
            </li>
            <li>
              <span className="font-medium">Stay hydrated.</span> Drinking water and
              having a light snack beforehand can sometimes wake a quiet baby up.
            </li>
            <li>
              <span className="font-medium">Watch for changes over time.</span> Use the
              recent sessions list as a memory aid, not a scoreboard.
            </li>
          </ul>
          <h3 className="text-sm font-semibold text-slate-900">
            This is only a helper, not a medical tool
          </h3>
          <p>
            No app or website can replace a trained clinician listening to you and
            checking on your baby. This counter cannot see your baby&apos;s heart rate,
            position, or overall health. It can only record when you say you felt a
            movement. If something feels different, weaker, or just “off”, call your
            midwife, OB, or local triage line straight away, even if your numbers look
            similar to usual.
          </p>
          <p>
            If you want to balance kick counting with other parts of life,{" "}
            <Link
              href="/"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              LifeHackToolbox
            </Link>{" "}
            also includes quick tools like the{" "}
            <Link
              href="/random-meal-generator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Random Meal Generator
            </Link>{" "}
            for deciding what to eat or the{" "}
            <Link
              href="/smoothie-macro-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Smoothie Macro Calculator
            </Link>{" "}
            for checking the macros on your favorite blends.
          </p>
          <p className="text-xs text-slate-600">
            Always follow the advice of your own healthcare team first. If you are ever
            worried about your baby&apos;s movements, do not wait and do not rely on this
            tool—call your provider or local emergency number.
          </p>
        </div>
      </section>
    </div>
  );
}


