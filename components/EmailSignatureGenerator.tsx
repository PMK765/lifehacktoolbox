"use client";

import { useEffect, useRef, useState } from "react";
import ExportableImageFrame from "@/components/ExportableImageFrame";

type LayoutStyle = "horizontal" | "vertical" | "compact";

type ThemeId = "clean" | "modern" | "minimal" | "corporate-blue";

type SignatureInputs = {
  fullName: string;
  jobTitle: string;
  company: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  linkedIn: string;
  github: string;
  instagram: string;
  facebook: string;
  twitter: string;
  logoDataUrl: string | null;
};

type ThemeConfig = {
  id: ThemeId;
  label: string;
  accentColor: string;
  textColor: string;
  mutedColor: string;
  borderColor: string;
  nameSize: number;
  bodySize: number;
};

type StoredState = {
  inputs: SignatureInputs;
  layout: LayoutStyle;
  themeId: ThemeId;
};

const STORAGE_KEY = "lht_email_signature_generator_v1";

const THEMES: ThemeConfig[] = [
  {
    id: "clean",
    label: "Clean",
    accentColor: "#0f766e",
    textColor: "#0f172a",
    mutedColor: "#64748b",
    borderColor: "#e2e8f0",
    nameSize: 16,
    bodySize: 12
  },
  {
    id: "modern",
    label: "Modern",
    accentColor: "#6366f1",
    textColor: "#020617",
    mutedColor: "#6b7280",
    borderColor: "#e5e7eb",
    nameSize: 17,
    bodySize: 12
  },
  {
    id: "minimal",
    label: "Minimal",
    accentColor: "#0f172a",
    textColor: "#0f172a",
    mutedColor: "#6b7280",
    borderColor: "#f1f5f9",
    nameSize: 15,
    bodySize: 11
  },
  {
    id: "corporate-blue",
    label: "Corporate blue",
    accentColor: "#2563eb",
    textColor: "#111827",
    mutedColor: "#4b5563",
    borderColor: "#dbeafe",
    nameSize: 16,
    bodySize: 12
  }
];

const createDefaultInputs = (): SignatureInputs => ({
  fullName: "",
  jobTitle: "",
  company: "",
  phone: "",
  email: "",
  website: "",
  address: "",
  linkedIn: "",
  github: "",
  instagram: "",
  facebook: "",
  twitter: "",
  logoDataUrl: null
});

const sanitizeHtml = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const buildHtmlSignature = (
  inputs: SignatureInputs,
  layout: LayoutStyle,
  theme: ThemeConfig
) => {
  const fontFamily =
    "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif";

  const name = sanitizeHtml(inputs.fullName);
  const jobTitle = sanitizeHtml(inputs.jobTitle);
  const company = sanitizeHtml(inputs.company);
  const phone = sanitizeHtml(inputs.phone);
  const email = sanitizeHtml(inputs.email);
  const website = sanitizeHtml(inputs.website);
  const address = sanitizeHtml(inputs.address);
  const linkedIn = sanitizeHtml(inputs.linkedIn);
  const github = sanitizeHtml(inputs.github);
  const instagram = sanitizeHtml(inputs.instagram);
  const facebook = sanitizeHtml(inputs.facebook);
  const twitter = sanitizeHtml(inputs.twitter);

  const lines: string[] = [];
  lines.push("<table cellpadding=\"0\" cellspacing=\"0\" style=\"border-collapse:collapse;font-family:" + fontFamily + ";font-size:" + theme.bodySize + "px;color:" + theme.textColor + ";\">");
  lines.push("<tr>");

  if (layout === "horizontal" && inputs.logoDataUrl) {
    lines.push(
      "<td style=\"padding-right:16px;vertical-align:middle;\">"
    );
    lines.push(
      "<img src=\"" +
        inputs.logoDataUrl +
        "\" alt=\"Logo\" style=\"max-width:72px;max-height:72px;border-radius:4px;display:block;\" />"
    );
    lines.push("</td>");
  }

  lines.push("<td style=\"padding:8px 0;border-left:4px solid " + theme.accentColor + ";padding-left:16px;\">");
  lines.push(
    "<div style=\"font-weight:600;font-size:" +
      theme.nameSize +
      "px;color:" +
      theme.textColor +
      ";margin-bottom:2px;\">" +
      name +
      "</div>"
  );
  if (jobTitle || company) {
    const pieces = [];
    if (jobTitle) {
      pieces.push(jobTitle);
    }
    if (company) {
      pieces.push(company);
    }
    lines.push(
      "<div style=\"color:" +
        theme.mutedColor +
        ";margin-bottom:4px;\">" +
        pieces.join(" | ") +
        "</div>"
    );
  }

  if (phone || email || website) {
    lines.push(
      "<div style=\"margin-bottom:4px;color:" +
        theme.textColor +
        ";\">"
    );
    const contactParts: string[] = [];
    if (phone) {
      contactParts.push("☎ " + phone);
    }
    if (email) {
      contactParts.push(
        "✉ <a href=\"mailto:" +
          email +
          "\" style=\"color:" +
          theme.accentColor +
          ";text-decoration:none;\">" +
          email +
          "</a>"
      );
    }
    if (website) {
      const display = website.replace(/^https?:\/\//i, "");
      contactParts.push(
        "🌐 <a href=\"" +
          website +
          "\" style=\"color:" +
          theme.accentColor +
          ";text-decoration:none;\">" +
          display +
          "</a>"
      );
    }
    lines.push(contactParts.join(" &nbsp;•&nbsp; "));
    lines.push("</div>");
  }

  if (address) {
    lines.push(
      "<div style=\"color:" +
        theme.mutedColor +
        ";margin-bottom:4px;\">" +
        address +
        "</div>"
    );
  }

  const socialParts: string[] = [];
  if (linkedIn) {
    socialParts.push(
      "<a href=\"" +
        linkedIn +
        "\" style=\"color:" +
        theme.accentColor +
        ";text-decoration:none;\">LinkedIn</a>"
    );
  }
  if (github) {
    socialParts.push(
      "<a href=\"" +
        github +
        "\" style=\"color:" +
        theme.accentColor +
        ";text-decoration:none;\">GitHub</a>"
    );
  }
  if (instagram) {
    socialParts.push(
      "<a href=\"" +
        instagram +
        "\" style=\"color:" +
        theme.accentColor +
        ";text-decoration:none;\">Instagram</a>"
    );
  }
  if (facebook) {
    socialParts.push(
      "<a href=\"" +
        facebook +
        "\" style=\"color:" +
        theme.accentColor +
        ";text-decoration:none;\">Facebook</a>"
    );
  }
  if (twitter) {
    socialParts.push(
      "<a href=\"" +
        twitter +
        "\" style=\"color:" +
        theme.accentColor +
        ";text-decoration:none;\">X</a>"
    );
  }
  if (socialParts.length > 0) {
    lines.push(
      "<div style=\"margin-top:4px;color:" +
        theme.textColor +
        ";\">" +
        socialParts.join(" &nbsp;•&nbsp; ") +
        "</div>"
    );
  }

  if (layout !== "horizontal" && inputs.logoDataUrl) {
    lines.push(
      "<div style=\"margin-top:8px;\">"
    );
    lines.push(
      "<img src=\"" +
        inputs.logoDataUrl +
        "\" alt=\"Logo\" style=\"max-width:96px;max-height:96px;border-radius:4px;display:block;\" />"
    );
    lines.push("</div>");
  }

  lines.push("</td>");
  lines.push("</tr>");
  lines.push("</table>");

  return lines.join("");
};

const createPlainText = (inputs: SignatureInputs) => {
  const lines: string[] = [];
  if (inputs.fullName.trim()) {
    lines.push(inputs.fullName.trim());
  }
  const roleParts: string[] = [];
  if (inputs.jobTitle.trim()) {
    roleParts.push(inputs.jobTitle.trim());
  }
  if (inputs.company.trim()) {
    roleParts.push(inputs.company.trim());
  }
  if (roleParts.length > 0) {
    lines.push(roleParts.join(" | "));
  }
  if (inputs.phone.trim()) {
    lines.push("Phone: " + inputs.phone.trim());
  }
  if (inputs.email.trim()) {
    lines.push("Email: " + inputs.email.trim());
  }
  if (inputs.website.trim()) {
    lines.push("Website: " + inputs.website.trim());
  }
  if (inputs.address.trim()) {
    lines.push("Address: " + inputs.address.trim());
  }
  const socials: string[] = [];
  if (inputs.linkedIn.trim()) {
    socials.push("LinkedIn: " + inputs.linkedIn.trim());
  }
  if (inputs.github.trim()) {
    socials.push("GitHub: " + inputs.github.trim());
  }
  if (inputs.instagram.trim()) {
    socials.push("Instagram: " + inputs.instagram.trim());
  }
  if (inputs.facebook.trim()) {
    socials.push("Facebook: " + inputs.facebook.trim());
  }
  if (inputs.twitter.trim()) {
    socials.push("X: " + inputs.twitter.trim());
  }
  if (socials.length > 0) {
    lines.push(...socials);
  }
  return lines.join("\n");
};

const EmailSignatureGenerator = () => {
  const [inputs, setInputs] = useState<SignatureInputs>(createDefaultInputs);
  const [layout, setLayout] = useState<LayoutStyle>("horizontal");
  const [themeId, setThemeId] = useState<ThemeId>("clean");
  const [copiedHtml, setCopiedHtml] = useState(false);
  const [copiedText, setCopiedText] = useState(false);
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
    const parsed = JSON.parse(raw) as StoredState;
    if (parsed && parsed.inputs) {
      setInputs(parsed.inputs);
      setLayout(parsed.layout || "horizontal");
      setThemeId(parsed.themeId || "clean");
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const state: StoredState = {
      inputs,
      layout,
      themeId
    };
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
  }, [inputs, layout, themeId]);

  const handleInputChange = <Key extends keyof SignatureInputs>(
    key: Key,
    value: SignatureInputs[Key]
  ) => {
    setInputs((previous) => ({
      ...previous,
      [key]: value
    }));
  };

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      const result = loadEvent.target?.result;
      if (typeof result !== "string") {
        return;
      }
      handleInputChange("logoDataUrl", result);
    };
    reader.readAsDataURL(file);
  };

  const theme =
    THEMES.find((config) => config.id === themeId) ?? THEMES[0];

  const htmlSignature = buildHtmlSignature(inputs, layout, theme);
  const plainText = createPlainText(inputs);

  const handleCopyHtml = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(htmlSignature);
    setCopiedHtml(true);
    window.setTimeout(() => {
      setCopiedHtml(false);
    }, 1600);
  };

  const handleCopyText = async () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(plainText);
    setCopiedText(true);
    window.setTimeout(() => {
      setCopiedText(false);
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
      link.download = "lifehacktoolbox-email-signature.png";
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

  const inputClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  const fontPreview =
    "font-sans text-sm text-slate-900";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          Signatures are built only in this browser.
        </p>
        <p>
          Your details, links, and logo never leave this page. HTML and PNG
          exports are generated entirely client-side so you can safely paste
          them into your email client.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
            Signature details
          </h2>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Full name
              </label>
              <input
                type="text"
                value={inputs.fullName}
                onChange={(event) =>
                  handleInputChange("fullName", event.target.value)
                }
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Job title
              </label>
              <input
                type="text"
                value={inputs.jobTitle}
                onChange={(event) =>
                  handleInputChange("jobTitle", event.target.value)
                }
                className={inputClasses}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Company
              </label>
              <input
                type="text"
                value={inputs.company}
                onChange={(event) =>
                  handleInputChange("company", event.target.value)
                }
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Phone
              </label>
              <input
                type="text"
                value={inputs.phone}
                onChange={(event) =>
                  handleInputChange("phone", event.target.value)
                }
                className={inputClasses}
              />
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Email
              </label>
              <input
                type="email"
                value={inputs.email}
                onChange={(event) =>
                  handleInputChange("email", event.target.value)
                }
                className={inputClasses}
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-medium text-slate-700">
                Website
              </label>
              <input
                type="text"
                value={inputs.website}
                onChange={(event) =>
                  handleInputChange("website", event.target.value)
                }
                className={inputClasses}
                placeholder="https://example.com"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700">
              Address (optional)
            </label>
            <input
              type="text"
              value={inputs.address}
              onChange={(event) =>
                handleInputChange("address", event.target.value)
              }
              className={inputClasses}
              placeholder="City, State or full mailing address"
            />
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Social links
            </p>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={inputs.linkedIn}
                  onChange={(event) =>
                    handleInputChange("linkedIn", event.target.value)
                  }
                  className={inputClasses}
                  placeholder="https://linkedin.com/in/you"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">
                  GitHub
                </label>
                <input
                  type="text"
                  value={inputs.github}
                  onChange={(event) =>
                    handleInputChange("github", event.target.value)
                  }
                  className={inputClasses}
                  placeholder="https://github.com/you"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">
                  Instagram
                </label>
                <input
                  type="text"
                  value={inputs.instagram}
                  onChange={(event) =>
                    handleInputChange("instagram", event.target.value)
                  }
                  className={inputClasses}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">
                  Facebook
                </label>
                <input
                  type="text"
                  value={inputs.facebook}
                  onChange={(event) =>
                    handleInputChange("facebook", event.target.value)
                  }
                  className={inputClasses}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-slate-700">
                  X / Twitter
                </label>
                <input
                  type="text"
                  value={inputs.twitter}
                  onChange={(event) =>
                    handleInputChange("twitter", event.target.value)
                  }
                  className={inputClasses}
                />
              </div>
            </div>
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Logo (optional)
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex items-center gap-2 text-[11px] text-slate-700">
                <span className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50">
                  Upload logo
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                />
              </label>
              {inputs.logoDataUrl && (
                <div className="flex items-center gap-2">
                  <img
                    src={inputs.logoDataUrl}
                    alt="Logo preview"
                    className="h-10 w-10 rounded-md border border-slate-200 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleInputChange("logoDataUrl", null)}
                    className="rounded-md border border-red-200 bg-white px-2 py-1 text-[11px] font-medium text-red-600 shadow-sm transition hover:border-red-400 hover:bg-red-50"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Logos are embedded as data URLs inside the HTML so you can paste
              the signature without hosting the image separately.
            </p>
          </div>
          <div className="space-y-2 border-t border-slate-200 pt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-600">
              Layout &amp; theme
            </p>
            <div className="flex flex-wrap gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => setLayout("horizontal")}
                className={`rounded-md px-3 py-1.5 shadow-sm ${
                  layout === "horizontal"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                Horizontal
              </button>
              <button
                type="button"
                onClick={() => setLayout("vertical")}
                className={`rounded-md px-3 py-1.5 shadow-sm ${
                  layout === "vertical"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                Vertical
              </button>
              <button
                type="button"
                onClick={() => setLayout("compact")}
                className={`rounded-md px-3 py-1.5 shadow-sm ${
                  layout === "compact"
                    ? "bg-emerald-600 text-white"
                    : "border border-slate-300 bg-white text-slate-800 hover:border-slate-400"
                }`}
              >
                Compact
              </button>
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {THEMES.map((config) => {
                const isSelected = config.id === themeId;
                return (
                  <button
                    key={config.id}
                    type="button"
                    onClick={() => setThemeId(config.id)}
                    className={`flex items-center justify-between rounded-md border px-3 py-2 text-left text-[11px] shadow-sm transition ${
                      isSelected
                        ? "border-emerald-500 bg-emerald-50"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {config.label}
                      </p>
                      <p className="text-[10px] text-slate-600">
                        Accent {config.accentColor}
                      </p>
                    </div>
                    <span
                      className="h-5 w-5 rounded-full"
                      style={{ backgroundColor: config.accentColor }}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </section>
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
                Signature preview
              </h2>
              <p className="text-[11px] text-slate-600">
                This is what your HTML email signature will look like in most
                modern email clients. Copy the HTML to paste into Gmail,
                Outlook, or Apple Mail.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-[11px]">
              <button
                type="button"
                onClick={handleCopyHtml}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                {copiedHtml ? "HTML copied!" : "Copy HTML"}
              </button>
              <button
                type="button"
                onClick={handleCopyText}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                {copiedText ? "Text copied!" : "Copy plain text"}
              </button>
              <button
                type="button"
                onClick={handleExportPng}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                Download PNG
              </button>
            </div>
          </div>
          {exportMessage && (
            <p className="text-[11px] text-emerald-700">{exportMessage}</p>
          )}
          <div ref={frameRef}>
            <ExportableImageFrame title="Email signature">
              <div
                className={`inline-block rounded-md border bg-white p-3 ${fontPreview}`}
                style={{ borderColor: theme.borderColor }}
              >
                <div className="flex items-start gap-4">
                  {layout === "horizontal" && inputs.logoDataUrl && (
                    <div className="flex-shrink-0">
                      <img
                        src={inputs.logoDataUrl}
                        alt="Logo"
                        className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                      />
                    </div>
                  )}
                  <div className="space-y-1 border-l-4 pl-4">
                    <p
                      className="font-semibold"
                      style={{ fontSize: theme.nameSize }}
                    >
                      {inputs.fullName || "Your Name"}
                    </p>
                    {(inputs.jobTitle || inputs.company) && (
                      <p className="text-[11px] text-slate-500">
                        {[inputs.jobTitle, inputs.company]
                          .filter((value) => value.trim().length > 0)
                          .join(" | ")}
                      </p>
                    )}
                    <div className="space-y-0.5 text-[11px]">
                      <div className="flex flex-wrap gap-2">
                        {inputs.phone && (
                          <span className="text-slate-700">
                            ☎ {inputs.phone}
                          </span>
                        )}
                        {inputs.email && (
                          <span className="text-slate-700">
                            ✉ {inputs.email}
                          </span>
                        )}
                        {inputs.website && (
                          <span className="text-slate-700">
                            🌐{" "}
                            {inputs.website.replace(/^https?:\/\//i, "")}
                          </span>
                        )}
                      </div>
                      {inputs.address && (
                        <p className="text-slate-500">
                          {inputs.address}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2 text-slate-700">
                        {inputs.linkedIn && <span>LinkedIn</span>}
                        {inputs.github && <span>GitHub</span>}
                        {inputs.instagram && <span>Instagram</span>}
                        {inputs.facebook && <span>Facebook</span>}
                        {inputs.twitter && <span>X</span>}
                      </div>
                    </div>
                    {layout !== "horizontal" && inputs.logoDataUrl && (
                      <div className="pt-2">
                        <img
                          src={inputs.logoDataUrl}
                          alt="Logo"
                          className="h-16 w-16 rounded-md border border-slate-200 object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ExportableImageFrame>
          </div>
        </section>
      </div>
    </div>
  );
};

export default EmailSignatureGenerator;


