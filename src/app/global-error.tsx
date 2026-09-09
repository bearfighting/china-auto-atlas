"use client";

import "./globals.css";
import { ErrorState } from "@/components/states";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
          <ErrorState onRetry={reset} />
        </main>
      </body>
    </html>
  );
}
