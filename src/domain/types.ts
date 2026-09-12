export const allergens = [
  "Milk",
  "Eggs",
  "Gluten",
  "Peanuts",
  "Tree nuts",
  "Soy",
  "Fish",
  "Shellfish",
  "Sesame",
  "Celery",
  "Mustard",
  "Lupin",
  "Molluscs",
  "Sulphites",
] as const;
export type Allergen = (typeof allergens)[number];
export type Unit = "g" | "ml" | "piece";
export type Ingredient = {
  id: string;
  name: string;
  category: string;
  allergens: Allergen[];
  aliases: string[];
};
export type PantryItem = {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: Unit;
  expires?: string;
};
export type RecipeIngredient = {
  ingredientId: string;
  quantity: number;
  unit: Unit;
  optional?: boolean;
};
export type Recipe = {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  minutes: number;
  servings: number;
  protein: number;
  calories: number;
  cuisine: string;
  tags: string[];
  author: string;
  source: "Cook" | "Community";
  ingredients: RecipeIngredient[];
  steps: { title: string; body: string; tip: string; seconds?: number }[];
};
export type Preferences = {
  age?: number;
  customAllergies?: string[];
  foodPreferences?: string[];
  country: string;
  allergies: Allergen[];
  diet: "Anything" | "Vegetarian" | "Vegan";
  skill: "Getting started" | "Comfortable" | "Confident";
  minutes: number;
  household: number;
  dislikes: string[];
};
export type ShoppingItem = RecipeIngredient & { checked: boolean };
