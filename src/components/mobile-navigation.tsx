"use client";

import Link from "next/link";
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

export function MobileNavigation() {
  const pathname = usePathname();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="md:hidden" aria-label="Open menu">
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
          <div className="mt-4 flex items-center gap-2 rounded-md border px-3 py-3 text-sm text-muted-foreground">
            <Search className="h-4 w-4" aria-hidden="true" />
            Search coming soon
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
