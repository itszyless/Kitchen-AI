import { expect, it } from "vitest";
import {
  recipeCategories,
  matchesCategories,
} from "@/domain/recipe-categories";
import { recipes, ingredientById } from "@/data/catalog";
import { recipeLibrary } from "@/data/recipeLibrary";
it("allows overlapping ingredient, source and time categories", () => {
  const tags = recipeCategories({
    title: "Chicken spaghetti",
    category: "Chicken",
    minutes: 15,
    ingredients: [{ name: "Spaghetti" }, { name: "Chicken" }],
  });
  expect(tags).toEqual(
    expect.arrayContaining(["Chicken", "Pasta", "Under 20 min"]),
  );
  expect(matchesCategories(tags, ["Chicken", "Pasta"], false)).toBe(true);
  expect(matchesCategories(tags, ["Pasta", "Saved"], false)).toBe(false);
  expect(matchesCategories(tags, ["Pasta", "Saved"], true)).toBe(true);
});
it("does not invent timings or infer chicken from stock", () => {
  expect(
    recipeCategories({
      title: "Soup",
      category: "Side",
      ingredients: [{ name: "Chicken stock" }],
    }),
  ).not.toContain("Chicken");
  expect(
    recipeCategories({ title: "Pasta", ingredients: [], minutes: null }),
  ).not.toContain("Under 20 min");
  expect(
    recipeCategories({ title: "Pasta", ingredients: [], minutes: 20 }),
  ).not.toContain("Under 20 min");
});
it("adds reviewed imported quick recipes without duplicating rows", () => {
  expect(
    recipeLibrary.filter((r) => r.categories.includes("Under 20 min")).length,
  ).toBe(8);
  expect(recipeLibrary.find((r) => r.id === "52982")?.categories).not.toContain(
    "Under 20 min",
  );
  expect(recipeLibrary.find((r) => r.id === "52839")?.categories).toEqual(
    expect.arrayContaining(["Pasta", "Seafood"]),
  );
  expect(new Set(recipeLibrary.map((r) => r.id)).size).toBe(
    recipeLibrary.length,
  );
});

it("uses the same quick filter for original and imported recipes", () => {
  const local = recipes.map((r) =>
    recipeCategories({
      ...r,
      ingredients: r.ingredients.map((i) => ({
        name: ingredientById[i.ingredientId].name,
      })),
    }),
  );
  const all = [...local, ...recipeLibrary.map((r) => r.categories)];
  expect(
    all.filter((tags) => matchesCategories(tags, ["Under 20 min"], false)),
  ).toHaveLength(9);
  expect(
    recipeCategories({
      title: "Unknown",
      ingredients: [],
      tags: ["Under 20 min"],
    }),
  ).not.toContain("Under 20 min");
});
