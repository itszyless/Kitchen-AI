import { ingredientById, ingredients } from "@/data/catalog";
import {
  Allergen,
  PantryItem,
  Preferences,
  Recipe,
  RecipeIngredient,
  ShoppingItem,
} from "./types";
export const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export function searchIngredients(query: string) {
  const tokens = normalize(query).split(" ").filter(Boolean);
  return ingredients.filter((i) =>
    tokens.every((t) =>
      normalize([i.name, ...i.aliases].join(" ")).includes(t),
    ),
  );
}
export function safeIngredient(id: string, allergies: Allergen[]) {
  const i = ingredientById[id];
  return Boolean(i) && !i.allergens.some((a) => allergies.includes(a));
}
export function eligible(recipe: Recipe, p: Preferences) {
  return (
    recipe.ingredients.every((i) =>
      safeIngredient(i.ingredientId, p.allergies),
    ) &&
    (p.diet === "Anything" ||
      recipe.tags.includes(p.diet) ||
      (p.diet === "Vegetarian" && recipe.tags.includes("Vegan"))) &&
    !recipe.ingredients.some((i) => p.dislikes.includes(i.ingredientId))
  );
}
export function available(i: RecipeIngredient, pantry: PantryItem[]) {
  return pantry
    .filter((p) => p.ingredientId === i.ingredientId && p.unit === i.unit)
    .reduce((n, p) => n + p.quantity, 0);
}
export function match(
  recipe: Recipe,
  pantry: PantryItem[],
  servings = recipe.servings,
) {
  const required = recipe.ingredients.filter((i) => !i.optional);
  const ratio = servings / recipe.servings;
  const missing = required
    .map((i) => ({
      ...i,
      quantity: Math.max(0, i.quantity * ratio - available(i, pantry)),
    }))
    .filter((i) => i.quantity > 0);
  const score = Math.round(
    (100 *
      required.reduce(
        (n, i) => n + Math.min(1, available(i, pantry) / (i.quantity * ratio)),
        0,
      )) /
      Math.max(1, required.length),
  );
  return { score, missing };
}
export function mergeShopping(
  current: ShoppingItem[],
  additions: RecipeIngredient[],
) {
  const next = current.map((i) => ({ ...i }));
  for (const i of additions) {
    const old = next.find(
      (p) =>
        p.ingredientId === i.ingredientId && p.unit === i.unit && !p.checked,
    );
    if (old) old.quantity += i.quantity;
    else next.push({ ...i, checked: false });
  }
  return next;
}
const substitutions = [
  {
    from: "chickpeas",
    to: "beans",
    context: "salad",
    ratio: 1,
    note: "Use the same drained weight of cooked white beans.",
  },
  {
    from: "feta",
    to: "tofu",
    context: "topping",
    ratio: 1,
    note: "Use the same weight of crumbled firm tofu; the flavor will be milder.",
  },
];
export function substitutes(
  id: string,
  allergies: Allergen[],
  pantry: PantryItem[],
  diet: Preferences["diet"],
) {
  return substitutions
    .filter(
      (s) =>
        s.from === id &&
        safeIngredient(s.to, allergies) &&
        !(diet === "Vegan" && ingredientById[s.to].allergens.includes("Milk")),
    )
    .map((s) => ({
      ...s,
      owned: pantry.some((p) => p.ingredientId === s.to && p.quantity > 0),
    }))
    .sort((a, b) => Number(b.owned) - Number(a.owned));
}
