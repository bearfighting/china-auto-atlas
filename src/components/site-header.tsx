"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search } from "lucide-react";
import { MobileNavigation } from "@/components/mobile-navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { href: "/news", label: "News" },
  { href: "/vehicles", label: "Vehicles" },
];

export function SiteHeader() {
  const pathname = usePathname();
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
        <div className="flex items-center gap-2">
          <nav
            aria-label="Primary navigation"
            className="hidden items-center gap-1 text-sm text-muted-foreground md:flex"
          >
            {navigationItems.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  className={`rounded-md px-3 py-2 hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-muted text-foreground" : ""}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="hidden md:inline-flex"
            disabled
            aria-label="Search coming soon"
            title="Search coming soon"
          >
            <Search className="mr-2 h-4 w-4" aria-hidden="true" />
            Search
          </Button>
          <MobileNavigation />
        </div>
      </div>
      <Separator />
    </header>
  );
}
