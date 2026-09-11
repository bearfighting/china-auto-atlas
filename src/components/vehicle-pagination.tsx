import Link from "next/link";

function pageHref(page: number, brandId?: string, powertrainType?: string, status?: string) {
  const params = new URLSearchParams();
  if (page > 1) params.set("page", String(page));
  if (brandId) params.set("brand", brandId);
  if (powertrainType) params.set("powertrain", powertrainType);
  if (status) params.set("status", status);
  const query = params.toString();
  return query ? `/vehicles?${query}` : "/vehicles";
}

export function VehiclePagination({
  page,
  totalPages,
  brandId,
  powertrainType,
  status,
}: {
  page: number;
  totalPages: number;
  brandId?: string;
  powertrainType?: string;
  status?: string;
}) {
  if (totalPages <= 1 || page > totalPages) return null;
  return (
    <nav
      aria-label="Vehicle pagination"
      className="flex flex-wrap items-center justify-center gap-2"
    >
      {page > 1 ? (
        <Link
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={pageHref(page - 1, brandId, powertrainType, status)}
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
            href={pageHref(pageNumber, brandId, powertrainType, status)}
          >
            {pageNumber}
          </Link>
        ),
      )}
      {page < totalPages ? (
        <Link
          className="rounded-md border px-3 py-2 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          href={pageHref(page + 1, brandId, powertrainType, status)}
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
