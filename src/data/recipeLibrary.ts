import imported from "./importedRecipes.json";
import { Preferences } from "@/domain/types";
import { recipeCategories } from "@/domain/recipe-categories";
import { recipeTimes } from "./recipeTimes";
export const recipeLibrary = imported.map((recipe) => {
  const timing = recipeTimes[recipe.id];
  const minutes = timing?.minutes ?? null;
  return {
    ...recipe,
    minutes,
    timeSource: timing?.source,
    categories: recipeCategories({ ...recipe, minutes }),
  };
});
export type LibraryRecipe = (typeof recipeLibrary)[number];
export function libraryEligible(recipe: LibraryRecipe, p: Preferences) {
  // The source does not provide verified allergen or certification metadata.
  if (
    p.allergies.length ||
    p.customAllergies?.length ||
    p.foodPreferences?.length ||
    p.dislikes.length
  )
    return false;
  return (
    p.diet === "Anything" ||
    recipe.category === p.diet ||
    (p.diet === "Vegetarian" && recipe.category === "Vegan")
  );
}
export function instructionSteps(text: string) {
  return text
    .split(/\r?\n+/)
    .map((line) => line.trim())
    .filter(Boolean);
}
