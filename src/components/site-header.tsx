"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MobileNavigation } from "@/components/mobile-navigation";
import { SearchCommand } from "@/components/search-command";
import { Separator } from "@/components/ui/separator";

const navigationItems = [
  { href: "/news", label: "News" },
  { href: "/vehicles", label: "Vehicles" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);
  const searchReturnFocusRef = useRef<HTMLElement | null>(null);
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
          <SearchCommand
            open={searchOpen}
            onOpenChange={setSearchOpen}
            returnFocusRef={searchReturnFocusRef}
          />
          <MobileNavigation
            searchOpen={searchOpen}
            searchReturnFocusRef={searchReturnFocusRef}
            onSearch={() => setSearchOpen(true)}
          />
        </div>
      </div>
      <Separator />
    </header>
  );
}
