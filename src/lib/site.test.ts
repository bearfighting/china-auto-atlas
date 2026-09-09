import { describe, expect, it } from "vitest";
import { resolveSiteUrl } from "./site";

describe("site URL resolution", () => {
  it("prefers the explicit public site URL", () => {
    expect(
      resolveSiteUrl({
        NEXT_PUBLIC_SITE_URL: "https://atlas.example.com/",
        VERCEL_PROJECT_PRODUCTION_URL: "project.vercel.app",
        VERCEL_URL: "preview.vercel.app",
      }),
    ).toBe("https://atlas.example.com");
  });

  it("falls back through detected Vercel URLs", () => {
    expect(resolveSiteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "project.vercel.app" })).toBe(
      "https://project.vercel.app",
    );
    expect(resolveSiteUrl({ VERCEL_URL: "preview.vercel.app" })).toBe("https://preview.vercel.app");
  });

  it("uses localhost when no usable URL is available", () => {
    expect(resolveSiteUrl({ NEXT_PUBLIC_SITE_URL: "https://" })).toBe("http://localhost:3000");
  });
});
