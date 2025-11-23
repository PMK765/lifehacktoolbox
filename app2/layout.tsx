import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "LifeHackTools",
  description: "A collection of fast, free, no-BS calculators and utilities."
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
              <Link href="/" className="text-lg font-semibold tracking-tight">
                LifeHackTools
              </Link>
              <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
                <Link href="/" className="hover:text-slate-900">
                  Home
                </Link>
                <Link
                  href="/hourly-salary-tax-calculator"
                  className="hover:text-slate-900"
                >
                  Hourly → Salary → After-Tax
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
                <span>LifeHackTools</span>
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


