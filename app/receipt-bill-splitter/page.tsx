import type { Metadata } from "next";
import Link from "next/link";
import ReceiptBillSplitter from "@/components/ReceiptBillSplitter";

export const metadata: Metadata = {
  title: "Receipt Bill Splitter | LifeHackToolbox",
  description:
    "Quickly enter receipt items, assign them to people, and split the bill with tax and tip included. Everything runs in your browser."
};

export default function ReceiptBillSplitterPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Receipt Bill Splitter
        </h1>
        <p className="max-w-2xl text-base text-slate-700">
          Type in the items from a receipt, pick who ordered what, and split the bill
          between friends with tax and tip included. Everything runs in your browser, so
          no receipt images are uploaded anywhere.
        </p>
      </section>
      <ReceiptBillSplitter />
      <section
        aria-label="About splitting receipts"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Splitting a restaurant bill fairly without the headache
        </h2>
        <div className="space-y-3 text-sm text-slate-700">
          <p>
            Splitting a receipt sounds simple until you add in tax, tip, and different
            orders. One person ordered an appetizer and a drink, another only had a
            salad, and someone else picked up dessert for the table. Doing the math on
            a phone calculator, especially from a small paper slip, is awkward and easy
            to get wrong. A small mistake can mean someone overpays or a friend ends up
            covering more than their share.
          </p>
          <p>
            This tool is built to make that process less painful. You enter each dish or
            drink once, mark who it belongs to (or who is sharing it), and the app
            handles the tax and tip math. The goal is to make it easy to answer,
            &quot;Who owes what?&quot; without a long back-and-forth in your group chat.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            Why tax and tip matter when splitting fairly
          </h3>
          <p>
            If you simply split the pre-tax subtotal, people who ordered more expensive
            items end up paying a smaller share of the tax and tip than they actually
            generated. This calculator first figures out what each person&apos;s share
            of the pre-tax total is, then allocates tax and tip proportionally. That
            way, someone who only ordered a small dish is not paying the same add-on
            amounts as someone who had multiple entrees and drinks.
          </p>
          <h3 className="text-sm font-semibold text-slate-900">
            When a bill splitter is especially handy
          </h3>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <span className="font-medium">Dining out with friends.</span> Make sure
              people who order more (or drink more) pay their fair share without
              awkward conversations.
            </li>
            <li>
              <span className="font-medium">Work lunches or team outings.</span> Mark
              which items are reimbursable and see exactly what you personally owe.
            </li>
            <li>
              <span className="font-medium">Family meals.</span> Split groceries or
              restaurant tabs when some items belong to specific people.
            </li>
          </ul>
          <h3 className="text-sm font-semibold text-slate-900">
            Shareable summaries for your group chat
          </h3>
          <p>
            Once the math is done, the tool creates a simple text summary for each
            person that you can copy and paste directly into a messaging app. That makes
            it easy to say, for example, &quot;Alex: $23.40, Sam: $18.75, Taylor:
            $31.10&quot; without retyping numbers by hand.
          </p>
          <p className="text-xs text-slate-600">
            For other everyday math problems, you can head back to the{" "}
            <Link
              href="/"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              LifeHackToolbox homepage
            </Link>{" "}
            or use tools like the{" "}
            <Link
              href="/time-duration-calculator"
              className="font-medium text-emerald-700 hover:text-emerald-800"
            >
              Time Duration Calculator
            </Link>{" "}
            when you are coordinating plans and deadlines.
          </p>
        </div>
      </section>
    </div>
  );
}


