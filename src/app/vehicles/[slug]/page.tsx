import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageContainer } from "@/components/page-container";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { EntityHeader } from "@/components/entity-header";
import { SourceList } from "@/components/source-list";
import { SpecificationTable } from "@/components/specification-table";
import { Timeline } from "@/components/timeline";
import { UnknownState } from "@/components/states";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { displayName, slugFor } from "@/lib/data/resolvers";
import { vehicleRepository } from "@/lib/data/repositories";

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
      }
    : {};
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = vehicleRepository.getBySlug(slug);
  if (!vehicle) notFound();
  const brand = vehicleRepository.getBrand(vehicle.id);
  const manufacturers = vehicleRepository.getManufacturers(vehicle.id);
  const platform = vehicleRepository.getPlatform(vehicle.id);
  const technologies = vehicleRepository.getTechnologies(vehicle.id);
  const events = vehicleRepository.getRelatedEvents(vehicle.id);
  const sources = vehicleRepository.getRelatedSources(vehicle.id);
  const relatedNews = vehicleRepository.getRelatedNews(vehicle.id);
  return (
    <PageContainer>
      <div className="space-y-10">
        <Breadcrumbs
          items={[
            { label: "Home", href: "/" },
            { label: "Vehicles", href: "/vehicles" },
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
                <span className="font-medium">{displayName(brand.names)}</span>
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
                  <span key={item.id} className="mr-2 font-medium">
                    {displayName(item!.names)}
                  </span>
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
              <CardTitle className="text-sm text-muted-foreground">Powertrain</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.powertrain_types?.length ? (
                <div className="flex flex-wrap gap-2">
                  {vehicle.powertrain_types.map((type) => (
                    <Badge key={type} variant="muted">
                      {type}
                    </Badge>
                  ))}
                </div>
              ) : (
                <UnknownState />
              )}
            </CardContent>
          </Card>
        </div>
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
                  <Badge key={technology!.id} variant="outline">
                    {displayName(technology!.names)}
                  </Badge>
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
