import { describe, it, expect } from "vitest";
import { cookingStreak, cookingWeek, addHistory } from "../src/domain/activity";
import { substitutionLimit } from "../src/services/entitlements";
describe("daily cooking streak", () => {
  it("starts the week on Monday across a year boundary", () => {
    const week = cookingWeek(
      ["2025-12-29", "2026-01-01"],
      new Date(2026, 0, 1),
    );
    expect(week.map((day) => day.key)).toEqual([
      "2025-12-29",
      "2025-12-30",
      "2025-12-31",
      "2026-01-01",
      "2026-01-02",
      "2026-01-03",
      "2026-01-04",
    ]);
    expect(week.filter((day) => day.done).map((day) => day.label)).toEqual([
      "Mon",
      "Thu",
    ]);
  });
  it("keeps Sunday in the same week and does not mark future dates", () => {
    expect(cookingWeek([], new Date(2026, 8, 20))[0].key).toBe("2026-09-14");
    expect(cookingWeek(["2026-09-20"], new Date(2026, 8, 18))[6].done).toBe(
      false,
    );
  });
  it("counts a date only once", () =>
    expect(
      cookingStreak(
        ["2026-09-12", "2026-09-12", "2026-09-11"],
        new Date(2026, 8, 12),
      ),
    ).toEqual({ count: 2, active: true }));
  it("keeps yesterday's streak grey until cooking today", () =>
    expect(cookingStreak(["2026-09-11"], new Date(2026, 8, 12))).toEqual({
      count: 1,
      active: false,
    }));
  it("resets after a missed day", () =>
    expect(cookingStreak(["2026-09-10"], new Date(2026, 8, 12)).count).toBe(0));
  it("crosses year boundaries", () =>
    expect(
      cookingStreak(["2025-12-31", "2026-01-01"], new Date(2026, 0, 1)).count,
    ).toBe(2));
});
it("retains recent amounts and prunes old food history", () => {
  const item = {
    id: "a",
    ingredientId: "a",
    name: "Apple",
    quantity: 120,
    unit: "g" as const,
  };
  const result = addHistory(
    [{ ...item, addedAt: "2026-01-01T12:00:00Z" }],
    [item],
    new Date("2026-09-12T12:00:00Z"),
  );
  expect(result).toHaveLength(1);
  expect(result[0].quantity).toBe(120);
});
it("offers two free alternatives and five Plus alternatives", () => {
  expect(substitutionLimit(false)).toBe(2);
  expect(substitutionLimit(true)).toBe(5);
});
