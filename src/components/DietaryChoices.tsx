import { useState } from "react";
import { Pressable, View } from "react-native";
import { Check, Leaf, ShieldCheck, Fish, Egg, Milk, Wheat, Nut, Sprout, Utensils } from "lucide-react-native";
import { T, SearchBar, Button } from "./ui";
import { useTheme } from "@/theme/useTheme";
import { useTranslate } from "@/i18n";
import { useCook } from "@/state/store";
import { allergens, Allergen } from "@/domain/types";
import { otherAllergies, allergySearchTerms, foodPreferences } from "@/data/foodPreferences";
import { normalize } from "@/domain/matching";
const icons = { Milk, Eggs: Egg, Gluten: Wheat, Peanuts: Nut, "Tree nuts": Nut, Fish, Shellfish: Fish, Soy: Sprout, Vegetarian: Leaf, Vegan: Sprout, Pescatarian: Fish };
export function DietaryChoices({ allergy = false, confirmed = false, onConfirm }: { allergy?: boolean; confirmed?: boolean; onConfirm?: () => void }) {
  const [query, setQuery] = useState("");
  const p = useCook(s => s.preferences);
  const update = useCook(s => s.updatePreferences);
  const c = useTheme(); const t = useTranslate();
  const all = [...new Set(allergy ? [...allergens, ...otherAllergies, ...(p.customAllergies ?? [])] : ["Anything", "Vegetarian", "Vegan", ...foodPreferences, ...(p.foodPreferences ?? [])])];
  const selected = (name: string) => allergy ? p.allergies.includes(name as Allergen) || (p.customAllergies ?? []).includes(name) : p.diet === name || (p.foodPreferences ?? []).includes(name);
  const toggle = (name: string) => {
    onConfirm?.();
    if (!allergy && ["Anything", "Vegetarian", "Vegan"].includes(name)) { update({ diet: name as typeof p.diet }); return; }
    if (allergy && allergens.includes(name as Allergen)) { update({ allergies: selected(name) ? p.allergies.filter(a => a !== name) : [...p.allergies, name as Allergen] }); return; }
    const key = allergy ? "customAllergies" : "foodPreferences";
    update({ [key]: selected(name) ? (p[key] ?? []).filter(a => a !== name) : [...(p[key] ?? []), name] });
  };
  const found = all.filter(name => normalize(name + " " + t(name) + " " + (allergySearchTerms[name] ?? "") + " " + t(allergySearchTerms[name] ?? "")).includes(normalize(query)));
  return <View style={{ gap: 10, paddingTop: 8 }}>
    <SearchBar accessibilityLabel={allergy ? "Search allergies" : "Search food preferences"} placeholder={allergy ? "Search allergies or foods…" : "Search eating styles…"} value={query} onChangeText={setQuery} />
    {allergy ? <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: confirmed && !p.allergies.length && !(p.customAllergies ?? []).length }} onPress={() => { onConfirm?.(); update({ allergies: [], customAllergies: [] }); }} style={{ minHeight: 60, flexDirection: "row", alignItems: "center", gap: 14 }}><ShieldCheck color={c.text} size={22} /><T style={{ flex: 1 }}>No food allergies</T>{confirmed && !p.allergies.length && !(p.customAllergies ?? []).length ? <Check size={20} color={c.text} /> : null}</Pressable> : null}
    {found.map(name => { const Icon = icons[name as keyof typeof icons] ?? (allergy ? ShieldCheck : Utensils); const active = selected(name); return <Pressable key={name} accessibilityRole={!allergy && ["Anything", "Vegetarian", "Vegan"].includes(name) ? "radio" : "checkbox"} aria-checked={active} accessibilityState={{ checked: active }} onPress={() => toggle(name)} style={({ pressed }) => ({ minHeight: 64, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 16, backgroundColor: active ? c.primary : c.surface, opacity: pressed ? 0.75 : 1 })}><Icon size={22} color={active ? c.onPrimary : c.text} /><T style={{ flex: 1, color: active ? c.onPrimary : c.text }}>{name}</T>{active ? <Check size={20} color={c.onPrimary} /> : null}</Pressable>; })}
    {query.trim().length >= 2 && !all.some(name => normalize(name) === normalize(query) || normalize(t(name)) === normalize(query)) ? <Button secondary label="Add custom preference" onPress={() => { toggle(query.trim().slice(0, 80)); setQuery(""); }} /> : null}
    {allergy ? <T muted size={12}>Always check labels and cross-contact risks. Kitchen AI cannot guarantee an allergen-free meal.</T> : null}
  </View>;
}
