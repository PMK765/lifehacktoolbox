"use client";

import { useMemo, useState } from "react";

type ReceiptItemCategory = "Food" | "Drink" | "Other";

type ReceiptItem = {
  id: string;
  name: string;
  price: number;
  category: ReceiptItemCategory;
};

type ReceiptSummary = {
  subtotalFromReceipt?: number;
  taxFromReceipt?: number;
  totalFromReceipt?: number;
};

type Person = {
  id: string;
  name: string;
};

type SplitMode = "even" | "items";

type CalculatorState = {
  imageUrl: string | null;
  ocrText: string;
  isScanning: boolean;
  scanProgress: number;
  items: ReceiptItem[];
  summary: ReceiptSummary;
  people: Person[];
  splitMode: SplitMode;
  taxInput: string;
  taxRateInput: string;
  tipPercentInput: string;
  tipOnSubtotalOnly: boolean;
  assignments: Record<string, string[]>;
};

type PersonTotals = {
  person: Person;
  itemSubtotal: number;
  taxShare: number;
  tipShare: number;
  total: number;
};

const createId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Math.random());

const parseCurrencyLike = (raw: string) => {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) {
    return NaN;
  }
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? value : NaN;
};

const categorizeItem = (name: string): ReceiptItemCategory => {
  const lower = name.toLowerCase();
  const drinkKeywords = [
    "beer",
    "wine",
    "cocktail",
    "ipa",
    "lager",
    "mojito",
    "margarita",
    "soda",
    "coke",
    "pepsi",
    "drink",
    "ale"
  ];
  const foodKeywords = [
    "burger",
    "fries",
    "salad",
    "steak",
    "chicken",
    "pasta",
    "pizza",
    "taco",
    "burrito",
    "wings",
    "sandwich",
    "soup",
    "dessert",
    "entree",
    "appetizer"
  ];

  if (drinkKeywords.some((keyword) => lower.includes(keyword))) {
    return "Drink";
  }
  if (foodKeywords.some((keyword) => lower.includes(keyword))) {
    return "Food";
  }
  return "Other";
};

const parseReceiptText = (text: string): {
  items: ReceiptItem[];
  summary: ReceiptSummary;
} => {
  const lines = text.split(/\r?\n/);
  const items: ReceiptItem[] = [];
  const summary: ReceiptSummary = {};

  lines.forEach((rowRaw) => {
    const line = rowRaw.trim();
    if (!line) {
      return;
    }
    const upper = line.toUpperCase();
    const priceMatch = line.match(/(\d+(\.\d{1,2})?)\s*$/);
    if (!priceMatch) {
      return;
    }
    const priceValue = parseCurrencyLike(priceMatch[1]);
    if (!Number.isFinite(priceValue)) {
      return;
    }
    const labelPart = line.slice(0, priceMatch.index).trim();
    if (!labelPart) {
      return;
    }

    const isSubtotal = upper.includes("SUBTOTAL");
    const isTax = upper.includes("TAX");
    const isTotal =
      upper.includes("TOTAL") ||
      upper.includes("BALANCE DUE") ||
      upper.includes("AMOUNT DUE");

    if (isSubtotal) {
      summary.subtotalFromReceipt = priceValue;
      return;
    }
    if (isTax && !upper.includes("INCLUDE") && !upper.includes("EXCL")) {
      summary.taxFromReceipt = priceValue;
      return;
    }
    if (isTotal) {
      summary.totalFromReceipt = priceValue;
      return;
    }

    if (
      upper.includes("CHANGE") ||
      upper.includes("THANK") ||
      upper.includes("TIP")
    ) {
      return;
    }

    const cleanedName = labelPart.replace(/[.\-]+$/, "").trim();
    if (!cleanedName) {
      return;
    }

    items.push({
      id: createId(),
      name: cleanedName,
      price: priceValue,
      category: categorizeItem(cleanedName)
    });
  });

  return { items, summary };
};

const computeTotals = (
  state: CalculatorState
): {
  totals: PersonTotals[];
  totalItemSubtotal: number;
  totalTax: number;
  totalTip: number;
  unassignedAmount: number;
} => {
  const people = state.people;
  if (people.length === 0) {
    return {
      totals: [],
      totalItemSubtotal: 0,
      totalTax: 0,
      totalTip: 0,
      unassignedAmount: 0
    };
  }

  const totalItemSubtotal = state.items.reduce(
    (sum, item) => sum + (item.price > 0 ? item.price : 0),
    0
  );

  const subtotalsByPerson: Record<string, number> = {};
  people.forEach((person) => {
    subtotalsByPerson[person.id] = 0;
  });

  let unassignedAmount = 0;

  if (state.splitMode === "even") {
    const perPerson =
      people.length > 0 ? totalItemSubtotal / people.length : 0;
    people.forEach((person) => {
      subtotalsByPerson[person.id] = perPerson;
    });
  } else {
    state.items.forEach((item) => {
      const assigned = state.assignments[item.id] ?? [];
      if (assigned.length === 0) {
        unassignedAmount += item.price;
        return;
      }
      const share = item.price / assigned.length;
      assigned.forEach((personId) => {
        if (!subtotalsByPerson[personId]) {
          subtotalsByPerson[personId] = 0;
        }
        subtotalsByPerson[personId] += share;
      });
    });
  }

  let totalTax = 0;
  const manualTax = parseCurrencyLike(state.taxInput);
  if (Number.isFinite(manualTax) && manualTax >= 0) {
    totalTax = manualTax;
  } else if (
    state.summary.taxFromReceipt !== undefined &&
    state.summary.taxFromReceipt >= 0
  ) {
    totalTax = state.summary.taxFromReceipt;
  } else {
    const taxRate = parseCurrencyLike(state.taxRateInput);
    if (Number.isFinite(taxRate) && taxRate > 0) {
      totalTax = (taxRate / 100) * totalItemSubtotal;
    }
  }

  const tipPercent = parseCurrencyLike(state.tipPercentInput);
  const tipRate =
    Number.isFinite(tipPercent) && tipPercent > 0
      ? tipPercent / 100
      : 0;
  const tipBase = state.tipOnSubtotalOnly
    ? totalItemSubtotal
    : totalItemSubtotal + totalTax;
  const totalTip = tipBase * tipRate;

  const totals: PersonTotals[] = people.map((person) => {
    const personSubtotal = subtotalsByPerson[person.id] ?? 0;
    const weight =
      totalItemSubtotal > 0
        ? personSubtotal / totalItemSubtotal
        : 0;
    const personTax = weight * totalTax;
    const personTip = weight * totalTip;
    const personTotal = personSubtotal + personTax + personTip;
    return {
      person,
      itemSubtotal: personSubtotal,
      taxShare: personTax,
      tipShare: personTip,
      total: personTotal
    };
  });

  return {
    totals,
    totalItemSubtotal,
    totalTax,
    totalTip,
    unassignedAmount
  };
};

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2
});

const buildShareSummaryText = (totals: PersonTotals[]) => {
  if (totals.length === 0) {
    return "";
  }
  const lines = totals.map((entry) => {
    const name = entry.person.name || "Person";
    return `${name}: subtotal ${currencyFormatter.format(
      entry.itemSubtotal
    )}, tax ${currencyFormatter.format(
      entry.taxShare
    )}, tip ${currencyFormatter.format(
      entry.tipShare
    )}, total ${currencyFormatter.format(entry.total)}`;
  });
  return lines.join("\n");
};

export default function ReceiptBillSplitter() {
  const [state, setState] = useState<CalculatorState>({
    imageUrl: null,
    ocrText: "",
    isScanning: false,
    scanProgress: 0,
    items: [],
    summary: {},
    people: [
      { id: createId(), name: "Person 1" },
      { id: createId(), name: "Person 2" }
    ],
    splitMode: "even",
    taxInput: "",
    taxRateInput: "",
    tipPercentInput: "18",
    tipOnSubtotalOnly: false,
    assignments: {}
  });

  const [shareCopied, setShareCopied] = useState(false);

  const handleImageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      setState((previous) => ({
        ...previous,
        imageUrl: null
      }));
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setState((previous) => ({
      ...previous,
      imageUrl: objectUrl
    }));
  };

  const handleScan = async () => {
    if (!state.imageUrl) {
      return;
    }
    setState((previous) => ({
      ...previous,
      isScanning: true,
      scanProgress: 0,
      ocrText: ""
    }));
    const { default: Tesseract } = await import(
      "tesseract.js/dist/tesseract.min.js"
    );
    const result = await Tesseract.recognize(state.imageUrl, "eng", {
      logger: (message) => {
        if (message.status === "recognizing text") {
          setState((previous) => ({
            ...previous,
            scanProgress: message.progress ?? previous.scanProgress
          }));
        }
      }
    });
    const rawText = result.data.text;
    const parsed = parseReceiptText(rawText);

    setState((previous) => {
      const assignments: Record<string, string[]> = {};
      parsed.items.forEach((item) => {
        assignments[item.id] = previous.people.map(
          (person) => person.id
        );
      });
      return {
        ...previous,
        isScanning: false,
        scanProgress: 1,
        ocrText: rawText,
        items: parsed.items,
        summary: parsed.summary,
        taxInput:
          parsed.summary.taxFromReceipt !== undefined
            ? String(parsed.summary.taxFromReceipt)
            : previous.taxInput,
        assignments
      };
    });
  };

  const handleItemChange = (
    id: string,
    key: "name" | "price" | "category",
    value: string
  ) => {
    setState((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        item.id === id
          ? {
              ...item,
              name: key === "name" ? value : item.name,
              price:
                key === "price"
                  ? Number.parseFloat(value) || 0
                  : item.price,
              category:
                key === "category"
                  ? (value as ReceiptItemCategory)
                  : item.category
            }
          : item
      )
    }));
  };

  const handleAddItem = () => {
    const item: ReceiptItem = {
      id: createId(),
      name: "New item",
      price: 0,
      category: "Other"
    };
    setState((previous) => {
      const assignments = {
        ...previous.assignments,
        [item.id]: previous.people.map((person) => person.id)
      };
      return {
        ...previous,
        items: [...previous.items, item],
        assignments
      };
    });
  };

  const handleRemoveItem = (id: string) => {
    setState((previous) => {
      const assignments = { ...previous.assignments };
      delete assignments[id];
      return {
        ...previous,
        items: previous.items.filter((item) => item.id !== id),
        assignments
      };
    });
  };

  const handlePersonChange = (
    id: string,
    key: "name",
    value: string
  ) => {
    setState((previous) => ({
      ...previous,
      people: previous.people.map((person) =>
        person.id === id
          ? {
              ...person,
              name: value
            }
          : person
      )
    }));
  };

  const handleAddPerson = () => {
    const person: Person = {
      id: createId(),
      name: `Person ${state.people.length + 1}`
    };
    setState((previous) => {
      const assignments: Record<string, string[]> = {};
      Object.entries(previous.assignments).forEach(
        ([itemId, assigned]) => {
          assignments[itemId] = [...assigned, person.id];
        }
      );
      return {
        ...previous,
        people: [...previous.people, person],
        assignments
      };
    });
  };

  const handleRemovePerson = (id: string) => {
    setState((previous) => {
      if (previous.people.length <= 1) {
        return previous;
      }
      const people = previous.people.filter(
        (person) => person.id !== id
      );
      const assignments: Record<string, string[]> = {};
      Object.entries(previous.assignments).forEach(
        ([itemId, assigned]) => {
          assignments[itemId] = assigned.filter(
            (personId) => personId !== id
          );
        }
      );
      return {
        ...previous,
        people,
        assignments
      };
    });
  };

  const toggleAssignment = (itemId: string, personId: string) => {
    setState((previous) => {
      const existing = previous.assignments[itemId] ?? [];
      const isAssigned = existing.includes(personId);
      const next = isAssigned
        ? existing.filter((id) => id !== personId)
        : [...existing, personId];
      return {
        ...previous,
        assignments: {
          ...previous.assignments,
          [itemId]: next
        }
      };
    });
  };

  const totalsResult = useMemo(
    () => computeTotals(state),
    [state]
  );

  const handleCopyShare = () => {
    const text = buildShareSummaryText(totalsResult.totals);
    if (!text) {
      return;
    }
    if ("clipboard" in navigator) {
      navigator.clipboard.writeText(text).then(() => {
        setShareCopied(true);
        setTimeout(() => {
          setShareCopied(false);
        }, 2000);
      });
    }
  };

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const selectBaseClasses =
    "block w-full appearance-none rounded-md border border-slate-300 bg-white pl-3 pr-10 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500";

  return (
    <div className="space-y-8">
      <section
        aria-label="Upload receipt"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Step 1 · Upload receipt photo
        </h2>
        <p className="text-xs text-slate-600">
          Choose a clear photo or screenshot of your receipt. The image stays in your
          browser and is never uploaded to a server.
        </p>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="block w-full text-sm text-slate-800 file:mr-4 file:rounded-md file:border-0 file:bg-emerald-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-emerald-700 hover:file:bg-emerald-100"
            />
            {state.imageUrl && (
              <div className="mt-2 overflow-hidden rounded-md border border-slate-200 bg-slate-50">
                <img
                  src={state.imageUrl}
                  alt="Uploaded receipt preview"
                  className="mx-auto max-h-80 w-auto object-contain"
                />
              </div>
            )}
          </div>
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleScan}
              disabled={!state.imageUrl || state.isScanning}
              className={`inline-flex w-full items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
                !state.imageUrl || state.isScanning
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              {state.isScanning ? "Scanning receipt…" : "Scan receipt"}
            </button>
            {state.isScanning && (
              <div className="space-y-1">
                <div className="h-1 w-full overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-1 bg-emerald-500"
                    style={{
                      width: `${Math.round(
                        state.scanProgress * 100
                      )}%`
                    }}
                  />
                </div>
                <p className="text-xs text-slate-600">
                  OCR runs entirely in your browser. Large photos may take a few seconds.
                </p>
              </div>
            )}
            {!state.isScanning && !state.items.length && state.ocrText && (
              <p className="text-xs text-amber-700">
                No line items were detected automatically. You can add items manually
                below.
              </p>
            )}
          </div>
        </div>
      </section>
      <section
        aria-label="Receipt items"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Step 2 · Review items
          </h2>
          <button
            type="button"
            onClick={handleAddItem}
            className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
          >
            Add item
          </button>
        </div>
        <div className="overflow-auto rounded-md border border-slate-200">
          <table className="min-w-full divide-y divide-slate-200 text-xs">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Item
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">
                  Price
                </th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700">
                  Category
                </th>
                <th className="px-3 py-2 text-right font-semibold text-slate-700">
                  Remove
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {state.items.map((item) => (
                <tr key={item.id}>
                  <td className="whitespace-nowrap px-3 py-1">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(event) =>
                        handleItemChange(
                          item.id,
                          "name",
                          event.target.value
                        )
                      }
                      className={inputBaseClasses}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-1 text-right">
                    <input
                      type="number"
                      min={0}
                      step="0.01"
                      value={item.price}
                      onChange={(event) =>
                        handleItemChange(
                          item.id,
                          "price",
                          event.target.value
                        )
                      }
                      className={`${inputBaseClasses} text-right`}
                    />
                  </td>
                  <td className="whitespace-nowrap px-3 py-1">
                    <select
                      value={item.category}
                      onChange={(event) =>
                        handleItemChange(
                          item.id,
                          "category",
                          event.target.value
                        )
                      }
                      className={selectBaseClasses}
                    >
                      <option value="Food">Food</option>
                      <option value="Drink">Drink</option>
                      <option value="Other">Other</option>
                    </select>
                  </td>
                  <td className="whitespace-nowrap px-3 py-1 text-right">
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.id)}
                      className="inline-flex items-center rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
              {state.items.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-3 py-3 text-center text-xs text-slate-500"
                  >
                    No items yet. Scan a receipt or add items manually.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="grid gap-4 text-xs text-slate-700 md:grid-cols-3">
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">
              Receipt summary (parsed)
            </p>
            <p>
              Subtotal:{" "}
              {state.summary.subtotalFromReceipt !== undefined
                ? currencyFormatter.format(
                    state.summary.subtotalFromReceipt
                  )
                : "—"}
            </p>
            <p>
              Tax:{" "}
              {state.summary.taxFromReceipt !== undefined
                ? currencyFormatter.format(
                    state.summary.taxFromReceipt
                  )
                : "—"}
            </p>
            <p>
              Total:{" "}
              {state.summary.totalFromReceipt !== undefined
                ? currencyFormatter.format(
                    state.summary.totalFromReceipt
                  )
                : "—"}
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">
              Working totals (from items)
            </p>
            <p>
              Item subtotal:{" "}
              {currencyFormatter.format(
                totalsResult.totalItemSubtotal
              )}
            </p>
            <p>
              Tax used in split:{" "}
              {currencyFormatter.format(totalsResult.totalTax)}
            </p>
            <p>
              Tip: {currencyFormatter.format(totalsResult.totalTip)}
            </p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold text-slate-800">
              Tax inputs
            </p>
            <label className="space-y-1">
              <span className="text-[11px] font-medium text-slate-700">
                Tax amount (override)
              </span>
              <input
                type="number"
                min={0}
                step="0.01"
                value={state.taxInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    taxInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
              />
            </label>
            <label className="space-y-1">
              <span className="text-[11px] font-medium text-slate-700">
                Tax rate % (if amount empty)
              </span>
              <input
                type="number"
                min={0}
                step="0.1"
                value={state.taxRateInput}
                onChange={(event) =>
                  setState((previous) => ({
                    ...previous,
                    taxRateInput: event.target.value
                  }))
                }
                className={inputBaseClasses}
              />
            </label>
          </div>
        </div>
      </section>
      <section
        aria-label="People and split mode"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Step 3 · People &amp; split mode
        </h2>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">
              People
            </p>
            <div className="space-y-2">
              {state.people.map((person) => (
                <div
                  key={person.id}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={person.name}
                    onChange={(event) =>
                      handlePersonChange(
                        person.id,
                        "name",
                        event.target.value
                      )
                    }
                    className={inputBaseClasses}
                  />
                  <button
                    type="button"
                    onClick={() => handleRemovePerson(person.id)}
                    disabled={state.people.length <= 1}
                    className="inline-flex items-center rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50 disabled:cursor-not-allowed disabled:border-slate-200 disabled:text-slate-400"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddPerson}
              className="mt-2 inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 shadow-sm transition hover:border-slate-400"
            >
              Add person
            </button>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Split mode
            </p>
            <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    splitMode: "even"
                  }))
                }
                className={`px-3 py-1 ${
                  state.splitMode === "even"
                    ? "rounded-l-md bg-white font-semibold text-slate-900"
                    : "text-slate-700"
                }`}
              >
                Even split
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    splitMode: "items"
                  }))
                }
                className={`px-3 py-1 ${
                  state.splitMode === "items"
                    ? "rounded-r-md bg-white font-semibold text-slate-900"
                    : "text-slate-700"
                }`}
              >
                Split by item
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Even split divides everything equally. Item-based split lets you assign
              each line item to one or more people.
            </p>
          </div>
        </div>
        {state.splitMode === "items" && state.items.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Item assignments
            </p>
            <div className="overflow-auto rounded-md border border-slate-200">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-3 py-2 text-left font-semibold text-slate-700">
                      Item
                    </th>
                    {state.people.map((person) => (
                      <th
                        key={person.id}
                        className="px-3 py-2 text-center font-semibold text-slate-700"
                      >
                        {person.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {state.items.map((item) => (
                    <tr key={item.id}>
                      <td className="whitespace-nowrap px-3 py-1 text-slate-800">
                        {item.name}{" "}
                        <span className="text-slate-500">
                          ({currencyFormatter.format(item.price)})
                        </span>
                      </td>
                      {state.people.map((person) => {
                        const assigned =
                          state.assignments[item.id]?.includes(
                            person.id
                          ) ?? false;
                        return (
                          <td
                            key={person.id}
                            className="px-3 py-1 text-center"
                          >
                            <input
                              type="checkbox"
                              checked={assigned}
                              onChange={() =>
                                toggleAssignment(
                                  item.id,
                                  person.id
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                            />
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalsResult.unassignedAmount > 0 && (
              <p className="text-xs text-amber-700">
                Some items are not assigned to anyone. Unassigned amount:{" "}
                {currencyFormatter.format(
                  totalsResult.unassignedAmount
                )}
              </p>
            )}
          </div>
        )}
      </section>
      <section
        aria-label="Tax and tip"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
          Step 4 · Tax &amp; tip
        </h2>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Tip percent
            </p>
            <div className="flex flex-wrap items-center gap-2">
              {[15, 18, 20, 22].map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() =>
                    setState((previous) => ({
                      ...previous,
                      tipPercentInput: String(percent)
                    }))
                  }
                  className={`rounded-md border px-2 py-1 text-xs transition ${
                    Number.parseFloat(state.tipPercentInput) ===
                    percent
                      ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                  }`}
                >
                  {percent}%
                </button>
              ))}
              <div className="flex items-center gap-1 text-xs">
                <span>Custom</span>
                <input
                  type="number"
                  min={0}
                  step="0.5"
                  value={state.tipPercentInput}
                  onChange={(event) =>
                    setState((previous) => ({
                      ...previous,
                      tipPercentInput: event.target.value
                    }))
                  }
                  className="w-16 rounded-md border border-slate-300 bg-white px-2 py-1 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
                <span>%</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-medium text-slate-700">
              Tip base
            </p>
            <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    tipOnSubtotalOnly: true
                  }))
                }
                className={`px-3 py-1 ${
                  state.tipOnSubtotalOnly
                    ? "rounded-l-md bg-white font-semibold text-slate-900"
                    : "text-slate-700"
                }`}
              >
                Subtotal only
              </button>
              <button
                type="button"
                onClick={() =>
                  setState((previous) => ({
                    ...previous,
                    tipOnSubtotalOnly: false
                  }))
                }
                className={`px-3 py-1 ${
                  !state.tipOnSubtotalOnly
                    ? "rounded-r-md bg-white font-semibold text-slate-900"
                    : "text-slate-700"
                }`}
              >
                Subtotal + tax
              </button>
            </div>
            <p className="text-xs text-slate-600">
              Some groups tip on the full check including tax; others tip on food and
              drink only. Choose what matches your group&apos;s norm.
            </p>
          </div>
        </div>
      </section>
      <section
        aria-label="Results"
        className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
      >
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Step 5 · Per-person results
          </h2>
          <button
            type="button"
            onClick={handleCopyShare}
            disabled={!totalsResult.totals.length}
            className={`inline-flex items-center rounded-md border px-3 py-1.5 text-xs font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ${
              totalsResult.totals.length
                ? "border-emerald-500 bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                : "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
            }`}
          >
            {shareCopied ? "Copied!" : "Copy share summary"}
          </button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {totalsResult.totals.map((entry) => (
            <div
              key={entry.person.id}
              className="space-y-1 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800"
            >
              <p className="text-base font-semibold">
                {entry.person.name || "Person"}
              </p>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Item subtotal
              </p>
              <p>{currencyFormatter.format(entry.itemSubtotal)}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Tax share
              </p>
              <p>{currencyFormatter.format(entry.taxShare)}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Tip share
              </p>
              <p>{currencyFormatter.format(entry.tipShare)}</p>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total
              </p>
              <p className="text-base font-semibold text-emerald-800">
                {currencyFormatter.format(entry.total)}
              </p>
            </div>
          ))}
          {totalsResult.totals.length === 0 && (
            <p className="text-xs text-slate-600">
              Add at least one item and one person to see the split results.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}


