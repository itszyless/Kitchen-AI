import { expect, it } from "vitest";
import { translate } from "../src/i18n/translate";
it("preserves the brand and untranslated source text including line breaks", () => {
  expect(translate("COOK", "de")).toBe("COOK");
  expect(translate("\n", "de")).toBe("\n");
  expect(translate("An original recipe\nwith two lines.", "de")).toBe("An original recipe\nwith two lines.");
});
it("translates amounts and combined metadata without changing quantities", () => {
  expect(translate("750 g", "de")).toBe("750 g");
  expect(translate("2 piece", "de")).toBe("2 Stück");
  expect(translate("20 min · Vegetarian", "de")).toBe("20 min · Vegetarisch");
  expect(translate("STEP 2 OF 4", "de")).toBe("SCHRITT 2 VON 4");
});
it("covers core controls and allergy categories in German", () => {
  for (const label of ["Continue", "Show original", "Show translation", "Light", "Dark", "Milk", "Eggs", "Tree nuts", "Peanuts", "Shellfish", "Molluscs", "Mustard", "Celery", "Sulphites"]) {
    expect(translate(label, "de"), label).not.toBe(label);
    expect(translate(label, "en")).toBe(label);
  }
});
