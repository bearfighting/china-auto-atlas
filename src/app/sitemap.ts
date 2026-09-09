import type { MetadataRoute } from "next";
import {
  brandRepository,
  eventRepository,
  manufacturerRepository,
  newsRepository,
  technologyRepository,
  vehicleRepository,
} from "@/lib/data/repositories";
import { absoluteUrl } from "@/lib/site";

function validDate(value: string | undefined | null): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? undefined : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const news = newsRepository.list();
  return [
    { url: absoluteUrl("/") },
    { url: absoluteUrl("/news") },
    { url: absoluteUrl("/vehicles") },
    ...news.map((document) => ({
      url: absoluteUrl(`/news/${document.slug}`),
      lastModified: validDate(document.updated_at ?? document.published_at),
    })),
    ...vehicleRepository.list().map((vehicle) => ({
      url: absoluteUrl(`/vehicles/${vehicle.slug ?? vehicle.id}`),
    })),
    ...brandRepository.list().map((brand) => ({
      url: absoluteUrl(`/brands/${brand.slug ?? brand.id}`),
    })),
    ...manufacturerRepository.list().map((manufacturer) => ({
      url: absoluteUrl(`/manufacturers/${manufacturer.slug ?? manufacturer.id}`),
    })),
    ...technologyRepository.list().map((technology) => ({
      url: absoluteUrl(`/technologies/${technology.slug ?? technology.id}`),
    })),
    ...eventRepository.list().map((event) => ({
      url: absoluteUrl(`/events/${event.id}`),
    })),
  ];
}
