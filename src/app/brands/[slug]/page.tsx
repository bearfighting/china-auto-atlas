import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EntityFacts, EntityFact } from "@/components/entity-facts";
import { EntityHeader } from "@/components/entity-header";
import { RelatedNewsList } from "@/components/related-news-list";
import { SourceList } from "@/components/source-list";
import { Timeline } from "@/components/timeline";
import { UnknownState } from "@/components/states";
import { VehicleCard } from "@/components/vehicle-card";
import { PageContainer } from "@/components/page-container";
import { ProductHierarchy } from "@/components/product-hierarchy";
import { ProductionContext } from "@/components/production-context";
import { displayName, slugFor } from "@/lib/data/resolvers";
import { brandRepository, productionLineRepository } from "@/lib/data/repositories";

export const dynamicParams = false;

export function generateStaticParams() {
  return brandRepository.list().map((brand) => ({ slug: slugFor(brand) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const brand = brandRepository.getBySlug(slug);
  return brand
    ? {
        title: displayName(brand.names),
        description: `${displayName(brand.names)} brand profile and related vehicles.`,
        alternates: { canonical: `/brands/${slugFor(brand)}` },
        openGraph: {
          title: displayName(brand.names),
          description: `${displayName(brand.names)} brand profile.`,
        },
      }
    : {};
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const brand = brandRepository.getBySlug(slug);
  if (!brand) notFound();
  const vehicles = brandRepository.getVehicles(brand.id);
  const productLines = brandRepository.getProductLines(brand.id);
  const series = brandRepository.getSeries(brand.id);
  const factories = brandRepository.getFactories(brand.id);
  const productionLines = factories.flatMap((factory) =>
    productionLineRepository.getByFactory(factory.id),
  );
  return (
    <PageContainer>
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Brand", href: "/brands" },
            { label: displayName(brand.names) },
          ]}
        />
        <EntityHeader entity={brand} eyebrow="Brand" />
        <EntityFacts>
          <EntityFact label="Positioning" value={brand.positioning} />
          <EntityFact label="Powertrain focus" value={brand.powertrain_focus} />
          <EntityFact
            label="Founded"
            value={(brand.founded as { value?: string } | undefined)?.value}
          />
          <EntityFact label="Market codes" value={brand.market_codes} />
        </EntityFacts>
        {productLines.length || series.length ? (
          <section className="space-y-4" aria-labelledby="brand-product-hierarchy">
            <div>
              <h2 id="brand-product-hierarchy" className="text-2xl font-semibold">
                Product lines and vehicle series
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Optional product organization is shown when supported by sources.
              </p>
            </div>
            <ProductHierarchy productLines={productLines} series={series} vehicles={vehicles} />
          </section>
        ) : vehicles.length ? (
          <section className="space-y-4" aria-labelledby="brand-vehicles">
            <h2 id="brand-vehicles" className="text-2xl font-semibold">
              Vehicles
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <VehicleCard key={vehicle.id} vehicle={vehicle} />
              ))}
            </div>
          </section>
        ) : (
          <UnknownState label="No vehicles connected to this brand" />
        )}
        {factories.length ? (
          <ProductionContext
            factories={factories}
            productionLines={productionLines}
            vehicles={vehicles}
          />
        ) : null}
        <section className="space-y-4" aria-labelledby="brand-events">
          <h2 id="brand-events" className="text-2xl font-semibold">
            Related events
          </h2>
          <Timeline events={brandRepository.getRelatedEvents(brand.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="brand-news">
          <h2 id="brand-news" className="text-2xl font-semibold">
            Related news
          </h2>
          <RelatedNewsList documents={brandRepository.getRelatedNews(brand.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="brand-sources">
          <h2 id="brand-sources" className="text-2xl font-semibold">
            Sources
          </h2>
          <SourceList sources={brandRepository.getRelatedSources(brand.id)} />
        </section>
      </div>
    </PageContainer>
  );
}
