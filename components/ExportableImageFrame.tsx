"use client";

import type { ReactNode, ForwardedRef } from "react";
import { forwardRef } from "react";
import Image from "next/image";
import logo from "../icon.png";

type ExportableImageFrameProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

const ExportableImageFrameInner = (
  props: ExportableImageFrameProps,
  ref: ForwardedRef<HTMLDivElement>
) => {
  const { title, children, className } = props;

  return (
    <div
      ref={ref}
      className={`flex flex-col rounded-lg border border-slate-200 bg-white p-4 text-slate-900 shadow-sm print:border-slate-300 print:bg-white ${className ?? ""}`}
    >
      <header className="mb-3 flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2">
          <div className="relative h-6 w-6 overflow-hidden rounded-full bg-emerald-600">
            <Image
              src={logo}
              alt="LifeHackToolbox logo"
              fill
              sizes="24px"
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-semibold tracking-tight text-slate-900">
              LifeHackToolbox
            </span>
            <span className="text-[10px] text-slate-500">
              Free tools for everyday life
            </span>
          </div>
        </div>
        {title && (
          <p className="text-xs font-semibold text-slate-700">
            {title}
          </p>
        )}
      </header>
      <main className="flex flex-1 flex-col gap-3">{children}</main>
      <footer className="mt-3 border-t border-slate-200 pt-2 text-center text-[11px] text-slate-500">
        <p>lifehacktoolbox.com</p>
        <p>Shareable snapshot generated with LifeHackToolbox</p>
      </footer>
    </div>
  );
};

const ExportableImageFrame = forwardRef<
  HTMLDivElement,
  ExportableImageFrameProps
>(ExportableImageFrameInner);

ExportableImageFrame.displayName = "ExportableImageFrame";

export default ExportableImageFrame;



