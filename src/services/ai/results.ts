import { z } from "zod";
import { ingredients } from "@/data/catalog";
import { normalize } from "@/domain/matching";
import type { RecognitionCandidate } from "./provider";
export const recognitionSchema = z.object({
  items: z
    .array(
      z.object({
        name: z.string().trim().min(2).max(100),
        brand: z.string().max(100).default(""),
        count: z.number().int().min(1).max(100).default(1),
        confidence: z.number().min(0).max(1),
      }),
    )
    .max(50),
});
export function recognitionCandidates(value: unknown): RecognitionCandidate[] {
  return recognitionSchema.parse(value).items.map((item, index) => {
    // Brand-name foods stay private/unverified; only exact canonical names match.
    const canonical = !item.brand
      ? ingredients.find((i) =>
          [i.name, ...i.aliases].some(
            (name) => normalize(name) === normalize(item.name),
          ),
        )
      : undefined;
    return {
      item: {
        id: `scan-${Date.now()}-${index}`,
        ingredientId: canonical?.id ?? `private-scan-${Date.now()}-${index}`,
        name: [item.brand, item.name].filter(Boolean).join(" "),
        quantity: item.count,
        unit: "piece",
      },
      confidence: item.confidence,
      alternatives: [],
    };
  });
}
