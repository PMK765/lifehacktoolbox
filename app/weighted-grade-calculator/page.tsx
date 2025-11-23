import type { Metadata } from "next";
import Link from "next/link";
import WeightedGradeCalculator from "@/components/WeightedGradeCalculator";

export const metadata: Metadata = {
  title: "Weighted Grade Calculator | LifeHackToolbox",
  description:
    "Calculate your current class grade using a weighted grade calculator. Add categories like homework, quizzes, and exams with their weights, and see your overall percentage."
};

export default function WeightedGradeCalculatorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Weighted Grade Calculator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Match the categories and weights from your syllabus, enter points or percentages
          for each one, and see your current weighted grade along with a simple
          what-if scenario.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          This tool is for quick estimates only and does not replace your official grade
          in your school&apos;s LMS. Policies like dropping the lowest quiz or extra
          credit are not handled automatically.
        </p>
      </section>
      <WeightedGradeCalculator />
      <section
        aria-label="How weighted grades work"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          How weighted grades work and how to read them
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            A weighted grade is a way of combining different parts of a class—homework,
            quizzes, projects, exams—so that some pieces count more than others. Instead
            of taking a simple average of every score, each category gets a weight based
            on how important it is in the syllabus. For example, exams might be 50% of
            the grade, homework 30%, and quizzes 20%.
          </p>
          <p>
            In a weighted system, a 10-point homework assignment does not carry the same
            impact as a 100-point final. What matters is the percentage inside each
            category and how much that category is worth overall. This calculator mirrors
            that idea by asking for a category percent (either from points or entered
            directly) and then multiplying it by the category&apos;s weight.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Common grading categories you might see
          </h3>
          <p>
            Many instructors group grades into a small set of buckets, such as:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>Homework or problem sets</li>
            <li>Quizzes or short checks for understanding</li>
            <li>Tests or unit exams</li>
            <li>Final exam or project</li>
            <li>Participation, attendance, or discussion</li>
          </ul>
          <p>
            The exact weights differ by class, which is why you should always copy the
            numbers directly from your syllabus rather than guessing. If your instructor
            lists a category you do not care about yet (for example, a final exam you
            have not taken), you can leave that category at 0% until you have scores to
            plug in.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why the weights should usually add up to 100%
          </h3>
          <p>
            In most classes, all of the category weights together add up to 100%. That
            makes it easier to read the syllabus and to understand what your current
            percentage means. This calculator warns you when your weights do not sum to
            100%, but it will still compute a result based on what you enter so you can
            experiment with different setups.
          </p>
          <p>
            Occasionally, instructors intentionally leave some percentage unassigned
            because of optional assignments or extra credit. In those cases, it can make
            sense for your weights to add up to less than 100% until the end of the term.
            If you are not sure whether that applies, ask your instructor or TA.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Reading letter grades and planning ahead
          </h3>
          <p>
            The letter grade estimate in this tool uses a simple scale—A for 90 and up,
            B for 80–89.9, C for 70–79.9, D for 60–69.9, and F below 60. That matches many
            classes but not all of them. Some courses curve grades, others set different
            cutoffs, and some use pass/fail rules instead. Treat the letter here as a
            rough label, not a guarantee of what will appear on your transcript.
          </p>
          <p>
            The what-if section is useful when you are deciding how much to aim for on a
            future exam or project. Choose the exam category, plug in a hypothetical
            percentage, and see how your overall grade would change. This can help you
            decide where to focus effort or whether a single assignment is worth chasing
            extra credit on.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Limitations and double-checking
          </h3>
          <p>
            This calculator does not know about special rules like dropping the lowest
            quiz, replacing your midterm with your final if it is higher, or weighting
            lab sections differently from lecture. To account for those, you will need to
            adjust the points or percentages you enter so they match your instructor&apos;s
            policy. Always compare your calculations against what your school&apos;s
            learning management system shows, and ask your instructor if something looks
            off.
          </p>
          <p>
            If you are balancing grades with the rest of life, you might also find tools
            like the{" "}
            <Link
              href="/team-randomizer"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Team Randomizer
            </Link>{" "}
            helpful for group projects or the{" "}
            <Link
              href="/random-meal-generator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Random Meal Generator
            </Link>{" "}
            for deciding what to eat when you are studying late.
          </p>
          <p className="text-xs text-slate-600">
            Always treat this as an unofficial estimate. Your instructor, syllabus, and
            official gradebook are the final sources of truth for your course grade.
          </p>
        </div>
      </section>
    </div>
  );
}


