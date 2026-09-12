import { z } from "zod";

const product = z.object({
  code: z.string().regex(/^\d{8,14}$/),
  product_name: z.string().trim().min(1),
  brands: z.string().optional().default(""),
  image_front_small_url: z.string().url().optional(),
  quantity: z.string().optional().default(""),
});
export type SearchProduct = z.infer<typeof product>;
export const productCountries = [
  ["WORLD", "Worldwide"],
  ["AT", "Austria"],
  ["DE", "Germany"],
  ["CH", "Switzerland"],
  ["GB", "United Kingdom"],
  ["US", "United States"],
  ["FR", "France"],
  ["IT", "Italy"],
  ["ES", "Spain"],
  ["NL", "Netherlands"],
  ["BE", "Belgium"],
  ["PL", "Poland"],
  ["CA", "Canada"],
  ["AU", "Australia"],
] as const;
const cache = new Map<string, { at: number; products: SearchProduct[] }>();
const calls: number[] = [];

// Explicit submission only: Open Food Facts prohibits search-as-you-type.
export async function searchProducts(
  query: string,
  country: string,
  signal?: AbortSignal,
) {
  const term = query.trim().slice(0, 120);
  if (term.length < 2) return [];
  const region = productCountries.some(([code]) => code === country)
    ? country
    : "WORLD";
  const key = `${region}:${term.toLocaleLowerCase()}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < 15 * 60_000) return hit.products;
  while (calls.length && calls[0] < Date.now() - 60_000) calls.shift();
  if (calls.length >= 8)
    throw new Error("Please wait a minute before searching again.");
  calls.push(Date.now());
  const host = region === "WORLD" ? "world" : region.toLowerCase();
  const params = new URLSearchParams({
    search_terms: term,
    search_simple: "1",
    action: "process",
    json: "1",
    page_size: "30",
    fields: "code,product_name,brands,image_front_small_url,quantity",
  });
  const controller = new AbortController();
  const abort = () => controller.abort();
  if (signal?.aborted) controller.abort();
  signal?.addEventListener("abort", abort, { once: true });
  const timeout = setTimeout(abort, 20_000);
  try {
    const response = await fetch(
      `https://${host}.openfoodfacts.org/cgi/search.pl?${params}`,
      { signal: controller.signal },
    );
    if (!response.ok)
      throw new Error(
        "Product search is unavailable right now. Please try again.",
      );
    const data = await response.json();
    if (!Array.isArray(data.products))
      throw new Error("We couldn’t read these results. Please try again.");
    const unique = new Map<string, SearchProduct>();
    for (const raw of data.products) {
      const parsed = product.safeParse(raw);
      if (parsed.success) unique.set(parsed.data.code, parsed.data);
    }
    const products = [...unique.values()];
    if (cache.size >= 100) cache.delete(cache.keys().next().value!);
    cache.set(key, { at: Date.now(), products });
    return products;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abort);
  }
}
