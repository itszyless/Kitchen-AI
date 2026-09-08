import { describe, it, expect } from "vitest";
import {
  eligible,
  match,
  mergeShopping,
  searchIngredients,
  substitutes,
} from "@/domain/matching";
import { recipes } from "@/data/catalog";
import { Preferences, PantryItem } from "@/domain/types";
const preferences: Preferences = {
  country: "AT",
  allergies: [],
  diet: "Anything",
  skill: "Getting started",
  minutes: 30,
  household: 2,
  dislikes: [],
};
const pasta = recipes[0];
describe("Food exclusions", () => {
  it("blocks even an optional excluded allergen", () => {
    expect(eligible(pasta, { ...preferences, allergies: ["Gluten"] })).toBe(
      false,
    );
  });
  it("does not offer a soy substitute to a soy-allergic user", () => {
    expect(substitutes("feta", ["Soy"], [], "Vegan")).toEqual([]);
  });
  it("keeps vegan results vegan", () => {
    expect(
      recipes
        .filter((r) => eligible(r, { ...preferences, diet: "Vegan" }))
        .map((r) => r.id),
    ).toEqual(["chickpea-bowl"]);
  });
  it("excludes disliked canonical ingredients", () => {
    expect(eligible(pasta, { ...preferences, dislikes: ["tomato"] })).toBe(
      false,
    );
  });
});
describe("Quantity matching", () => {
  const pantry: PantryItem[] = pasta.ingredients
    .filter((i) => !i.optional)
    .map((i) => ({ ...i, id: i.ingredientId, name: i.ingredientId }));
  it("does not penalize optional ingredients", () =>
    expect(match(pasta, pantry).score).toBe(100));
  it("scales quantities with servings", () => {
    expect(match(pasta, pantry, 4).score).toBe(50);
    expect(match(pasta, pantry, 4).missing).toHaveLength(5);
  });
  it("does not confuse grams and milliliters", () => {
    expect(
      match(
        pasta,
        pantry.map((i) => ({ ...i, unit: "ml" })),
      ).score,
    ).toBe(20);
  });
  it("merges multiple pantry entries", () => {
    const first = pantry[0];
    expect(
      match(pasta, [
        ...pantry.slice(1),
        { ...first, quantity: 90 },
        { ...first, id: "other", quantity: 90 },
      ]).score,
    ).toBe(100);
  });
});
it("merges shopping quantities only when units match", () => {
  expect(
    mergeShopping(
      [{ ingredientId: "rice", quantity: 50, unit: "g", checked: false }],
      [
        { ingredientId: "rice", quantity: 80, unit: "g" },
        { ingredientId: "rice", quantity: 1, unit: "piece" },
      ],
    ),
  ).toEqual([
    { ingredientId: "rice", quantity: 130, unit: "g", checked: false },
    { ingredientId: "rice", quantity: 1, unit: "piece", checked: false },
  ]);
});
it("search is token-order independent and recognizes aliases", () => {
  expect(searchIngredients("tomatoes cherry")).toEqual(
    searchIngredients("cherry tomatoes"),
  );
  expect(searchIngredients("garbanzo")[0].id).toBe("chickpeas");
});
