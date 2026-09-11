"use client";

import { ErrorState } from "@/components/content/states";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <ErrorState onRetry={reset} />
    </main>
  );
}
