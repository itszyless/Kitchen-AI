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
  source: "openfoodfacts";
  allergenStatus: "unknown" | "declared";
  allergens: string[];
};
export interface ProductProvider {
  lookup(barcode: string): Promise<ProductResult | null>;
}
export const products: ProductProvider = {
  async lookup(code) {
    barcodeSchema.parse(code);
    throw new Error(
      "The live product database is not connected yet. You can enter this product privately below.",
    );
  },
};
