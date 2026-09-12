import { useState } from "react";
import { z } from "zod";
import { View } from "react-native";
import { Button, T } from "./ui";
import { useCook } from "@/state/store";
import { router } from "expo-router";
import { ingredientById } from "@/data/catalog";
import { safeIngredient, normalize } from "@/domain/matching";
import { kitchenAI } from "@/services/ai/client";
const schema = z.object({
  suggestions: z
    .array(
      z.object({
        pantryId: z.string(),
        reason: z.string().max(600),
        instruction: z.string().max(800),
        quantity: z.number().positive(),
        unit: z.enum(["g", "ml", "piece"]),
      }),
    )
    .max(5),
});
export function AISubstitutions({
  ingredient,
  recipe,
}: {
  ingredient: string;
  recipe: string;
}) {
  const pantry = useCook((s) => s.pantry);
  const preferences = useCook((s) => s.preferences);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [suggestions, setSuggestions] = useState<
    z.infer<typeof schema>["suggestions"]
  >([]);
  const [outsidePantry, setOutsidePantry] = useState(false);
  const [checked, setChecked] = useState(false);
  const [names, setNames] = useState<Record<string, string>>({});
  const ask = async (outside = false) => {
    setOutsidePantry(outside);
    setBusy(true);
    setMessage("");
    setSuggestions([]);
    try {
      const candidates = outside
        ? Object.values(ingredientById).map((i) => ({
            id: i.id,
            ingredientId: i.id,
            name: i.name,
            quantity: 100000,
            unit: "g" as const,
          }))
        : pantry;
      const allowed = candidates.filter((p) => {
        const i = ingredientById[p.ingredientId];
        if (!i) return p.quantity > 0 && !preferences.allergies.length && !(preferences.customAllergies ?? []).length && !preferences.dislikes.length && !(preferences.foodPreferences ?? []).length && preferences.diet === "Anything";
        if (
          p.quantity <= 0 ||
          !safeIngredient(i.id, preferences.allergies) ||
          preferences.dislikes.includes(i.id)
        )
          return false;
        if (
          (preferences.customAllergies ?? []).some((a) =>
            normalize([i.name, ...i.aliases].join(" ")).includes(normalize(a)),
          )
        )
          return false;
        if (
          preferences.diet !== "Anything" &&
          i.allergens.some((a) => ["Fish", "Shellfish", "Molluscs"].includes(a))
        )
          return false;
        return (
          preferences.diet !== "Vegan" ||
          !i.allergens.some((a) => ["Milk", "Eggs"].includes(a))
        );
      });
      if (!allowed.length)
        throw new Error(
          pantry.length
            ? "No ingredients from your pantry can be used instead."
            : "You haven’t added any ingredients to your pantry yet.",
        );
      const data = schema.parse(
        await kitchenAI({
          action: "substitute",
          limit: outside ? 5 : 3,
          ingredient,
          recipe,
          pantry: allowed.map((p) => ({
            id: p.id,
            name: ingredientById[p.ingredientId]?.name ?? p.name,
            quantity: p.quantity,
            unit: p.unit,
          })),
        }),
      );
      const valid = data.suggestions.filter((s) =>
        allowed.some(
          (p) =>
            p.id === s.pantryId &&
            p.unit === s.unit &&
            p.quantity >= s.quantity,
        ),
      );
      setNames(Object.fromEntries(allowed.map((p) => [p.id, p.name])));
      setSuggestions(valid);
      if (!valid.length)
        setMessage(
          outside
            ? "No suitable substitutions were found for this recipe."
            : "No ingredients from your pantry can be used instead.",
        );
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Could not check substitutions.",
      );
    } finally {
      setChecked(true);
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 10 }}>
      {pantry.length > 0 ? (
        <Button
          label={busy ? "Checking this recipe…" : "Check my pantry with AI"}
          secondary
          disabled={busy}
          onPress={() => void ask()}
        />
      ) : (
        <T>You haven’t added any ingredients to your pantry yet.</T>
      )}
      {!pantry.length || (checked && !suggestions.length) ? (
        <View style={{ gap: 10 }}>
          <Button
            label={busy ? "Finding alternatives…" : "Show top 5 substitutions"}
            secondary
            disabled={busy}
            onPress={() => void ask(true)}
          />
          <Button
            label="Scan ingredients"
            onPress={() =>
              router.push({
                pathname: "/capture",
                params: { mode: "ingredients" },
              })
            }
          />
        </View>
      ) : null}
      {outsidePantry && suggestions.length > 0 ? (
        <T muted>Alternatives to buy</T>
      ) : null}
      <T muted size={12}>
        AI suggestions need your review. Check product labels for allergens.
      </T>
      {suggestions.map((s) => (
        <View key={s.pantryId} style={{ gap: 6 }}>
          <T bold>
            {names[s.pantryId]} · {s.quantity} {s.unit}
          </T>
          <T>{s.reason}</T>
          <T muted>{s.instruction}</T>
        </View>
      ))}
      {message ? (
        <T accessibilityRole="alert" size={13}>
          {message}
        </T>
      ) : null}
    </View>
  );
}
