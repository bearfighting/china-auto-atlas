"use client";

import Link from "next/link";
import type { MutableRefObject } from "react";
import { useRef } from "react";
import { usePathname } from "next/navigation";
import { Menu, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const navigationItems = [
  { href: "/news", label: "News" },
  { href: "/vehicles", label: "Vehicles" },
];

export function MobileNavigation({
  onSearch,
  searchOpen,
  searchReturnFocusRef,
}: {
  onSearch: () => void;
  searchOpen: boolean;
  searchReturnFocusRef: MutableRefObject<HTMLElement | null>;
}) {
  const pathname = usePathname();
  const menuTriggerRef = useRef<HTMLButtonElement>(null);
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          ref={menuTriggerRef}
          variant="outline"
          size="sm"
          className="md:hidden"
          aria-label="Open menu"
          data-testid="mobile-menu-trigger"
        >
          <Menu className="mr-2 h-4 w-4" aria-hidden="true" />
          Menu
        </Button>
      </SheetTrigger>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle>Navigate China Auto Atlas</SheetTitle>
          <SheetDescription>Open a primary section of the atlas.</SheetDescription>
        </SheetHeader>
        <nav aria-label="Mobile navigation" className="mt-8 grid gap-2">
          {navigationItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <SheetClose key={item.href} asChild>
                <Link
                  className={`rounded-md px-3 py-3 text-base font-medium hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${active ? "bg-muted text-foreground" : "text-muted-foreground"}`}
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </SheetClose>
            );
          })}
          <SheetClose asChild>
            <Button
              type="button"
              variant="outline"
              className="mt-4 justify-start"
              aria-label="Search"
              aria-expanded={searchOpen}
              aria-controls="global-search-dialog"
              onFocus={() => {
                searchReturnFocusRef.current = menuTriggerRef.current;
              }}
              onClick={() => {
                searchReturnFocusRef.current = menuTriggerRef.current;
                onSearch();
              }}
              data-testid="mobile-search-trigger"
            >
              <Search className="mr-2 h-4 w-4" aria-hidden="true" />
              Search
            </Button>
          </SheetClose>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
