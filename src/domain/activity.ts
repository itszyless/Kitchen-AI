import type { PantryItem } from "./types";
export type FoodHistory = PantryItem & { addedAt: string };
export const dayKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
export function cookingStreak(days: string[], now = new Date()) {
  const unique = new Set(days);
  const today = dayKey(now);
  const active = unique.has(today);
  const cursor = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12);
  if (!active) cursor.setDate(cursor.getDate() - 1);
  let count = 0;
  while (unique.has(dayKey(cursor))) {
    count++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return { count, active };
}
export function addHistory(
  history: FoodHistory[],
  items: PantryItem[],
  now = new Date(),
): FoodHistory[] {
  const cutoff = now.getTime() - 60 * 86400000;
  return [
    ...items.map((item) => ({ ...item, addedAt: now.toISOString() })),
    ...history,
  ]
    .filter((item) => Date.parse(item.addedAt) >= cutoff)
    .slice(0, 500);
}
