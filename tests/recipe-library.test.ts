import { expect, it } from "vitest";
import {
  recipeLibrary,
  instructionSteps,
  libraryEligible,
} from "@/data/recipeLibrary";
it("contains 500–2000 distinct, complete source recipes", () => {
  expect(recipeLibrary.length).toBeGreaterThanOrEqual(500);
  expect(recipeLibrary.length).toBeLessThanOrEqual(2000);
  expect(new Set(recipeLibrary.map((r) => r.id)).size).toBe(
    recipeLibrary.length,
  );
  for (const r of recipeLibrary) {
    expect(r.image).toMatch(/^https:\/\//);
    expect(r.ingredients.length).toBeGreaterThan(0);
    expect(instructionSteps(r.instructions).length).toBeGreaterThan(0);
  }
});
it("does not claim source recipes are allergy verified", () => {
  expect(
    libraryEligible(recipeLibrary[0], {
      country: "AT",
      allergies: ["Milk"],
      diet: "Anything",
      skill: "Confident",
      minutes: 30,
      household: 2,
      dislikes: [],
    }),
  ).toBe(false);
});
