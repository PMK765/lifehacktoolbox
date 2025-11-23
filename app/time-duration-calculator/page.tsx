import type { Metadata } from "next";
import Link from "next/link";
import TimeDurationCalculator from "@/components/TimeDurationCalculator";

export const metadata: Metadata = {
  title: "Time Duration Calculator | LifeHackToolbox",
  description:
    "Calculate the time between two dates or add and subtract days, hours, minutes, and seconds from a specific date and time."
};

export default function TimeDurationCalculatorPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Time Duration Calculator
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Switch between finding the difference between two dates/times and adding or
          subtracting a duration from a specific date. Everything stays in your local
          timezone for straightforward planning.
        </p>
        <p className="max-w-2xl text-xs text-slate-600">
          This is a convenience tool for everyday scheduling and planning. For legal or
          contractual timing, always confirm requirements around business days, time
          zones, and daylight saving rules.
        </p>
      </section>
      <TimeDurationCalculator />
      <section
        aria-label="How to use the time duration calculator"
        className="space-y-4 border-t border-slate-200 pt-6"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          When a time duration calculator is actually useful
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Time math looks simple until you actually have to do it under pressure. You
            might be trying to see how long a trip lasted, how many days you have
            between two deadlines, or what date lands exactly 30 days after a project
            kickoff. This calculator focuses on those everyday questions: how much time
            is between A and B, or what does A plus a certain duration look like.
          </p>
          <p>
            In difference mode, you enter a start and end date (and optionally times) and
            get a breakdown in days, hours, minutes, and seconds, along with total hours,
            minutes, and seconds. In add/subtract mode, you pick a base date and tell the
            tool how many days, hours, minutes, and seconds to move forward or backward.
            The result is shown with day of week, which makes it easier to reason about
            things like weekend boundaries or weekday meetings.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Calendar days vs. hours, minutes, and seconds
          </h3>
          <p>
            A calendar day is not just 24 hours on a clock—it is also a specific date on
            the calendar. For many practical questions, you only care about whole days:
            how many nights you are renting a place, how many days you have to finish a
            task, or how many days remain until an event. Other times, the exact time of
            day matters, such as overlapping shifts, streaming schedules, or timed exams.
          </p>
          <p>
            This calculator reports both the full day/hour/minute/second breakdown and
            total hours/minutes/seconds. That way, you can quickly say “this is about
            three days and four hours” or “roughly 76.2 hours” depending on which is more
            intuitive for your use case.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Time zones, blank times, and negative durations
          </h3>
          <p>
            Time zones and daylight saving shifts can make cross-border scheduling messy.
            To keep things predictable, this tool always works in your browser&apos;s
            local timezone and does not attempt to adjust for other zones. Blank time
            fields are treated as midnight (00:00), which keeps the math simple for
            tasks like “days until” or “how many days apart”.
          </p>
          <p>
            If you put the end time before the start time in difference mode, the tool
            still calculates the length of the gap but marks it as a negative duration.
            This is handy when you are curious how far in the past or future a date is
            relative to another anchor, even if the order is reversed.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Examples of where this helps
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Trip planning.</span> Count the exact days
              and hours between departure and return to estimate costs or recovery time.
            </li>
            <li>
              <span className="font-medium">Project timelines.</span> From a kickoff date,
              add a certain number of days and hours to see realistic handoff points.
            </li>
            <li>
              <span className="font-medium">Content and reminders.</span> Pick a base
              posting date and add or subtract durations to schedule recurring tasks.
            </li>
          </ul>
          <p className="text-xs text-slate-600">
            For anything involving legal contracts, compliance, or time zones across
            regions, use this tool only as a rough guide and confirm details with official
            sources or your legal team. Daylight saving changes and jurisdiction-specific
            rules can affect exact cutoffs.
          </p>
        </div>
      </section>
    </div>
  );
}


