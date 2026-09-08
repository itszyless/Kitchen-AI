import { z } from "zod";
export const quantitySchema = z.coerce.number().finite().positive().max(100000);
export const expirySchema = z
  .string()
  .refine(
    (v) =>
      !v ||
      (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
        !Number.isNaN(Date.parse(v)) &&
        new Date(v).toISOString().slice(0, 10) === v),
    "Use a real date in YYYY-MM-DD format.",
  );
export const productSchema = z.object({
  name: z.string().trim().min(2).max(100),
  brand: z.string().trim().max(100),
  quantity: quantitySchema,
  unit: z.enum(["g", "ml", "piece"]),
});
