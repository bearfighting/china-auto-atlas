import { describe, expect, it } from "vitest";
import { publicMediaPath } from "./media";

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
  });
});
