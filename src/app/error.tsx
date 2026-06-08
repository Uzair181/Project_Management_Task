"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Button } from "@mui/material";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-white grid place-items-center px-4">
        <div className="w-full max-w-xl rounded-[2rem] border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="space-y-3">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Something went wrong</p>
            <h1 className="text-3xl font-extrabold tracking-tight">We hit an unexpected error</h1>
            <p className="text-slate-300">
              The app failed to render this section. You can try again, or go back to a safe route.
            </p>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button variant="contained" onClick={() => reset()}>
              Try again
            </Button>
            <Button component={Link} href="/login" variant="outlined" color="inherit">
              Go to login
            </Button>
          </div>

          {error.digest ? <p className="mt-6 text-xs text-slate-400">Error ID: {error.digest}</p> : null}
        </div>
      </body>
    </html>
  );
}
