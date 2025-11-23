import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import "./globals.css";
import logo from "../icon.png";

export const metadata: Metadata = {
  title: "LifeHackToolbox",
  description: "LifeHackToolbox is a small set of free, easy calculators and tools you can use right in your browser."
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <header className="border-b bg-white">
            <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-lg font-semibold tracking-tight"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-emerald-50 ring-1 ring-emerald-100">
                  <Image
                    src={logo}
                    alt="LifeHackToolbox logo"
                    width={32}
                    height={32}
                    className="h-8 w-8 object-cover"
                    priority
                  />
                </span>
                <span>LifeHackToolbox</span>
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
                <Link href="/" className="hover:text-slate-900">
                  Home
                </Link>
              </nav>
            </div>
          </header>
          <main className="flex-1">
            <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
          <footer className="border-t bg-white">
            <div className="mx-auto max-w-5xl px-4 py-6 text-xs text-slate-500 sm:px-6 lg:px-8">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <span>LifeHackToolbox</span>
                <span>
                  Tools are estimates only and are provided for informational
                  purposes, not as financial, tax, or legal advice.
                </span>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}


