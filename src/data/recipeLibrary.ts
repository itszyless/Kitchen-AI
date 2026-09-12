import imported from "./importedRecipes.json";
import { Preferences } from "@/domain/types";
export const recipeLibrary = imported;
export type LibraryRecipe = (typeof imported)[number];
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
