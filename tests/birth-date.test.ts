import { it, expect } from "vitest";
import { ageFromBirthDate } from "../src/domain/birth-date";
it("requires the thirteenth birthday, not only birth year", () => {
 const today = new Date(2026, 8, 14);
 expect(ageFromBirthDate("2013-09-14", today)).toBe(13);
 expect(ageFromBirthDate("2013-09-15", today)).toBe(12);
});
it("rejects invalid dates and handles leap years", () => {
 expect(ageFromBirthDate("2023-02-29")).toBeNull();
 expect(ageFromBirthDate("2000-02-29", new Date(2026, 8, 14))).toBe(26);
 expect(ageFromBirthDate("2099-01-01")).toBeNull();
 expect(ageFromBirthDate("2000-13-01")).toBeNull();
});
