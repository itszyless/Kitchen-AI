import { afterEach, describe, expect, it, vi } from "vitest";
import { searchProducts } from "../src/services/products/search";
afterEach(() => vi.unstubAllGlobals());
describe("product search", () => {
  it("does not query the provider for an empty or single-letter term", async () => {
    const fetcher = vi.fn();
    vi.stubGlobal("fetch", fetcher);
    expect(await searchProducts("a", "AT")).toEqual([]);
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("uses a country-specific text search, validates rows, deduplicates and caches", async () => {
    const fetcher = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        products: [
          {
            code: "3017620422003",
            product_name: "Hazelnut spread",
            brands: "Brand",
          },
          {
            code: "3017620422003",
            product_name: "Hazelnut spread",
            brands: "Brand",
          },
          { code: "broken", product_name: "Bad record" },
          { code: "12345678", product_name: "" },
        ],
      }),
    });
    vi.stubGlobal("fetch", fetcher);
    const result = await searchProducts("spread & cocoa", "AT");
    expect(result).toHaveLength(1);
    const url = new URL(fetcher.mock.calls[0][0]);
    expect(url.hostname).toBe("at.openfoodfacts.org");
    expect(url.searchParams.get("search_terms")).toBe("spread & cocoa");
    expect(await searchProducts("spread & cocoa", "AT")).toEqual(result);
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
  it("falls back to worldwide for an unsupported region and reports provider failure", async () => {
    const fetcher = vi.fn().mockResolvedValue({ ok: false });
    vi.stubGlobal("fetch", fetcher);
    await expect(
      searchProducts("unavailable product", "invalid"),
    ).rejects.toThrow("unavailable");
    expect(new URL(fetcher.mock.calls[0][0]).hostname).toBe(
      "world.openfoodfacts.org",
    );
  });
});
