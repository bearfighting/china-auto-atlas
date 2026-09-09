import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ErrorState, EmptyState, UnknownState } from "./states";

describe("state components", () => {
  it("renders an actionable error state without internal details", () => {
    const markup = renderToStaticMarkup(ErrorState({ onRetry: () => undefined }));
    expect(markup).toContain('data-testid="error-state"');
    expect(markup).toContain("Something went wrong");
    expect(markup).toContain("Try again");
    expect(markup).not.toMatch(/stack|build\/|data\//i);
  });

  it("renders readable unknown and empty states", () => {
    expect(renderToStaticMarkup(UnknownState({ label: "Date unknown" }))).toContain("Date unknown");
    expect(
      renderToStaticMarkup(
        EmptyState({ title: "No results found", description: "No records matched the query." }),
      ),
    ).toContain("No results found");
  });
});
