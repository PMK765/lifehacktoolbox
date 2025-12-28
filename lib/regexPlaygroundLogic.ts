export type RegexPreset = {
  id: "email" | "url" | "phone" | "date_iso" | "csv_line";
  name: string;
  pattern: string;
  flags: string;
  description: string;
};

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: "email",
    name: "Email (simple)",
    pattern: "[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}",
    flags: "gi",
    description:
      "A pragmatic email matcher for typical addresses. Not a full RFC 5322 validator."
  },
  {
    id: "url",
    name: "URL (http/https)",
    pattern:
      "https?:\\/\\/(?:www\\.)?[A-Za-z0-9.-]+\\.[A-Za-z]{2,}(?:\\/[\\w\\-._~%!$&'()*+,;=:@/]*)?",
    flags: "gi",
    description:
      "Matches common http/https URLs. Great for extracting links from text."
  },
  {
    id: "phone",
    name: "Phone (US-ish)",
    pattern:
      "(?:\\+?1[\\s.-]?)?(?:\\(\\d{3}\\)|\\d{3})[\\s.-]?\\d{3}[\\s.-]?\\d{4}",
    flags: "g",
    description:
      "Matches typical US phone formats like (555) 123-4567 or 555-123-4567."
  },
  {
    id: "date_iso",
    name: "Date (YYYY-MM-DD)",
    pattern: "\\b\\d{4}-\\d{2}-\\d{2}\\b",
    flags: "g",
    description:
      "Extracts ISO-ish dates like 2025-12-28. Does not validate month/day ranges."
  },
  {
    id: "csv_line",
    name: "CSV line (simple)",
    pattern: "^(?:\"[^\"]*\"|[^,]*)(?:,(?:\"[^\"]*\"|[^,]*))*$",
    flags: "m",
    description:
      "Matches a basic CSV row with optional quoted fields. Useful for quick checks."
  }
];

const isDigit = (ch: string): boolean => ch >= "0" && ch <= "9";

const isValidFlags = (flags: string): boolean => {
  const allowed = new Set(["g", "i", "m", "s", "u"]);
  const seen = new Set<string>();
  for (const ch of flags) {
    if (!allowed.has(ch)) return false;
    if (seen.has(ch)) return false;
    seen.add(ch);
  }
  return true;
};

export type RegexValidation =
  | { ok: true }
  | { ok: false; message: string };

type ScanState = {
  inCharClass: boolean;
  escape: boolean;
  parenDepth: number;
  braceDepth: number;
};

const validateQuantifierBody = (body: string): boolean => {
  const trimmed = body.trim();
  if (!trimmed) return false;
  const parts = trimmed.split(",");
  if (parts.length > 2) return false;
  const parsePart = (p: string): number | null => {
    const t = p.trim();
    if (!t) return null;
    for (const ch of t) {
      if (!isDigit(ch)) return null;
    }
    const v = Number(t);
    return Number.isFinite(v) ? v : null;
  };
  const a = parsePart(parts[0]);
  if (a === null) return false;
  if (parts.length === 1) return true;
  const b = parsePart(parts[1]);
  if (b === null) return true;
  return a <= b;
};

export const validateRegexSubset = (pattern: string, flags: string): RegexValidation => {
  if (!isValidFlags(flags)) {
    return { ok: false, message: "Invalid flags. Allowed: g i m s u (no duplicates)." };
  }

  const p = pattern;
  if (p.length === 0) {
    return { ok: false, message: "Enter a pattern." };
  }

  const state: ScanState = {
    inCharClass: false,
    escape: false,
    parenDepth: 0,
    braceDepth: 0
  };

  for (let i = 0; i < p.length; i += 1) {
    const ch = p[i];
    if (state.escape) {
      state.escape = false;
      continue;
    }
    if (ch === "\\") {
      state.escape = true;
      continue;
    }
    if (state.inCharClass) {
      if (ch === "]") {
        state.inCharClass = false;
      }
      continue;
    }
    if (ch === "[") {
      state.inCharClass = true;
      continue;
    }
    if (ch === "(") {
      state.parenDepth += 1;
      continue;
    }
    if (ch === ")") {
      state.parenDepth -= 1;
      if (state.parenDepth < 0) {
        return { ok: false, message: "Unmatched ')'." };
      }
      continue;
    }
    if (ch === "{") {
      const closeIdx = p.indexOf("}", i + 1);
      if (closeIdx === -1) {
        return { ok: false, message: "Unmatched '{'." };
      }
      const body = p.slice(i + 1, closeIdx);
      if (!validateQuantifierBody(body)) {
        return { ok: false, message: "Invalid quantifier. Use {m} or {m,n} with digits." };
      }
      i = closeIdx;
      continue;
    }
    if (ch === "}") {
      return { ok: false, message: "Unmatched '}'." };
    }

    if (ch === "?") {
      const prev = p[i - 1];
      if (prev === "(") {
        const next = p[i + 1] ?? "";
        if (next === ":" || next === "=" || next === "!") {
          continue;
        }
        return { ok: false, message: "Unsupported group syntax. Use (?:...) for non-capturing groups." };
      }
    }

    if (ch === "+" || ch === "*" || ch === "?") {
      const prev = p[i - 1];
      if (!prev || prev === "|" || prev === "(") {
        return { ok: false, message: `Quantifier "${ch}" must follow a token.` };
      }
    }
  }

  if (state.escape) {
    return { ok: false, message: "Pattern ends with an unfinished escape (\\)." };
  }
  if (state.inCharClass) {
    return { ok: false, message: "Unmatched '[' (character class not closed)." };
  }
  if (state.parenDepth !== 0) {
    return { ok: false, message: "Unmatched '(' (group not closed)." };
  }

  return { ok: true };
};

export type TokenExplanation = {
  token: string;
  meaning: string;
};

export const explainRegexTokens = (pattern: string): TokenExplanation[] => {
  const p = pattern;
  const out: TokenExplanation[] = [];
  let i = 0;
  let inCharClass = false;
  while (i < p.length) {
    const ch = p[i];
    if (ch === "\\") {
      const next = p[i + 1] ?? "";
      const token = `\\${next}`;
      const meaning =
        next === "d"
          ? "Digit (0–9)"
          : next === "D"
          ? "Non-digit"
          : next === "w"
          ? "Word character (letters, digits, underscore)"
          : next === "W"
          ? "Non-word character"
          : next === "s"
          ? "Whitespace"
          : next === "S"
          ? "Non-whitespace"
          : next === "b"
          ? "Word boundary"
          : next === "B"
          ? "Not a word boundary"
          : "Escaped character";
      out.push({ token, meaning });
      i += next ? 2 : 1;
      continue;
    }
    if (ch === "[") {
      inCharClass = true;
      out.push({ token: "[...]", meaning: "Character class (match one of the listed characters)" });
      i += 1;
      continue;
    }
    if (ch === "]") {
      inCharClass = false;
      i += 1;
      continue;
    }
    if (inCharClass) {
      i += 1;
      continue;
    }
    if (ch === ".") {
      out.push({ token: ".", meaning: "Any character (except newline unless /s flag)" });
      i += 1;
      continue;
    }
    if (ch === "^") {
      out.push({ token: "^", meaning: "Start of string/line (line with /m)" });
      i += 1;
      continue;
    }
    if (ch === "$") {
      out.push({ token: "$", meaning: "End of string/line (line with /m)" });
      i += 1;
      continue;
    }
    if (ch === "+") {
      out.push({ token: "+", meaning: "One or more of the previous token" });
      i += 1;
      continue;
    }
    if (ch === "*") {
      out.push({ token: "*", meaning: "Zero or more of the previous token" });
      i += 1;
      continue;
    }
    if (ch === "?") {
      out.push({ token: "?", meaning: "Zero or one of the previous token (optional)" });
      i += 1;
      continue;
    }
    if (ch === "{") {
      const closeIdx = p.indexOf("}", i + 1);
      const token = closeIdx !== -1 ? p.slice(i, closeIdx + 1) : "{...}";
      out.push({ token, meaning: "Quantity: exactly m, or between m and n times" });
      i += closeIdx !== -1 ? closeIdx - i + 1 : 1;
      continue;
    }
    if (ch === "(") {
      if (p.slice(i, i + 3) === "(?:") {
        out.push({ token: "(?: ... )", meaning: "Non-capturing group" });
      } else {
        out.push({ token: "( ... )", meaning: "Capturing group" });
      }
      i += 1;
      continue;
    }
    if (ch === "|") {
      out.push({ token: "|", meaning: "Alternation (OR)" });
      i += 1;
      continue;
    }
    i += 1;
  }

  const seen = new Set<string>();
  return out.filter((e) => {
    const key = `${e.token}::${e.meaning}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

export type RegexMatchRow = {
  index: number;
  match: string;
  groups: string[];
};

export const buildShareUrl = (baseUrl: string, pattern: string, flags: string, text: string): string => {
  const params = new URLSearchParams();
  params.set("pattern", pattern);
  params.set("flags", flags);
  if (text.trim().length > 0 && text.length <= 2000) {
    params.set("text", text);
  }
  return `${baseUrl}?${params.toString()}`;
};


