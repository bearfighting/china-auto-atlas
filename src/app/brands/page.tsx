import type { Metadata } from "next";
import { AtlasEntityCard } from "@/components/atlas-entity-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
import { brandRepository } from "@/lib/data/repositories";
import { displayName, slugFor } from "@/lib/data/resolvers";

export const metadata: Metadata = {
  title: "Brands",
  description: "Explore automotive brands documented by China Auto Atlas.",
  alternates: { canonical: "/brands" },
  openGraph: {
    title: "Brands",
    description: "Explore automotive brands documented by China Auto Atlas.",
    url: "/brands",
  },
};

export default function BrandsPage() {
  const brands = brandRepository.list();
  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Brands" }]} />
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Atlas entities</p>
          <h1 className="text-4xl font-bold tracking-tight">Brands</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore automotive brands and their connected vehicles, events, news, and sources.
          </p>
        </header>
        {brands.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {brands.map((brand) => (
              <AtlasEntityCard
                key={brand.id}
                href={`/brands/${slugFor(brand)}`}
                title={displayName(brand.names)}
                titleZh={brand.names?.["zh-CN"]}
                eyebrow="Brand"
                status={brand.status}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No brands collected"
            description="Brand records will appear here when they are added to the atlas."
          />
        )}
      </div>
    </PageContainer>
  );
}
