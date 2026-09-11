import type { Metadata } from "next";
import { AtlasEntityCard } from "@/components/atlas-entity-card";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EmptyState } from "@/components/states";
import { PageContainer } from "@/components/page-container";
import { technologyRepository } from "@/lib/data/repositories";
import { displayName, slugFor } from "@/lib/data/resolvers";

export const metadata: Metadata = {
  title: "Technologies",
  description: "Explore automotive technologies documented by China Auto Atlas.",
  alternates: { canonical: "/technologies" },
  openGraph: {
    title: "Technologies",
    description: "Explore automotive technologies documented by China Auto Atlas.",
    url: "/technologies",
  },
};

export default function TechnologiesPage() {
  const technologies = technologyRepository.list();
  return (
    <PageContainer>
      <div className="space-y-8">
        <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Technologies" }]} />
        <header className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">Atlas entities</p>
          <h1 className="text-4xl font-bold tracking-tight">Technologies</h1>
          <p className="max-w-2xl text-muted-foreground">
            Explore technology records connected to vehicles, events, news, and sources.
          </p>
        </header>
        {technologies.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {technologies.map((technology) => (
              <AtlasEntityCard
                key={technology.id}
                href={`/technologies/${slugFor(technology)}`}
                title={displayName(technology.names)}
                titleZh={technology.names?.["zh-CN"]}
                eyebrow="Technology"
                status={technology.status}
                meta={technology.kind ? `Kind: ${technology.kind}` : undefined}
                description={
                  typeof technology.description === "string" ? technology.description : undefined
                }
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No technologies collected"
            description="Technology records will appear here when they are added to the atlas."
          />
        )}
      </div>
    </PageContainer>
  );
}
