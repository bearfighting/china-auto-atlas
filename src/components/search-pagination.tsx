import Link from "next/link";
import type { SearchType } from "@/lib/data/types";

function pageHref(page: number, query: string, type: SearchType) {
  const params = new URLSearchParams();
  if (query) params.set("q", query);
  if (type !== "all") params.set("type", type);
  if (page > 1) params.set("page", String(page));
  return `/search?${params.toString()}`;
}

export function SearchPagination({
  page,
  totalPages,
  query,
  type,
}: {
  page: number;
  totalPages: number;
  query: string;
  type: SearchType;
}) {
  if (totalPages <= 1 || page > totalPages) return null;
  return (
    <nav
      aria-label="Search pagination"
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
    >
      {page > 1 ? (
        <Link
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={pageHref(page - 1, query, type)}
        >
          Previous
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="rounded-md border px-3 py-2 text-sm text-muted-foreground"
        >
          Previous
        </span>
      )}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) =>
        pageNumber === page ? (
          <span
            key={pageNumber}
            aria-current="page"
            className="rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground"
          >
            {pageNumber}
          </span>
        ) : (
          <Link
            key={pageNumber}
            className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            href={pageHref(pageNumber, query, type)}
          >
            {pageNumber}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={pageHref(page + 1, query, type)}
        >
          Next
        </Link>
      ) : (
        <span
          aria-disabled="true"
          className="rounded-md border px-3 py-2 text-sm text-muted-foreground"
        >
          Next
        </span>
      )}
    </nav>
  );
}
