"use client";

import "./globals.css";
import Link from "next/link";
import { ErrorState } from "@/components/states";
import { SiteFooter } from "@/components/site-footer";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b bg-background/95">
          <div className="mx-auto flex min-h-16 max-w-6xl items-center px-4 sm:px-6 lg:px-8">
            <Link
              href="/"
              className="font-semibold tracking-tight focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              China Auto Atlas
            </Link>
          </div>
        </header>
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState onRetry={reset} />
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
