import type { Metadata } from "next";
import { AtlasEntityCard } from "@/components/atlas-entity-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
import { manufacturerRepository } from "@/lib/data/repositories";
import { displayName, slugFor } from "@/lib/data/resolvers";

export const metadata: Metadata = {
  title: "Manufacturers",
  description: "Explore automotive manufacturers documented by China Auto Atlas.",
  alternates: { canonical: "/manufacturers" },
  openGraph: {
    title: "Manufacturers",
    description: "Explore automotive manufacturers documented by China Auto Atlas.",
    url: "/manufacturers",
  },
};

function manufacturerSummaryMeta(id: string): string {
  const summary = manufacturerRepository.getSummary(id);
  return `${summary.brandCount} brands · ${summary.vehicleCount} vehicles · ${summary.newsCount} news · ${summary.sourceCount} sources`;
}

export default function ManufacturersPage() {
  const manufacturers = manufacturerRepository.list();
  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Manufacturers" }]} />
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Atlas entities</p>
          <h1 className="text-4xl font-bold tracking-tight">Manufacturers</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore manufacturers and their connected brands, vehicles, events, and sources.
          </p>
        </header>
        {manufacturers.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {manufacturers.map((manufacturer) => (
              <AtlasEntityCard
                key={manufacturer.id}
                href={`/manufacturers/${slugFor(manufacturer)}`}
                title={displayName(manufacturer.names)}
                titleZh={manufacturer.names?.["zh-CN"]}
                eyebrow="Manufacturer"
                status={manufacturer.status}
                meta={manufacturerSummaryMeta(manufacturer.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No manufacturers collected"
            description="Manufacturer records will appear here when they are added to the atlas."
          />
        )}
      </div>
    </PageContainer>
  );
}
