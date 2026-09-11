import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EntityHeader } from "@/components/entity-header";
import { MediaGallery } from "@/components/media-gallery";
import { ProductionContext } from "@/components/production-context";
import { SourceList } from "@/components/source-list";
import { SpecificationTable } from "@/components/specification-table";
import { Timeline } from "@/components/timeline";
import { UnknownState } from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { displayName, slugFor } from "@/lib/data/resolvers";
import { vehicleRepository } from "@/lib/data/repositories";
import { absoluteUrl } from "@/lib/site";

export function generateStaticParams() {
  return vehicleRepository.list().map((vehicle) => ({ slug: slugFor(vehicle) }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const vehicle = vehicleRepository.getBySlug(slug);
  return vehicle
    ? {
        title: displayName(vehicle.names),
        description: `${displayName(vehicle.names)} vehicle profile and market specifications.`,
        alternates: { canonical: `/vehicles/${slugFor(vehicle)}` },
        openGraph: {
          title: displayName(vehicle.names),
          description: `${displayName(vehicle.names)} vehicle profile and market specifications.`,
          url: absoluteUrl(`/vehicles/${slugFor(vehicle)}`),
        },
      }
    : {};
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = vehicleRepository.getBySlug(slug);
  if (!vehicle) notFound();
  const brand = vehicleRepository.getBrand(vehicle.id);
  const productLine = vehicleRepository.getProductLine(vehicle.id);
  const series = vehicleRepository.getSeries(vehicle.id);
  const manufacturers = vehicleRepository.getManufacturers(vehicle.id);
  const platform = vehicleRepository.getPlatform(vehicle.id);
  const technologies = vehicleRepository.getTechnologies(vehicle.id);
  const architecture = vehicleRepository.getPowertrainArchitecture(vehicle.id);
  const events = vehicleRepository.getRelatedEvents(vehicle.id);
  const sources = vehicleRepository.getRelatedSources(vehicle.id);
  const relatedNews = vehicleRepository.getRelatedNews(vehicle.id);
  const factories = vehicleRepository.getFactories(vehicle.id);
  const productionLines = vehicleRepository.getProductionLines(vehicle.id);
  return (
    <PageContainer>
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Vehicles", href: "/vehicles" },
            ...(brand
              ? [{ label: displayName(brand.names), href: `/brands/${slugFor(brand)}` }]
              : []),
            ...(productLine ? [{ label: displayName(productLine.names) }] : []),
            ...(series ? [{ label: displayName(series.names) }] : []),
            { label: displayName(vehicle.names) },
          ]}
        />
        <EntityHeader entity={vehicle} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Brand</CardTitle>
            </CardHeader>
            <CardContent>
              {brand ? (
                <Link
                  className="font-medium text-primary hover:underline"
                  href={`/brands/${slugFor(brand)}`}
                >
                  {displayName(brand.names)}
                </Link>
              ) : (
                <UnknownState />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Product hierarchy</CardTitle>
            </CardHeader>
            <CardContent>
              {productLine || series ? (
                [productLine, series]
                  .filter(Boolean)
                  .map((item) => <div key={item!.id}>{displayName(item!.names)}</div>)
              ) : (
                <UnknownState />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Manufacturer</CardTitle>
            </CardHeader>
            <CardContent>
              {manufacturers.length ? (
                manufacturers.map((item) => (
                  <Link
                    key={item.id}
                    className="mr-2 font-medium text-primary hover:underline"
                    href={`/manufacturers/${slugFor(item)}`}
                  >
                    {displayName(item.names)}
                  </Link>
                ))
              ) : (
                <UnknownState />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Platform</CardTitle>
            </CardHeader>
            <CardContent>{platform ? displayName(platform.names) : <UnknownState />}</CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Classification</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.powertrain_types?.length ? (
                <div className="flex flex-wrap gap-2">
                  {vehicle.powertrain_types.map((type) => (
                    <Badge key={type} variant="muted">
                      {{ bev: "BEV", phev: "PHEV", erev: "EREV" }[type] ?? type}
                    </Badge>
                  ))}
                </div>
              ) : (
                <UnknownState />
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm text-muted-foreground">Architecture</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">
                {architecture ? displayName(architecture.names) : <UnknownState />}
              </p>
              <p className="text-sm text-muted-foreground">
                Motor positions:{" "}
                {vehicle.motor_positions?.length ? vehicle.motor_positions.join(", ") : "Unknown"}
              </p>
            </CardContent>
          </Card>
        </div>
        <ProductionContext
          factories={factories}
          productionLines={productionLines}
          vehicles={[vehicle]}
        />
        <section className="space-y-4" aria-labelledby="vehicle-media">
          <h2 id="vehicle-media" className="text-2xl font-semibold">
            Media
          </h2>
          <MediaGallery media={vehicleRepository.getApprovedMedia(vehicle.id)} />
        </section>
        <section className="space-y-4" aria-labelledby="vehicle-specifications">
          <div>
            <h2 id="vehicle-specifications" className="text-2xl font-semibold">
              Market specifications
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Values remain scoped to market and variant context.
            </p>
          </div>
          <SpecificationTable
            specifications={vehicleRepository.getMarketSpecifications(vehicle.id)}
          />
        </section>
        <div className="grid gap-10 lg:grid-cols-2">
          <section className="space-y-4" aria-labelledby="vehicle-timeline">
            <h2 id="vehicle-timeline" className="text-2xl font-semibold">
              Timeline
            </h2>
            <Timeline events={events} />
          </section>
          <section className="space-y-4" aria-labelledby="vehicle-technology">
            <h2 id="vehicle-technology" className="text-2xl font-semibold">
              Technology
            </h2>
            {technologies.length ? (
              <div className="flex flex-wrap gap-2">
                {technologies.map((technology) => (
                  <Link key={technology.id} href={`/technologies/${slugFor(technology)}`}>
                    <Badge variant="outline">{displayName(technology.names)}</Badge>
                  </Link>
                ))}
              </div>
            ) : (
              <UnknownState label="No technology relationships collected" />
            )}
          </section>
        </div>
        <section className="space-y-4" aria-labelledby="vehicle-news">
          <h2 id="vehicle-news" className="text-2xl font-semibold">
            Related news
          </h2>
          {relatedNews.length ? (
            <div className="grid gap-3">
              {relatedNews.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-5">
                    <Link
                      className="font-medium text-primary hover:underline"
                      href={`/news/${item.slug}`}
                    >
                      {item.title}
                    </Link>
                    <p className="mt-1 text-xs text-muted-foreground">{item.published_at}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <UnknownState label="No related news collected" />
          )}
        </section>
        <section className="space-y-4" aria-labelledby="vehicle-sources">
          <h2 id="vehicle-sources" className="text-2xl font-semibold">
            Sources
          </h2>
          <SourceList sources={sources} />
        </section>
      </div>
    </PageContainer>
  );
}
