import { createId } from "@/domain/id";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { router } from "expo-router";
import {
  Screen,
  T,
  Field,
  SearchBar,
  Button,
  Row,
  Chip,
  Back,
} from "@/components/ui";
import { searchIngredients } from "@/domain/matching";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { Unit } from "@/domain/types";
import { quantitySchema, expirySchema } from "@/features/pantry/validation";
export default function Add() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState("");
  const [quantity, setQuantity] = useState("250");
  const [unit, setUnit] = useState<Unit>("g");
  const [expiry, setExpiry] = useState("");
  const [error, setError] = useState("");
  const add = useCook((s) => s.addPantry);
  const c = useTheme();
  const items = searchIngredients(query);
  const save = () => {
    const q = quantitySchema.safeParse(quantity);
    const date = expirySchema.safeParse(expiry);
    const ingredient = items.find((i) => i.id === selected);
    if (!q.success || !ingredient || !date.success) {
      setError(
        !date.success
          ? "Use a real date in YYYY-MM-DD format."
          : "Choose an ingredient and enter an amount greater than zero.",
      );
      return;
    }
    add([
      {
        id: createId(ingredient.id),
        ingredientId: ingredient.id,
        name: ingredient.name,
        quantity: q.data,
        unit,
        expires: expiry || undefined,
      },
    ]);
    router.replace("/pantry");
  };
  return (
    <Screen
      footer={
        <Button label="Add to pantry" disabled={!selected} onPress={save} />
      }
    >
      <Back title="Add to your pantry" />
      <T bold size={32}>
        Find an ingredient
      </T>
      <SearchBar
        accessibilityLabel="Search ingredients"
        placeholder="Tomatoes, pasta, eggs…"
        value={query}
        onChangeText={(v) => {
          setQuery(v);
          setSelected("");
        }}
      />
      <View style={{ gap: 8 }}>
        {(selected
          ? items.filter((i) => i.id === selected)
          : items.slice(0, 8)
        ).map((i) => (
          <Pressable
            key={i.id}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === i.id }}
            onPress={() => setSelected(i.id)}
            style={{
              padding: 16,
              borderRadius: selected === i.id ? 14 : 0,
              backgroundColor: selected === i.id ? c.soft : c.bg,
              borderBottomWidth: 1,
              borderColor: selected === i.id ? c.primary : c.border,
            }}
          >
            <T bold>{i.name}</T>
            <T size={12} muted>
              {i.category}
              {i.allergens.length
                ? " · Contains " + i.allergens.join(", ")
                : ""}
            </T>
          </Pressable>
        ))}
      </View>
      {!items.length ? (
        <T muted>
          No matching ingredient. Try searching food products instead.
        </T>
      ) : null}
      <Button
        secondary
        label="Search food products"
        onPress={() => router.push("/products")}
      />
      <T bold>How much?</T>
      <Field
        accessibilityLabel="Quantity"
        keyboardType="decimal-pad"
        value={quantity}
        onChangeText={setQuantity}
      />
      <Row>
        {(["g", "ml", "piece"] as const).map((u) => (
          <Chip
            key={u}
            label={u}
            selected={unit === u}
            onPress={() => setUnit(u)}
          />
        ))}
      </Row>
      <T bold>Use by · optional</T>
      <Field
        accessibilityLabel="Expiry date"
        placeholder="YYYY-MM-DD"
        value={expiry}
        onChangeText={setExpiry}
      />
      {error ? (
        <T accessibilityRole="alert" style={{ color: c.danger }}>
          {error}
        </T>
      ) : null}
    </Screen>
  );
}
