import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/navigation/breadcrumbs";
import { EntityFacts, EntityFact } from "@/components/entity/entity-facts";
import { EntityHeader } from "@/components/entity/entity-header";
import { RelatedNewsList } from "@/components/content/related-news-list";
import { SourceList } from "@/components/content/source-list";
import { Timeline } from "@/components/content/timeline";
import { UnknownState } from "@/components/content/states";
import { VehicleCard } from "@/components/entity/vehicle-card";
import { PageContainer } from "@/components/layout/page-container";
import { ProductHierarchy } from "@/components/entity/product-hierarchy";
import { ProductionContext } from "@/components/entity/production-context";
import { displayName, slugFor } from "@/lib/data/resolvers";
import { brandRepository, manufacturerRepository } from "@/lib/data/repositories";

export const dynamicParams = false;

export function generateStaticParams() {
  return manufacturerRepository.list().map((manufacturer) => ({ slug: slugFor(manufacturer) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const manufacturer = manufacturerRepository.getBySlug(slug);
  return manufacturer
    ? {
        title: displayName(manufacturer.names),
        description: `${displayName(manufacturer.names)} manufacturer profile and related vehicles.`,
        alternates: { canonical: `/manufacturers/${slugFor(manufacturer)}` },
        openGraph: {
          title: displayName(manufacturer.names),
          description: `${displayName(manufacturer.names)} manufacturer profile.`,
        },
      }
    : {};
}

export default async function ManufacturerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const manufacturer = manufacturerRepository.getBySlug(slug);
  if (!manufacturer) notFound();
  const vehicles = manufacturerRepository.getVehicles(manufacturer.id);
  const brands = manufacturerRepository.getBrands(manufacturer.id);
  const factories = manufacturerRepository.getFactories(manufacturer.id);
  const productionLines = manufacturerRepository.getProductionLines(manufacturer.id);
  const summary = manufacturerRepository.getSummary(manufacturer.id);
  const productLines = brands.flatMap((brand) => brandRepository.getProductLines(brand.id));
  const series = brands.flatMap((brand) => brandRepository.getSeries(brand.id));
  return (
    <PageContainer>
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Manufacturer", href: "/manufacturers" },
            { label: displayName(manufacturer.names) },
          ]}
        />
        <EntityHeader entity={manufacturer} eyebrow="Manufacturer" />
        <section
          id="manufacturer-overview"
          className="scroll-mt-6 space-y-4"
          aria-labelledby="manufacturer-overview-heading"
        >
          <h2 id="manufacturer-overview-heading" className="sr-only">
            Overview
          </h2>
          <p className="text-sm text-muted-foreground">
            {summary.brandCount} associated brands · {summary.vehicleCount} vehicles ·{" "}
            {factories.length} factories · {productionLines.length} production lines
          </p>
          <EntityFacts>
            <EntityFact label="Brands" value={summary.brandCount} />
            <EntityFact label="Vehicles" value={summary.vehicleCount} />
            <EntityFact label="Factories" value={factories.length} />
            <EntityFact label="Production lines" value={productionLines.length} />
          </EntityFacts>
          <EntityFacts>
            <EntityFact label="Description" value={manufacturer.description} />
            <EntityFact
              label="Founded"
              value={(manufacturer.founded as { value?: string } | undefined)?.value}
            />
            <EntityFact label="Origin" value={manufacturer.origin} />
            <EntityFact label="Headquarters" value={manufacturer.headquarters} />
            <EntityFact label="Company type" value={manufacturer.company_type} />
          </EntityFacts>
        </section>
        <nav aria-label="Manufacturer sections" className="flex flex-wrap gap-2 border-y py-3">
          {[
            ["Overview", "manufacturer-overview"],
            ["Brands", "manufacturer-brands"],
            ["Vehicles", "manufacturer-vehicles"],
            ["Production", "production-context"],
            ["Events", "manufacturer-events"],
            ["News", "manufacturer-news"],
            ["Sources", "manufacturer-sources"],
          ].map(([label, id]) => (
            <a
              key={id}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={`#${id}`}
            >
              {label}
            </a>
          ))}
        </nav>
        <section
          id="manufacturer-brands"
          className="scroll-mt-6 space-y-4"
          aria-labelledby="manufacturer-brands-heading"
        >
          <h2 id="manufacturer-brands-heading" className="text-2xl font-semibold">
            Associated brands
          </h2>
          <p className="text-sm text-muted-foreground">
            Brands currently connected to this manufacturer in the atlas.
          </p>
          {brands.length ? (
            <div className="flex flex-wrap gap-2">
              {brands.map((brand) => (
                <Link
                  key={brand.id}
                  className="rounded-full border px-3 py-1 text-sm hover:bg-accent"
                  href={`/brands/${slugFor(brand)}`}
                >
                  {displayName(brand.names)}
                </Link>
              ))}
            </div>
          ) : (
            <UnknownState label="No brands connected to this manufacturer" />
          )}
        </section>
        {!productLines.length && !series.length ? (
          <section
            id="manufacturer-vehicles"
            className="scroll-mt-6 space-y-4"
            aria-labelledby="manufacturer-vehicles-heading"
          >
            <h2 id="manufacturer-vehicles-heading" className="text-2xl font-semibold">
              Vehicles
            </h2>
            <p className="text-sm text-muted-foreground">
              Vehicle records currently connected to this manufacturer.
            </p>
            {vehicles.length ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {vehicles.map((vehicle) => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            ) : (
              <UnknownState label="No vehicles connected to this manufacturer" />
            )}
          </section>
        ) : null}
        {productLines.length || series.length ? (
          <section
            id="manufacturer-vehicles"
            className="scroll-mt-6 space-y-4"
            aria-labelledby="manufacturer-product-hierarchy-heading"
          >
            <h2 id="manufacturer-product-hierarchy-heading" className="text-2xl font-semibold">
              Product lines and vehicle series
            </h2>
            <p className="text-sm text-muted-foreground">
              Vehicle hierarchy currently connected to this manufacturer through its brands.
            </p>
            <ProductHierarchy productLines={productLines} series={series} vehicles={vehicles} />
          </section>
        ) : null}
        <ProductionContext
          factories={factories}
          productionLines={productionLines}
          vehicles={vehicles}
          showEmpty
        />
        <section
          id="manufacturer-events"
          className="scroll-mt-6 space-y-4"
          aria-labelledby="manufacturer-events-heading"
        >
          <h2 id="manufacturer-events-heading" className="text-2xl font-semibold">
            Related events
          </h2>
          <p className="text-sm text-muted-foreground">
            Events currently connected to this manufacturer.
          </p>
          <Timeline events={manufacturerRepository.getRelatedEvents(manufacturer.id)} />
        </section>
        <section
          id="manufacturer-news"
          className="scroll-mt-6 space-y-4"
          aria-labelledby="manufacturer-news-heading"
        >
          <h2 id="manufacturer-news-heading" className="text-2xl font-semibold">
            Related news
          </h2>
          <p className="text-sm text-muted-foreground">
            News currently connected to this manufacturer.
          </p>
          <RelatedNewsList documents={manufacturerRepository.getRelatedNews(manufacturer.id)} />
        </section>
        <section
          id="manufacturer-sources"
          className="scroll-mt-6 space-y-4"
          aria-labelledby="manufacturer-sources-heading"
        >
          <h2 id="manufacturer-sources-heading" className="text-2xl font-semibold">
            Sources
          </h2>
          <SourceList sources={manufacturerRepository.getRelatedSources(manufacturer.id)} />
        </section>
      </div>
    </PageContainer>
  );
}
