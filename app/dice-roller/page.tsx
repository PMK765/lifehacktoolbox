import DiceRollerApp from "@/components/DiceRollerApp";

export const metadata = {
  title: "Custom Dice Roller & RPG Dice Simulator | LifeHackToolbox",
  description:
    "Roll RPG dice like d4, d6, d8, d10, d12, and d20 with modifiers, animations, and roll history. Perfect for tabletop games, DnD sessions, and board games.",
  alternates: {
    canonical: "https://lifehacktoolbox.com/dice-roller"
  }
};

const DiceRollerPage = () => {
  return (
    <div className="space-y-10">
      <section
        aria-labelledby="dice-roller-heading"
        className="space-y-4"
      >
        <div className="space-y-2">
          <h1
            id="dice-roller-heading"
            className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl"
          >
            Custom Dice Roller &amp; RPG Dice Simulator
          </h1>
          <p className="max-w-2xl text-sm text-slate-700">
            Build a pool of tabletop dice, add modifiers for attack rolls, skill
            checks, or damage, and roll everything in one click. This online
            dice roller keeps a full history and works great for D&amp;D and
            other RPGs.
          </p>
        </div>
        <DiceRollerApp />
      </section>
      <section className="space-y-4 border-t border-slate-200 pt-6 text-sm text-slate-800 md:text-base">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900">
          Online dice roller for DnD and tabletop RPGs
        </h2>
        <p>
          This <strong>online dice roller</strong> is built for D&amp;D and
          other tabletop RPGs where you need to roll multiple dice, add
          modifiers, and keep an eye on past results. Instead of juggling
          physical dice or tapping separate apps for d20, d6, or d8 rolls, you
          can put everything into a single custom dice pool and roll it all at
          once. The tool runs entirely in your browser, so it works even when
          you are offline and does not send any roll data to a server.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          How to use this custom dice roller
        </h3>
        <p>
          Start by adding the dice you need to the pool at the top of the page.
          Each row lets you pick a die type (d4, d6, d8, d10, d12, d20) and the
          number of dice to roll, like 3d6 or 2d8. You can remove rows you no
          longer need or add new ones with the “Add dice” button. The modifier
          field lets you enter a bonus or penalty such as +3 for an attack
          roll, -1 for a debuff, or 0 for rolls without modifiers.
        </p>
        <p>
          When you click the <strong>Roll dice</strong> button, the simulator
          generates a <strong>random dice roll</strong> for each die using
          secure randomness when available. The current roll card shows the
          total, a breakdown by die type, and a readable summary like
          “3d6 + 1d8 + 2 = 21”. You can optionally give the roll a label such as
          “Attack roll”, “Stealth check”, or “Fireball damage”, which is stored
          along with the result.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Supported dice types: d4, d6, d8, d10, d12, d20
        </h3>
        <p>
          Most tabletop RPG systems, including <strong>D&amp;D</strong>, use a
          standard set of polyhedral dice: d4, d6, d8, d10, d12, and d20. This{" "}
          <strong>RPG dice roller</strong> supports all of those types. You can
          mix and match as needed—roll 1d20 for attacks, 2d8 for greatsword
          damage, 4d6 for character stats, or 3d4 + 2d6 for a custom homebrew
          spell. The breakdown section groups results by die type so you can see
          at a glance how much a particular die contributed.
        </p>
        <p>
          Because everything is parameterized by dice type and count, the
          simulator also works well for board games that use multiple d6 or
          other dice combinations. If you just need a simple{" "}
          <strong>d20 roller</strong> or a stack of d6s, you can collapse the
          pool to a single row and leave the rest empty.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Adding modifiers for attack rolls, skill checks, and saving throws
        </h3>
        <p>
          Many RPG rolls are written in the form “XdY + Z”, where Z is a
          modifier based on your character&apos;s ability score, proficiency, or
          situational bonuses. The modifier field in this <strong>dice</strong>{" "}
          simulator supports signed values like +5 or -2 and applies that value
          once to the sum of all dice. The final total is always shown
          alongside the underlying components, so you can still see whether a
          high or low roll came from the dice or the modifier.
        </p>
        <p>
          This is particularly helpful for attack rolls, skill checks, and
          saving throws in <strong>D&amp;D</strong> and similar systems. You can
          add your proficiency and ability modifiers once, name the roll, and
          then reuse the same setup throughout a session by hitting Roll again
          whenever you need another attempt.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Using roll history to track your RPG session
        </h3>
        <p>
          The <strong>roll history</strong> panel records your most recent rolls
          including labels, totals, dice formulas, and timestamps. This is
          useful for resolving rules questions (“What did you roll for that last
          attack?”) and for keeping a light record of how a session unfolded.
          You can clear the history at any time with a single click, and the
          next set of rolls will start a fresh log.
        </p>
        <p>
          Because history is stored locally in your browser, it will persist
          between page reloads on the same device but is never sent to a server.
          Each entry shows a compact summary like “3d6 + 1d8 + 2 = 21” along
          with a per-die-type breakdown such as “d6: 3, 5, 6 | d8: 7”.
        </p>
        <h3 className="text-lg font-semibold text-slate-900">
          Why online dice rollers are useful
        </h3>
        <p>
          A high-quality <strong>RPG dice roller</strong> or{" "}
          <strong>dice simulator</strong> is handy when you do not have physical
          dice nearby, when you want consistent randomness, or when you need to
          share results with players over video chat. It also helps speed up
          complex damage rolls or area effects where many dice are involved.
          Having a clear visual breakdown reduces miscounting and makes it
          easier for everyone at the table to follow what happened.
        </p>
        <p>
          This custom dice roller fits alongside other LifeHackToolbox tools
          that support students and hobbyists, such as the{" "}
          <a
            href="/random-meal-generator"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Random Meal Generator
          </a>{" "}
          for fun decision making, the{" "}
          <a
            href="/unit-circle-calculator"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Unit Circle Calculator
          </a>{" "}
          for trigonometry practice, the{" "}
          <a
            href="/binary-decimal-hex-converter"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Binary / Decimal / Hex / Octal Converter
          </a>{" "}
          for CS students, and the{" "}
          <a
            href="/unit-converter"
            className="font-medium text-emerald-700 underline underline-offset-2"
          >
            Universal Unit Converter
          </a>{" "}
          for everyday calculations. All of them run entirely in your browser
          with no sign-up required.
        </p>
      </section>
    </div>
  );
};

export default DiceRollerPage;


