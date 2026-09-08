import { describe, it, expect } from "vitest";
import {
  quantitySchema,
  expirySchema,
  productSchema,
} from "@/features/pantry/validation";
import { barcodeSchema } from "@/services/products/provider";
describe("Pantry validation", () => {
  it.each(["", 0, -1, "NaN", "Infinity", 100001])(
    "rejects invalid quantity %s",
    (q) => expect(quantitySchema.safeParse(q).success).toBe(false),
  );
  it("accepts positive decimal quantities", () =>
    expect(quantitySchema.parse("1.5")).toBe(1.5));
  it.each(["2026-02-30", "yesterday", "2026-13-01"])(
    "rejects impossible expiry %s",
    (v) => expect(expirySchema.safeParse(v).success).toBe(false),
  );
  it("allows an omitted expiry", () => expect(expirySchema.parse("")).toBe(""));
  it("requires a meaningful product name", () =>
    expect(
      productSchema.safeParse({
        name: " ",
        brand: "",
        quantity: 1,
        unit: "piece",
      }).success,
    ).toBe(false));
});
describe("Barcodes", () => {
  it("validates EAN-13", () =>
    expect(barcodeSchema.safeParse("3017620422003").success).toBe(true));
  it("rejects a bad checksum", () =>
    expect(barcodeSchema.safeParse("3017620422004").success).toBe(false));
  it("rejects arbitrary text", () =>
    expect(barcodeSchema.safeParse("not a barcode").success).toBe(false));
});
