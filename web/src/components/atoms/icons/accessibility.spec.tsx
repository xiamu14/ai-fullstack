import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Home84Icon } from "./home-84.tsx";
import { TwoUserIcon } from "./two-user-icon.tsx";

describe.each([Home84Icon, TwoUserIcon])("icon accessibility", (Icon) => {
  it("hides decorative icons", () => {
    expect(renderToStaticMarkup(<Icon />)).toContain('aria-hidden="true"');
  });
  it("exposes an image named by visible text", () => {
    const svg = renderToStaticMarkup(<Icon aria-labelledby="label" />);
    expect(svg).toContain('role="img"');
    expect(svg).toContain('aria-labelledby="label"');
    expect(svg).not.toContain('aria-hidden="true"');
  });
  it("exposes an image named by aria-label", () => {
    const svg = renderToStaticMarkup(<Icon aria-label="首页" />);
    expect(svg).toContain('role="img"');
    expect(svg).not.toContain('aria-hidden="true"');
  });
  it("keeps an explicitly decorative named icon hidden", () => {
    expect(renderToStaticMarkup(<Icon aria-label="首页" aria-hidden />)).toContain('aria-hidden="true"');
  });
});
