import Link from "next/link";

function pageHref(page: number, year?: number, eventType?: string, entityId?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (year !== undefined) params.set("year", String(year));
  if (eventType) params.set("type", eventType);
  if (entityId) params.set("entity", entityId);
  const query = params.toString();
  return query ? `/events?${query}` : "/events";
}

export function EventPagination({
  page,
  totalPages,
  year,
  eventType,
  entityId,
}: {
  page: number;
  totalPages: number;
  year?: number;
  eventType?: string;
  entityId?: string;
}) {
  if (totalPages <= 1 || page > totalPages) return null;
  return (
    <nav aria-label="Event pagination" className="flex flex-wrap items-center justify-center gap-2">
      {page > 1 ? (
        <Link
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={pageHref(page - 1, year, eventType, entityId)}
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
            href={pageHref(pageNumber, year, eventType, entityId)}
          >
            {pageNumber}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={pageHref(page + 1, year, eventType, entityId)}
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
