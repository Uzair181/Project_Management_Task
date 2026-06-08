"use client";

import type { ReactNode } from "react";
import clsx from "clsx";
import { LayoutGrid } from "lucide-react";
import { Button, type ButtonProps } from "@mui/material";

type BeatLoaderSize = "sm" | "md" | "lg";

function getBeatSizeClass(size: BeatLoaderSize) {
  switch (size) {
    case "sm":
      return "h-1.5 w-1.5";
    case "lg":
      return "h-2.5 w-2.5";
    default:
      return "h-2 w-2";
  }
}

export function BeatLoader({
  size = "md",
  className,
}: {
  size?: BeatLoaderSize;
  className?: string;
}) {
  const dotSize = getBeatSizeClass(size);

  return (
    <span className={clsx("inline-flex items-center gap-1.5", className)} aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={clsx("ptmd-beat-dot rounded-full bg-current", dotSize)}
          style={{ animationDelay: `${index * 140}ms` }}
        />
      ))}
    </span>
  );
}

export function BrandLoader({
  title = "Preparing Flowboard",
  subtitle = "Loading your projects, tasks, and workspace state.",
  compact = false,
}: {
  title?: string;
  subtitle?: string;
  compact?: boolean;
}) {
  return (
    <div
      className={clsx(
        "min-h-screen grid place-items-center px-4 py-12",
        compact && "min-h-0 py-0"
      )}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-[2rem] border border-slate-200/80 bg-white/85 px-8 py-10 text-center shadow-[0_30px_100px_rgba(15,23,42,0.16)] backdrop-blur-xl dark:border-slate-700/60 dark:bg-slate-950/75">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_40%),radial-gradient(circle_at_bottom_right,_rgba(34,211,238,0.16),_transparent_35%)]" />
        <div className="absolute left-6 top-6 h-20 w-20 rounded-full bg-sky-400/15 blur-3xl" />
        <div className="absolute bottom-6 right-6 h-24 w-24 rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative flex flex-col items-center gap-7">
          <div className="relative">
            <div className="absolute inset-0 rounded-[1.9rem] bg-blue-500/20 blur-2xl animate-pulse" />
            <div className="relative grid h-20 w-20 place-items-center rounded-[1.35rem] border border-white/60 bg-gradient-to-br from-blue-600 via-sky-500 to-cyan-400 text-white shadow-[0_20px_50px_rgba(37,99,235,0.35)] dark:border-white/10">
              <LayoutGrid className="h-10 w-10" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-950 dark:text-white">{title}</h1>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">{subtitle}</p>
          </div>

          <div className="inline-flex items-center gap-3 rounded-full border border-slate-200/80 bg-white/70 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm dark:border-slate-700/70 dark:bg-slate-900/60 dark:text-slate-200">
            <BeatLoader size="lg" className="text-blue-600 dark:text-sky-300" />
            <span>Loading</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LoadingButton({
  loading = false,
  loadingLabel,
  children,
  disabled,
  ...props
}: ButtonProps & {
  loading?: boolean;
  loadingLabel?: ReactNode;
}) {
  const size = props.size === "small" ? "sm" : props.size === "large" ? "lg" : "md";

  return (
    <Button {...props} disabled={disabled || loading} aria-busy={loading || undefined}>
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <BeatLoader size={size} className="text-current" />
          {loadingLabel != null ? <span>{loadingLabel}</span> : null}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
