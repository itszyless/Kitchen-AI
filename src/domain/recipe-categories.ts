type CategoryInput = {
  category?: string;
  tags?: string[];
  ingredients: { name: string }[];
  title: string;
  minutes?: number | null;
};
/** Browsing labels overlap. They are not allergen certifications. */
export function recipeCategories(recipe: CategoryInput): string[] {
  const tags = new Set([
    ...(recipe.tags ?? []),
    ...(recipe.category ? [recipe.category] : []),
  ]);
  tags.delete("Under 20 min"); // Recompute time labels from known total duration.
  const mainIngredients = recipe.ingredients
    .map((i) => i.name)
    .filter((name) => !/stock|broth|seasoning|sauce|flavou?r/i.test(name))
    .join(" ");
  const content = recipe.title + " " + mainIngredients;
  if (
    /\b(pasta|spaghetti|linguine|fettucc?ine|penne|macaroni|lasagn[ae]|cannelloni|tagliatelle|ravioli|fusilli)\b/i.test(
      content,
    )
  )
    tags.add("Pasta");
  if (/\b(chicken)\b/i.test(content)) tags.add("Chicken");
  if (/\b(beef)\b/i.test(content)) tags.add("Beef");
  if (
    /\b(salmon|tuna|prawns?|shrimp|cod|haddock|mussels?|squid|sardines?|pilchards?|seafood)\b/i.test(
      content,
    )
  )
    tags.add("Seafood");
  if (/\b(salad|slaw)\b/i.test(recipe.title)) tags.add("Salad");
  if (/\b(soup|broth)\b/i.test(recipe.title)) tags.add("Soup");
  if (tags.has("Vegan")) tags.add("Vegetarian");
  if (recipe.minutes != null && recipe.minutes > 0 && recipe.minutes < 20)
    tags.add("Under 20 min");
  return [...tags];
}
export function matchesCategories(
  categories: string[],
  selected: string[],
  saved: boolean,
) {
  return selected.every((filter) =>
    filter === "Saved" ? saved : categories.includes(filter),
  );
}
