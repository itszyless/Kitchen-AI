import { useState } from "react";
import { Pressable } from "react-native";
import { Plus } from "lucide-react-native";
import {
  Screen,
  Back,
  T,
  SearchBar,
  Row,
  Chip,
  IconButton,
  Button,
} from "@/components/ui";
import { CookSheet } from "@/components/CookSheet";
import { FoodAmount } from "@/components/FoodAmount";
import { useCook } from "@/state/store";
import { searchIngredients, normalize } from "@/domain/matching";
import { PantryItem } from "@/domain/types";
import { createId } from "@/domain/id";
import { useTheme } from "@/theme/useTheme";
import { useLanguage, useTranslate } from "@/i18n";
import { searchProducts } from "@/services/products/search";
import { router } from "expo-router";
export default function Add() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<PantryItem | null>(null);
  const [mode, setMode] = useState("Ingredients");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [results, setResults] = useState<
    Awaited<ReturnType<typeof searchProducts>>
  >([]);
  const history = useCook((s) => s.foodHistory);
  const add = useCook((s) => s.addPantry);
  const country = useCook((s) => s.preferences.country);
  const c = useTheme();
  const t = useTranslate();
  const language = useLanguage((s) => s.language);
  const items = query.trim()
    ? searchIngredients("").filter((i) =>
        normalize([i.name, ...i.aliases, t(i.name)].join(" ")).includes(
          normalize(query),
        ),
      )
    : [];
  const [cutoff] = useState(() => Date.now() - 60 * 86400000);
  const recent = history.filter((i) => Date.parse(i.addedAt) > cutoff);
  const save = (item: PantryItem) => {
    add([{ ...item, id: createId(item.ingredientId), expires: undefined }]);
    setSelected(null);
  };
  return (
    <Screen>
      <Back title="Add to your pantry" />
      <T size={32} bold>
        Find food
      </T>
      <SearchBar
        accessibilityLabel="Search ingredients"
        placeholder="Food, brand or product…"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
        onSubmitEditing={() => {
          if (mode === "Products") void search();
        }}
      />
      <Row>
        {["Ingredients", "Products"].map((m) => (
          <Chip
            key={m}
            label={m}
            selected={mode === m}
            onPress={() => setMode(m)}
          />
        ))}
      </Row>
      {!query.trim() ? (
        <>
          <T bold size={22}>
            Recently added
          </T>
          {!recent.length ? (
            <T muted>Your recently added food will appear here.</T>
          ) : null}
          {recent.map((item, n) => (
            <Row
              key={item.addedAt + item.id + n}
              style={{
                borderBottomWidth: 1,
                borderColor: c.border,
                paddingVertical: 12,
              }}
            >
              <Pressable
                accessibilityRole="button"
                onPress={() => setSelected(item)}
                style={{ flex: 1, minHeight: 44, gap: 4 }}
              >
                <T bold>{item.name}</T>
                <T muted size={13}>
                  {item.quantity} {item.unit}
                </T>
                <T muted size={12}>
                  {new Date(item.addedAt).toLocaleDateString(
                    language === "de" ? "de-DE" : "en-GB",
                  )}
                </T>
              </Pressable>
              <IconButton
                icon={Plus}
                label="Add to pantry"
                onPress={() => save(item)}
              />
            </Row>
          ))}
        </>
      ) : mode === "Ingredients" ? (
        <>
          {items.map((i) => (
            <Pressable
              key={i.id}
              accessibilityRole="button"
              onPress={() =>
                setSelected({
                  id: i.id,
                  ingredientId: i.id,
                  name: i.name,
                  quantity: 100,
                  unit: "g",
                })
              }
              style={{
                paddingVertical: 18,
                borderBottomWidth: 1,
                borderColor: c.border,
              }}
            >
              <T bold>{i.name}</T>
              <T muted size={12}>
                {i.category}
              </T>
            </Pressable>
          ))}
          {!items.length ? (
            <T muted>
              No matching ingredient. Choose Products to search packaged food.
            </T>
          ) : null}
        </>
      ) : (
        <>
          <Button
            label={busy ? "Searching…" : "Search"}
            disabled={busy || query.trim().length < 2}
            onPress={() => void search()}
          />
          {results.map((p) => (
            <Pressable
              accessibilityRole="button"
              key={p.code}
              onPress={() =>
                router.push({ pathname: "/barcode", params: { code: p.code } })
              }
              style={{
                paddingVertical: 16,
                borderBottomWidth: 1,
                borderColor: c.border,
              }}
            >
              <T bold>{p.product_name}</T>
              <T muted>{p.brands}</T>
            </Pressable>
          ))}
          {error ? <T accessibilityRole="alert">{error}</T> : null}
        </>
      )}
      <CookSheet
        title="Add to pantry"
        visible={Boolean(selected)}
        onClose={() => setSelected(null)}
      >
        {selected ? (
          <FoodAmount key={selected.id} item={selected} onAdd={save} />
        ) : null}
      </CookSheet>
    </Screen>
  );
  async function search() {
    setBusy(true);
    setError("");
    try {
      setResults(await searchProducts(query, country));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Please try again.");
    } finally {
      setBusy(false);
    }
  }
}
