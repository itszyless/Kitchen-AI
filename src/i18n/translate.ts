import german from "./de.json";
export type Language = "en" | "de";
const de: Record<string, string> = german;
export function translate(text: string, language: Language): string {
  if (language === "en") return text;
  const key = text.replace(/\s+/g, " ").trim();
  if (!key) return text;
  const value = de[key];
  if (value)
    return text.startsWith(" ") || text.endsWith(" ")
      ? `${text.startsWith(" ") ? " " : ""}${value}${text.endsWith(" ") ? " " : ""}`
      : value;
  if (key.includes(" · ")) return key.split(" · ").map(part => translate(part, language)).join(" · ");
  const transformed = key
    .replace(/^(\d+) of (\d+)$/, "$1 von $2")
    .replace(/^([0-9.,]+) piece$/, "$1 Stück")
    .replace(/^STEP (\d+) OF (\d+)$/, "SCHRITT $1 VON $2")
    .replace(/^Start (\d+):00 timer$/, "$1-Minuten-Timer starten")
    .replace(/^(\d+) meals made$/, "$1 Gerichte gekocht")
    .replace(/^(\d+) recipes$/, "$1 Rezepte")
    .replace(/^1 ingredient$/, "1 Zutat")
    .replace(/^(\d+) ingredients$/, "$1 Zutaten")
    .replace(/^(\d+) servings$/, "$1 Portionen")
    .replace(/^(\d+) missing$/, "$1 fehlen")
    .replace(/^(\d+)% in your pantry$/, "$1 % in deinem Vorrat")
    .replace(/^Add (\d+) items to pantry$/, "$1 Lebensmittel hinzufügen")
    .replace(/^Step (\d+)$/, "Schritt $1")
    .replace(/^Product region · /, "Produktregion · ")
    .replace(/^(\d+)% pantry match$/, "$1 % aus deinem Vorrat");
  return transformed === key ? text : transformed;
}
