import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { StructuredData } from "@/components/content/structured-data";
import { absoluteUrl } from "@/lib/site";

export type BreadcrumbItem = {
  label: string;
  href?: string;
};

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  const structuredItems = items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.label,
    ...(item.href ? { item: absoluteUrl(item.href) } : {}),
  }));

  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-8">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {items.map((item, index) => {
            const isCurrent = index === items.length - 1;
            return (
              <li key={`${item.label}-${index}`} className="flex items-center gap-1">
                {index > 0 ? <ChevronRight className="h-4 w-4" aria-hidden="true" /> : null}
                {isCurrent || !item.href ? (
                  <span aria-current={isCurrent ? "page" : undefined}>{item.label}</span>
                ) : (
                  <Link className="hover:text-foreground hover:underline" href={item.href}>
                    {item.label}
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
      <StructuredData
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: structuredItems,
        }}
      />
    </>
  );
}
