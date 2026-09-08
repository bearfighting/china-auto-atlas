import Link from "next/link";
import { Separator } from "@/components/ui/separator";

export function SiteHeader() {
  return (
    <header className="border-b bg-background/95">
      <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="flex items-baseline gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="font-semibold tracking-tight">China Auto Atlas</span>
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Automotive knowledge platform
          </span>
        </Link>
        <nav
          aria-label="Primary navigation"
          className="flex items-center gap-1 text-sm text-muted-foreground"
        >
          <Link
            className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            href="/news"
          >
            News
          </Link>
          <Link
            className="rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground"
            href="/vehicles/zeekr-7x"
          >
            Vehicles
          </Link>
        </nav>
      </div>
      <Separator />
    </header>
  );
}
