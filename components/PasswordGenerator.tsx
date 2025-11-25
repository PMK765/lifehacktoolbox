"use client";

import { useEffect, useRef, useState } from "react";
import ExportableImageFrame from "@/components/ExportableImageFrame";

type PasswordHistoryItem = {
  id: string;
  value: string;
  createdAt: string;
};

type StrengthLevel = "weak" | "medium" | "strong" | "very-strong";

type StrengthInfo = {
  level: StrengthLevel;
  label: string;
  score: number;
};

const STORAGE_KEY = "lht_password_generator_v1";

const createId = () => {
  const random = Math.random().toString(36).slice(2, 10);
  const time = Date.now().toString(36);
  return `${time}-${random}`;
};

const formatTimestamp = (iso: string) => {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return iso;
  }
  return date.toLocaleString();
};

const getRandomInt = (maxExclusive: number) => {
  if (maxExclusive <= 0) {
    return 0;
  }
  if (typeof crypto !== "undefined" && "getRandomValues" in crypto) {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % maxExclusive;
  }
  return Math.floor(Math.random() * maxExclusive);
};

const computeStrength = (
  length: number,
  classesUsed: number
): StrengthInfo => {
  let score = 0;
  if (length >= 8) {
    score += 1;
  }
  if (length >= 12) {
    score += 1;
  }
  if (length >= 16) {
    score += 1;
  }
  if (classesUsed >= 2) {
    score += 1;
  }
  if (classesUsed >= 3) {
    score += 1;
  }
  if (classesUsed === 4) {
    score += 1;
  }

  if (score <= 2) {
    return { level: "weak", label: "Weak", score: 1 };
  }
  if (score <= 4) {
    return { level: "medium", label: "Medium", score: 2 };
  }
  if (score <= 5) {
    return { level: "strong", label: "Strong", score: 3 };
  }
  return { level: "very-strong", label: "Very strong", score: 4 };
};

const PasswordGenerator = () => {
  const [length, setLength] = useState(16);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [excludeAmbiguous, setExcludeAmbiguous] = useState(true);
  const [password, setPassword] = useState("");
  const [strength, setStrength] = useState<StrengthInfo>({
    level: "weak",
    label: "Weak",
    score: 1
  });
  const [history, setHistory] = useState<PasswordHistoryItem[]>([]);
  const [copied, setCopied] = useState(false);
  const [exportMessage, setExportMessage] = useState<string | null>(null);

  const frameRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }
    const parsed = JSON.parse(raw) as PasswordHistoryItem[];
    if (Array.isArray(parsed)) {
      setHistory(parsed);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    if (history.length === 0) {
      return;
    }
    const serialized = JSON.stringify(history);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }, [history]);

  const buildCharacterSets = () => {
    const ambiguous = new Set(["0", "O", "o", "1", "l", "I"]);
    const upperBase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const lowerBase = "abcdefghijklmnopqrstuvwxyz";
    const numberBase = "0123456789";
    const symbolBase = "!@#$%^&*?-_=+[]{}()";

    const filtered = (source: string) =>
      excludeAmbiguous
        ? Array.from(source).filter((character) => !ambiguous.has(character))
        : Array.from(source);

    const sets: { id: string; chars: string[] }[] = [];
    if (includeUppercase) {
      sets.push({ id: "upper", chars: filtered(upperBase) });
    }
    if (includeLowercase) {
      sets.push({ id: "lower", chars: filtered(lowerBase) });
    }
    if (includeNumbers) {
      sets.push({ id: "number", chars: filtered(numberBase) });
    }
    if (includeSymbols) {
      sets.push({ id: "symbol", chars: filtered(symbolBase) });
    }
    return sets.filter((set) => set.chars.length > 0);
  };

  const handleGenerate = () => {
    const sets = buildCharacterSets();
    if (sets.length === 0) {
      return;
    }
    const allChars = sets.flatMap((set) => set.chars);
    if (allChars.length === 0) {
      return;
    }

    const result: string[] = [];

    sets.forEach((set) => {
      const index = getRandomInt(set.chars.length);
      result.push(set.chars[index]);
    });

    while (result.length < length) {
      const index = getRandomInt(allChars.length);
      result.push(allChars[index]);
    }

    for (let index = result.length - 1; index > 0; index -= 1) {
      const swapIndex = getRandomInt(index + 1);
      const temp = result[index];
      result[index] = result[swapIndex];
      result[swapIndex] = temp;
    }

    const generated = result.join("");
    setPassword(generated);

    const classesUsed = sets.length;
    setStrength(computeStrength(length, classesUsed));

    const item: PasswordHistoryItem = {
      id: createId(),
      value: generated,
      createdAt: new Date().toISOString()
    };
    setHistory((previous) => {
      const next = [item, ...previous];
      if (next.length > 10) {
        return next.slice(0, 10);
      }
      return next;
    });
  };

  const handleCopy = async (value: string) => {
    if (!value.trim()) {
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  };

  const handleExportPng = async () => {
    if (!frameRef.current) {
      return;
    }
    const { default: html2canvas } = await import("html2canvas");
    const canvas = await html2canvas(frameRef.current, {
      backgroundColor: "#ffffff",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = "lifehacktoolbox-password.png";
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setExportMessage("PNG downloaded.");
      window.setTimeout(() => {
        setExportMessage(null);
      }, 2000);
    });
  };

  const strengthColor =
    strength.level === "weak"
      ? "bg-red-500"
      : strength.level === "medium"
      ? "bg-amber-500"
      : strength.level === "strong"
      ? "bg-emerald-500"
      : "bg-emerald-700";

  const strengthWidth =
    strength.score === 1
      ? "w-1/4"
      : strength.score === 2
      ? "w-2/4"
      : strength.score === 3
      ? "w-3/4"
      : "w-full";

  const disableGenerate =
    !includeUppercase &&
    !includeLowercase &&
    !includeNumbers &&
    !includeSymbols;

  const inputClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Passwords are generated only in this browser.
        </p>
        <p>
          Generated passwords are not sent anywhere and history is stored only
          in this browser using local storage. You are responsible for saving
          them in a password manager or secure location.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Settings
          </h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-700">
                  Length:{" "}
                  <span className="font-semibold text-slate-900">
                    {length}
                  </span>
                </label>
                <span className="text-[11px] text-slate-500">
                  8–64 characters
                </span>
              </div>
              <input
                type="range"
                min={8}
                max={64}
                value={length}
                onChange={(event) =>
                  setLength(Number.parseInt(event.target.value, 10) || 8)
                }
                className="w-full accent-emerald-600"
              />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeUppercase}
                  onChange={(event) =>
                    setIncludeUppercase(event.target.checked)
                  }
                  className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                />
                <span>Include uppercase (A–Z)</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeLowercase}
                  onChange={(event) =>
                    setIncludeLowercase(event.target.checked)
                  }
                  className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                />
                <span>Include lowercase (a–z)</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeNumbers}
                  onChange={(event) =>
                    setIncludeNumbers(event.target.checked)
                  }
                  className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                />
                <span>Include numbers (0–9)</span>
              </label>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeSymbols}
                  onChange={(event) =>
                    setIncludeSymbols(event.target.checked)
                  }
                  className="h-3 w-3 rounded border-slate-300 text-emerald-600"
                />
                <span>Include symbols (! @ # $ % ^ &amp; * ?)</span>
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={excludeAmbiguous}
                onChange={(event) =>
                  setExcludeAmbiguous(event.target.checked)
                }
                className="h-3 w-3 rounded border-slate-300 text-emerald-600"
              />
              <span>Exclude ambiguous characters (0/O, 1/l/I)</span>
            </label>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={handleGenerate}
              disabled={disableGenerate}
              className={`inline-flex items-center rounded-md px-4 py-2 text-xs font-semibold shadow-sm ${
                disableGenerate
                  ? "cursor-not-allowed bg-slate-200 text-slate-500"
                  : "bg-emerald-600 text-white hover:bg-emerald-700"
              }`}
            >
              Generate password
            </button>
            <button
              type="button"
              onClick={() => handleCopy(password)}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <div className="space-y-2 text-xs text-slate-600">
            <p className="font-semibold text-slate-800">
              Quick safety notes
            </p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Use a password manager to store generated passwords.</li>
              <li>
                Do not reuse the same strong password across multiple sites.
              </li>
              <li>
                For extremely sensitive accounts, use two-factor authentication
                in addition to a strong password.
              </li>
            </ul>
          </div>
        </section>
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Password preview
              </h2>
              <p className="text-[11px] text-slate-600">
                This panel shows your latest generated password. Use the copy
                button or export a branded PNG if you want to share it securely
                with another person.
              </p>
            </div>
            <button
              type="button"
              onClick={handleExportPng}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Download as PNG
            </button>
          </div>
          {exportMessage && (
            <p className="text-[11px] text-emerald-700">{exportMessage}</p>
          )}
          <div ref={frameRef}>
            <ExportableImageFrame title="Random password">
              <div className="space-y-3">
                <div className="rounded-md border border-slate-200 bg-slate-50 px-4 py-6 text-center">
                  <p className="truncate font-mono text-lg text-slate-900 sm:text-xl">
                    {password || "Generate a password to see it here"}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-600">
                    Estimated strength
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-full rounded-full bg-slate-200">
                      <div
                        className={`h-1.5 rounded-full ${strengthColor} ${strengthWidth}`}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-slate-800">
                      {strength.label}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500">
                    This estimate is based on length and character variety only.
                    Real security also depends on where and how you store this
                    password.
                  </p>
                </div>
              </div>
            </ExportableImageFrame>
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              Recent passwords (this device only)
            </h3>
            <div className="max-h-52 overflow-auto rounded-md border border-slate-200 bg-slate-50">
              <ul className="divide-y divide-slate-200 text-xs">
                {history.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between gap-2 px-3 py-2"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-mono text-[11px] text-slate-900">
                        {item.value}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {formatTimestamp(item.createdAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(item.value)}
                      className="whitespace-nowrap rounded-md border border-slate-300 bg-white px-2 py-1 text-[10px] font-medium text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
                    >
                      Copy
                    </button>
                  </li>
                ))}
                {history.length === 0 && (
                  <li className="px-3 py-3 text-[11px] text-slate-500">
                    Generate passwords to build a short history here. History is
                    stored only in this browser and is not synced anywhere.
                  </li>
                )}
              </ul>
            </div>
          </div>
        </section>
      </div>
      <section className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">
          How this password generator works in your browser
        </h2>
        <p className="mt-2">
          This random password generator builds passwords entirely in your
          browser using JavaScript. It never sends your selections or generated
          values to a server. You can choose the length, toggle character
          classes such as uppercase, lowercase, numbers, and symbols, and
          optionally remove ambiguous characters like 0/O and 1/l/I to make
          copied passwords easier to read.
        </p>
        <p className="mt-2">
          The strength meter is a simple heuristic that looks at both length and
          character variety. Longer passwords that use more character classes
          generally get a higher score. It is not a cryptographic audit, but it
          gives you a quick sense of whether you are in the &quot;weak&quot;,
          &quot;strong&quot;, or &quot;very strong&quot; range compared with
          common guidance.
        </p>
        <p className="mt-2">
          For best results, pair this generator with a dedicated password
          manager. That way, you can use long, unique passwords for every
          account without needing to memorize them. Avoid reusing the same
          password across multiple sites. When possible, enable two-factor
          authentication so that a stolen password alone is not enough to log
          in.
        </p>
        <p className="mt-2">
          LifeHackToolbox keeps everything privacy-first. The password history
          panel stores only the last few passwords in your local storage, which
          never leaves your device. If you clear your browser data or switch
          devices, that history disappears. For sharing specific secrets you
          might also use tools like the{" "}
          <a
            href="/qr-code-generator"
            className="font-medium text-emerald-700 hover:text-emerald-800"
          >
            QR Code Generator
          </a>{" "}
          to encode short tokens into scannable codes without leaving the
          browser.
        </p>
        <p className="mt-2">
          This password generator fits alongside other simple utilities on
          LifeHackToolbox that run 100% client-side. Whether you are creating
          secure passwords, linting JSON, or generating QR codes, the goal is
          the same: fast, focused tools that do one job well and respect your
          data.
        </p>
      </section>
    </div>
  );
};

export default PasswordGenerator;


