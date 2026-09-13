import { z } from "zod";
export const barcodeSchema = z
  .string()
  .regex(/^(\d{8}|\d{12}|\d{13}|\d{14})$/)
  .refine((code) => {
    const digits = code.split("").map(Number);
    const check = digits.pop();
    const sum = digits
      .reverse()
      .reduce((n, d, i) => n + d * (i % 2 === 0 ? 3 : 1), 0);
    return (10 - (sum % 10)) % 10 === check;
  }, "Invalid barcode checksum");
export type ProductResult = {
  id: string;
  name: string;
  brand: string;
  barcode: string;
  image?: string;
  nutrition?: Record<string, number>;
  source: "openfoodfacts";
  allergenStatus: "unknown" | "declared";
  allergens: string[];
};
export interface ProductProvider {
  lookup(barcode: string): Promise<ProductResult | null>;
}
const cache = new Map<
  string,
  { expires: number; value: ProductResult | null }
>();
const requests: number[] = [];
export const products: ProductProvider = {
  async lookup(code) {
    barcodeSchema.parse(code);
    const hit = cache.get(code);
    if (hit && hit.expires > Date.now()) return hit.value;
    while (requests.length && requests[0] < Date.now() - 60_000)
      requests.shift();
    if (requests.length >= 12)
      throw new Error("Please wait a minute before looking up more products.");
    requests.push(Date.now());
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 12_000);
    try {
      const response = await fetch(
        `https://world.openfoodfacts.org/api/v2/product/${code}?fields=code,product_name,brands,allergens_tags,allergens,image_front_url,nutriments`,
        { signal: controller.signal },
      );
      if (response.status === 404) return null;
      if (!response.ok)
        throw new Error(
          "Product search is unavailable right now. Please try again.",
        );
      const data = await response.json();
      const product = data.product;
      const value: ProductResult | null =
        data.status === 1 &&
        typeof product?.product_name === "string" &&
        product.product_name.trim()
          ? {
              id: `off-${code}`,
              barcode: code,
              name: product.product_name.trim(),
              brand: typeof product.brands === "string" ? product.brands : "",
              source: "openfoodfacts",
              image:
                typeof product.image_front_url === "string" &&
                product.image_front_url.startsWith("https://")
                  ? product.image_front_url
                  : undefined,
              nutrition: Object.fromEntries(
                [
                  ["Energy (kcal)", product.nutriments?.["energy-kcal_100g"]],
                  ["Protein (g)", product.nutriments?.proteins_100g],
                  ["Carbohydrates (g)", product.nutriments?.carbohydrates_100g],
                  ["Fat (g)", product.nutriments?.fat_100g],
                ].filter(
                  (entry): entry is [string, number] =>
                    typeof entry[1] === "number" &&
                    Number.isFinite(entry[1]) &&
                    entry[1] >= 0,
                ),
              ),
              allergenStatus: product.allergens_tags?.length
                ? "declared"
                : "unknown",
              allergens: Array.isArray(product.allergens_tags)
                ? product.allergens_tags.filter(
                    (a: unknown): a is string => typeof a === "string",
                  )
                : [],
            }
          : null;
      cache.set(code, { value, expires: Date.now() + 24 * 60 * 60_000 });
      return value;
    } finally {
      clearTimeout(timeout);
    }
  },
};
