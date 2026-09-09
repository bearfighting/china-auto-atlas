import { describe, expect, it } from "vitest";
import { publicMediaAlt, publicMediaPath } from "./media";

describe("media paths", () => {
  it("maps registered assets to public URLs", () => {
    expect(publicMediaPath("assets/images/vehicles/zeekr-7x/hero.svg")).toBe(
      "/assets/images/vehicles/zeekr-7x/hero.svg",
    );
    expect(publicMediaPath("/assets/images/brands/zeekr/logo.svg")).toBe(
      "/assets/images/brands/zeekr/logo.svg",
    );
  });

  it("rejects paths outside the registered asset root", () => {
    expect(publicMediaPath("/tmp/private.png")).toBeNull();
    expect(publicMediaPath("assets/../private.png")).toBeNull();
    expect(publicMediaPath("assets\\..\\private\\secret.png")).toBeNull();
    expect(publicMediaPath("assets/%2e%2e/private/secret.png")).toBeNull();
    expect(publicMediaPath("assets/%2F%2e%2e/private/secret.png")).toBeNull();
    expect(publicMediaPath("assets/%invalid/private.png")).toBeNull();
  });

  it("requires a meaningful localized alt text for public media", () => {
    expect(publicMediaAlt({ alt: { en: "ZEEKR 7X exterior" } })).toBe("ZEEKR 7X exterior");
    expect(publicMediaAlt({ alt: { "zh-CN": "极氪 7X 外观" } })).toBe("极氪 7X 外观");
    expect(publicMediaAlt({ alt: { en: "   ", "zh-CN": "极氪 7X 外观" } })).toBe("极氪 7X 外观");
    expect(publicMediaAlt({ alt: { en: "   " } })).toBeNull();
    expect(publicMediaAlt({})).toBeNull();
  });
});
