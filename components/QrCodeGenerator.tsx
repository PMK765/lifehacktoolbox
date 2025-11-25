"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import QRCode from "qrcode";
import html2canvas from "html2canvas";
import ExportableImageFrame from "@/components/ExportableImageFrame";

type QrMode = "url" | "text" | "email" | "phone" | "sms" | "wifi";

type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

type WifiSecurity = "WPA" | "WEP" | "nopass";

const buildPayload = (
  mode: QrMode,
  values: {
    url: string;
    text: string;
    emailAddress: string;
    emailSubject: string;
    emailBody: string;
    phoneNumber: string;
    smsNumber: string;
    smsMessage: string;
    wifiSsid: string;
    wifiPassword: string;
    wifiSecurity: WifiSecurity;
    wifiHidden: boolean;
  }
) => {
  if (mode === "url") {
    return values.url.trim();
  }
  if (mode === "text") {
    return values.text;
  }
  if (mode === "email") {
    const address = values.emailAddress.trim();
    const subject = encodeURIComponent(values.emailSubject.trim());
    const body = encodeURIComponent(values.emailBody.trim());
    const queryParts = [];
    if (subject) {
      queryParts.push(`subject=${subject}`);
    }
    if (body) {
      queryParts.push(`body=${body}`);
    }
    const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";
    return address ? `mailto:${address}${query}` : "";
  }
  if (mode === "phone") {
    const number = values.phoneNumber.trim();
    return number ? `tel:${number}` : "";
  }
  if (mode === "sms") {
    const number = values.smsNumber.trim();
    const message = values.smsMessage;
    if (!number && !message) {
      return "";
    }
    return `SMSTO:${number}:${message}`;
  }
  if (mode === "wifi") {
    const pieces: string[] = [];
    const security =
      values.wifiSecurity === "nopass" ? "" : values.wifiSecurity;
    pieces.push(`T:${security};`);
    if (values.wifiSsid) {
      pieces.push(`S:${values.wifiSsid};`);
    }
    if (values.wifiSecurity !== "nopass" && values.wifiPassword) {
      pieces.push(`P:${values.wifiPassword};`);
    }
    if (values.wifiHidden) {
      pieces.push("H:true;");
    }
    return `WIFI:${pieces.join("")};`;
  }
  return "";
};

const QrCodeGenerator = () => {
  const [mode, setMode] = useState<QrMode>("url");
  const [url, setUrl] = useState("");
  const [text, setText] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [emailSubject, setEmailSubject] = useState("");
  const [emailBody, setEmailBody] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [smsNumber, setSmsNumber] = useState("");
  const [smsMessage, setSmsMessage] = useState("");
  const [wifiSsid, setWifiSsid] = useState("");
  const [wifiPassword, setWifiPassword] = useState("");
  const [wifiSecurity, setWifiSecurity] =
    useState<WifiSecurity>("WPA");
  const [wifiHidden, setWifiHidden] = useState(false);

  const [size, setSize] = useState(256);
  const [foregroundColor, setForegroundColor] =
    useState("#000000");
  const [backgroundColor, setBackgroundColor] =
    useState("#ffffff");
  const [errorCorrectionLevel, setErrorCorrectionLevel] =
    useState<ErrorCorrectionLevel>("M");
  const [includeCenterLogo, setIncludeCenterLogo] =
    useState(true);

  const [copied, setCopied] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const exportFrameRef = useRef<HTMLDivElement | null>(null);

  const payload = useMemo(
    () =>
      buildPayload(mode, {
        url,
        text,
        emailAddress,
        emailSubject,
        emailBody,
        phoneNumber,
        smsNumber,
        smsMessage,
        wifiSsid,
        wifiPassword,
        wifiSecurity,
        wifiHidden
      }),
    [
      mode,
      url,
      text,
      emailAddress,
      emailSubject,
      emailBody,
      phoneNumber,
      smsNumber,
      smsMessage,
      wifiSsid,
      wifiPassword,
      wifiSecurity,
      wifiHidden
    ]
  );

  useEffect(() => {
    if (!canvasRef.current) {
      return;
    }
    const current = canvasRef.current;
    const value = payload || " ";
    const options = {
      errorCorrectionLevel,
      margin: 2,
      color: {
        dark: foregroundColor,
        light: backgroundColor
      },
      scale: 1,
      width: size
    } as QRCode.QRCodeToDataURLOptions & QRCode.QRCodeRenderersOptions;

    QRCode.toCanvas(current, value, options, (error) => {
      if (error) {
        return;
      }
      if (!includeCenterLogo) {
        return;
      }
      const context = current.getContext("2d");
      if (!context) {
        return;
      }
      const logoSize = Math.round(size * 0.18);
      const x = (size - logoSize) / 2;
      const y = (size - logoSize) / 2;
      context.fillStyle = "#ffffff";
      context.fillRect(x, y, logoSize, logoSize);
      context.strokeStyle = "#e2e8f0";
      context.lineWidth = 2;
      context.strokeRect(x, y, logoSize, logoSize);
      context.fillStyle = "#059669";
      const radius = logoSize / 2.8;
      const centerX = x + logoSize / 2;
      const centerY = y + logoSize / 2;
      context.beginPath();
      context.arc(centerX, centerY, radius, 0, Math.PI * 2);
      context.fill();
      context.fillStyle = "#ffffff";
      context.font = `${Math.round(
        logoSize * 0.32
      )}px system-ui, -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif`;
      context.textAlign = "center";
      context.textBaseline = "middle";
      context.fillText("LHT", centerX, centerY + 1);
    });
  }, [
    payload,
    size,
    foregroundColor,
    backgroundColor,
    errorCorrectionLevel,
    includeCenterLogo
  ]);

  const handleCopyPayload = async () => {
    if (!payload) {
      return;
    }
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    await navigator.clipboard.writeText(payload);
    setCopied(true);
    window.setTimeout(() => {
      setCopied(false);
    }, 1600);
  };

  const handleDownloadPng = async () => {
    if (!exportFrameRef.current) {
      return;
    }
    const canvas = await html2canvas(exportFrameRef.current, {
      backgroundColor: "#ffffff",
      scale: 2
    });
    canvas.toBlob((blob) => {
      if (!blob) {
        return;
      }
      const urlObject = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = urlObject;
      link.download = "lifehacktoolbox-qr.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(urlObject);
    });
  };

  const resetAll = () => {
    setMode("url");
    setUrl("");
    setText("");
    setEmailAddress("");
    setEmailSubject("");
    setEmailBody("");
    setPhoneNumber("");
    setSmsNumber("");
    setSmsMessage("");
    setWifiSsid("");
    setWifiPassword("");
    setWifiSecurity("WPA");
    setWifiHidden(false);
    setSize(256);
    setForegroundColor("#000000");
    setBackgroundColor("#ffffff");
    setErrorCorrectionLevel("M");
    setIncludeCenterLogo(true);
  };

  const inputBaseClasses =
    "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500";

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          QR codes are generated only in your browser.
        </p>
        <p>
          The data you enter is used solely to build a QR code on this page. It
          is not sent to any server and is cleared when you close or refresh
          this tab.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Content
            </h2>
            <div className="inline-flex rounded-md border border-slate-300 bg-slate-50 text-xs">
              {(
                [
                  ["url", "URL"],
                  ["text", "Text"],
                  ["email", "Email"],
                  ["phone", "Phone"],
                  ["sms", "SMS"],
                  ["wifi", "Wi‑Fi"]
                ] as [QrMode, string][]
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setMode(value)}
                  className={`px-3 py-1 ${
                    mode === value
                      ? "bg-white font-semibold text-slate-900"
                      : "text-slate-700"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          {mode === "url" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                URL
              </label>
              <input
                type="text"
                value={url}
                onChange={(event) => setUrl(event.target.value)}
                className={inputBaseClasses}
                placeholder="https://example.com/landing"
              />
              {url &&
                !url.startsWith("http://") &&
                !url.startsWith("https://") && (
                  <p className="text-[11px] text-slate-500">
                    Tip: Include http:// or https:// so QR scanners recognize this
                    as a link.
                  </p>
                )}
            </div>
          )}
          {mode === "text" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Text
              </label>
              <textarea
                value={text}
                onChange={(event) => setText(event.target.value)}
                className={`${inputBaseClasses} h-32 resize-y font-mono text-xs`}
                placeholder="Any plain text, notes, or short message."
              />
            </div>
          )}
          {mode === "email" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  To
                </label>
                <input
                  type="email"
                  value={emailAddress}
                  onChange={(event) =>
                    setEmailAddress(event.target.value)
                  }
                  className={inputBaseClasses}
                  placeholder="name@example.com"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Subject (optional)
                </label>
                <input
                  type="text"
                  value={emailSubject}
                  onChange={(event) =>
                    setEmailSubject(event.target.value)
                  }
                  className={inputBaseClasses}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Body (optional)
                </label>
                <textarea
                  value={emailBody}
                  onChange={(event) =>
                    setEmailBody(event.target.value)
                  }
                  className={`${inputBaseClasses} h-24 resize-y font-mono text-xs`}
                />
              </div>
            </div>
          )}
          {mode === "phone" && (
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Phone number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(event) =>
                  setPhoneNumber(event.target.value)
                }
                className={inputBaseClasses}
                placeholder="+15551234567"
              />
            </div>
          )}
          {mode === "sms" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={smsNumber}
                  onChange={(event) =>
                    setSmsNumber(event.target.value)
                  }
                  className={inputBaseClasses}
                  placeholder="+15551234567"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Message
                </label>
                <textarea
                  value={smsMessage}
                  onChange={(event) =>
                    setSmsMessage(event.target.value)
                  }
                  className={`${inputBaseClasses} h-24 resize-y font-mono text-xs`}
                />
              </div>
            </div>
          )}
          {mode === "wifi" && (
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  SSID (network name)
                </label>
                <input
                  type="text"
                  value={wifiSsid}
                  onChange={(event) =>
                    setWifiSsid(event.target.value)
                  }
                  className={inputBaseClasses}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Password
                </label>
                <input
                  type="password"
                  value={wifiPassword}
                  onChange={(event) =>
                    setWifiPassword(event.target.value)
                  }
                  className={inputBaseClasses}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Security
                </label>
                <select
                  value={wifiSecurity}
                  onChange={(event) =>
                    setWifiSecurity(
                      event.target.value as WifiSecurity
                    )
                  }
                  className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="WPA">WPA/WPA2</option>
                  <option value="WEP">WEP</option>
                  <option value="nopass">None (open network)</option>
                </select>
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={wifiHidden}
                  onChange={(event) =>
                    setWifiHidden(event.target.checked)
                  }
                  className="h-3 w-3 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Hidden network
              </label>
            </div>
          )}
          <div className="mt-4 space-y-3 rounded-md bg-slate-50 p-3">
            <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-600">
              QR options
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Size (pixels)
                </label>
                <select
                  value={size}
                  onChange={(event) =>
                    setSize(Number.parseInt(event.target.value, 10))
                  }
                  className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value={128}>128 × 128</option>
                  <option value={192}>192 × 192</option>
                  <option value={256}>256 × 256</option>
                  <option value={384}>384 × 384</option>
                  <option value={512}>512 × 512</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Error correction
                </label>
                <select
                  value={errorCorrectionLevel}
                  onChange={(event) =>
                    setErrorCorrectionLevel(
                      event.target.value as ErrorCorrectionLevel
                    )
                  }
                  className="block w-full appearance-none rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                >
                  <option value="L">L (smallest, most capacity)</option>
                  <option value="M">M (balanced)</option>
                  <option value="Q">Q (more redundancy)</option>
                  <option value="H">H (highest, best for logos)</option>
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Foreground color
                </label>
                <input
                  type="color"
                  value={foregroundColor}
                  onChange={(event) =>
                    setForegroundColor(event.target.value)
                  }
                  className="h-9 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Background color
                </label>
                <input
                  type="color"
                  value={backgroundColor}
                  onChange={(event) =>
                    setBackgroundColor(event.target.value)
                  }
                  className="h-9 w-full cursor-pointer rounded-md border border-slate-300 bg-white"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={includeCenterLogo}
                  onChange={(event) =>
                    setIncludeCenterLogo(event.target.checked)
                  }
                  className="h-3 w-3 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                Add LifeHackToolbox logo in the center
              </label>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
            <button
              type="button"
              onClick={resetAll}
              className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
            >
              Reset all
            </button>
          </div>
        </section>
        <section className="space-y-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-700">
              Preview &amp; export
            </h2>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyPayload}
                className="inline-flex items-center rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 shadow-sm transition hover:border-slate-400 hover:bg-slate-50"
              >
                {copied ? "Payload copied" : "Copy payload text"}
              </button>
              <button
                type="button"
                onClick={handleDownloadPng}
                className="inline-flex items-center rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Download PNG
              </button>
            </div>
          </div>
          <ExportableImageFrame
            ref={exportFrameRef}
            title="QR code from LifeHackToolbox"
            className="items-center"
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-3"
                style={{ width: size + 24, height: size + 24 }}
              >
                <canvas
                  ref={canvasRef}
                  width={size}
                  height={size}
                  className="h-auto w-auto"
                />
              </div>
              <p className="text-[11px] text-slate-600">
                Point your phone&apos;s camera at this code to test it.
              </p>
            </div>
          </ExportableImageFrame>
          <p className="text-[11px] text-slate-600">
            Current payload:
            <span className="ml-1 font-mono text-[10px] text-slate-900">
              {payload || "(empty)"}
            </span>
          </p>
        </section>
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
        <p className="font-semibold">
          QR codes are generated entirely on your device.
        </p>
        <p>
          LifeHackToolbox does not store or log the data you encode here. You
          can safely generate QR codes for internal URLs, Wi‑Fi networks, or
          contact details and then download or share the resulting PNG.
        </p>
      </div>
    </div>
  );
};

export default QrCodeGenerator;


