"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import type { SearchResult } from "@/lib/data/types";

const typeLabels: Record<string, string> = {
  vehicle: "Vehicle",
  brand: "Brand",
  manufacturer: "Manufacturer",
  technology: "Technology",
  news: "News",
};

export function SearchCommand({
  open,
  onOpenChange,
  returnFocusRef,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusRef?: React.MutableRefObject<HTMLElement | null>;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [query, setQuery] = React.useState("");
  const [results, setResults] = React.useState<SearchResult[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        if (returnFocusRef && !returnFocusRef.current) {
          const triggers = Array.from(
            document.querySelectorAll<HTMLElement>(
              '[data-testid="mobile-menu-trigger"], [data-testid="search-trigger"]',
            ),
          );
          returnFocusRef.current =
            triggers.find((trigger) => trigger.getClientRects().length > 0) ?? null;
        }
        onOpenChange(true);
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onOpenChange, returnFocusRef]);

  React.useEffect(() => {
    if (!open || !query.trim()) {
      setResults([]);
      setLoading(false);
      setError(false);
      return;
    }
    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setError(false);
    setResults([]);
    fetch(`/api/search?q=${encodeURIComponent(query.slice(0, 200))}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Search request failed");
        return response.json() as Promise<{ results: SearchResult[] }>;
      })
      .then((data) => {
        if (active) setResults(data.results);
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        if (!active) return;
        setError(true);
        setResults([]);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
      controller.abort();
    };
  }, [open, query]);

  React.useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const navigate = (href: string) => {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  };

  const handleOpenChange = (nextOpen: boolean) => {
    onOpenChange(nextOpen);
    if (!nextOpen) {
      requestAnimationFrame(() => returnFocusRef?.current?.focus());
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="hidden lg:inline-flex"
        aria-label="Search"
        aria-expanded={open}
        aria-controls="global-search-dialog"
        onClick={(event) => {
          if (returnFocusRef) returnFocusRef.current = event.currentTarget;
          onOpenChange(true);
        }}
        data-testid="search-trigger"
      >
        <Search className="mr-2 h-4 w-4" aria-hidden="true" />
        Search
        <span className="ml-2 hidden text-xs text-muted-foreground lg:inline">⌘K</span>
      </Button>
      <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-foreground/20" />
          <DialogPrimitive.Content
            id="global-search-dialog"
            className="fixed left-1/2 top-[12%] z-50 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2 overflow-hidden rounded-lg border bg-background shadow-lg outline-none"
          >
            <DialogPrimitive.Title className="sr-only">
              Search China Auto Atlas
            </DialogPrimitive.Title>
            <DialogPrimitive.Description className="sr-only">
              Search vehicles, brands, manufacturers, technologies, and news.
            </DialogPrimitive.Description>
            <Command shouldFilter={false} loop>
              <CommandInput
                ref={inputRef}
                value={query}
                onValueChange={setQuery}
                placeholder="Search vehicles, brands, technologies, and news"
                aria-label="Search atlas"
              />
              <CommandList>
                {!query.trim() ? (
                  <CommandEmpty>Start typing to search the atlas.</CommandEmpty>
                ) : null}
                {loading ? <CommandEmpty>Searching…</CommandEmpty> : null}
                {error ? <CommandEmpty>Search is temporarily unavailable.</CommandEmpty> : null}
                {!loading && !error && query.trim() && results.length === 0 ? (
                  <CommandEmpty>No results found.</CommandEmpty>
                ) : null}
                {results.length ? (
                  <CommandGroup heading="Results">
                    {results.map((result) => (
                      <CommandItem
                        key={`${result.kind}-${result.id}`}
                        value={result.id}
                        onSelect={() => navigate(result.href)}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">{result.display_name}</p>
                          {result.display_name_zh ? (
                            <p className="truncate text-xs text-muted-foreground">
                              {result.display_name_zh}
                            </p>
                          ) : null}
                        </div>
                        <span className="ml-auto shrink-0 text-xs text-muted-foreground">
                          {typeLabels[result.type] ?? result.type}
                        </span>
                      </CommandItem>
                    ))}
                    <CommandSeparator />
                    <CommandItem
                      value="view-all"
                      onSelect={() => navigate(`/search?q=${encodeURIComponent(query)}`)}
                    >
                      View all results
                    </CommandItem>
                  </CommandGroup>
                ) : null}
              </CommandList>
            </Command>
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    </>
  );
}
