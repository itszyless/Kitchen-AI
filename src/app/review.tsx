import { useState } from "react";
import { View } from "react-native";
import { Image } from "expo-image";
import { useScan } from "@/state/scan";
import { router } from "expo-router";
import { Trash2, CheckCircle2 } from "lucide-react-native";
import {
  Screen,
  T,
  Back,
  Row,
  Field,
  Button,
  Chip,
  IconButton,
} from "@/components/ui";
import { ingredients, ingredientById } from "@/data/catalog";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { quantitySchema } from "@/features/pantry/validation";
export default function Review() {
  const candidates = useScan((s) => s.candidates);
  const photo = useScan((s) => s.photo);
  const clearScan = useScan((s) => s.clear);
  const [items, setItems] = useState(
    candidates.map((c) => ({
      ...c,
      item: { ...c.item },
      amount: String(c.item.quantity),
    })),
  );
  const [editing, setEditing] = useState<string | null>(null);
  const [error, setError] = useState("");
  const add = useCook((s) => s.addPantry);
  const c = useTheme();
  const save = () => {
    if (items.some((i) => !quantitySchema.safeParse(i.amount).success)) {
      setError("Enter a positive amount for every item.");
      return;
    }
    add(
      items.map((i) => ({
        ...i.item,
        id: Date.now() + "-" + i.item.ingredientId,
        quantity: Number(i.amount),
      })),
    );
    clearScan();
    router.replace("/pantry");
  };
  return (
    <Screen
      footer={
        <Button
          label={"Add " + items.length + " items to pantry"}
          disabled={!items.length}
          onPress={save}
        />
      }
    >
      <Back title="Review ingredients" />
      <T size={34} bold>
        Check your ingredients
      </T>
      <Row>
        <CheckCircle2 color={c.text} size={24} />
        <T muted size={13} style={{ flex: 1 }}>
          Recognition suggestions · Check every name and amount.
        </T>
      </Row>
      {photo ? (
        <Image
          source={photo}
          contentFit="cover"
          style={{ height: 180, borderRadius: 20 }}
        />
      ) : null}
      {!items.length ? (
        <Button
          label="Scan a photo"
          onPress={() => router.replace("/capture")}
        />
      ) : null}
      {items.map((entry) => (
        <View
          key={entry.item.id}
          style={{
            gap: 12,
            borderBottomWidth: 1,
            borderColor: c.border,
            paddingBottom: 22,
          }}
        >
          <Row>
            <View style={{ flex: 1 }}>
              <T size={17} bold>
                {entry.item.name}
              </T>
              <T size={13} muted>
                {entry.confidence < 0.8
                  ? "Please check this match"
                  : "Suggested match"}{" "}
                · check amount
              </T>
            </View>
            <IconButton
              icon={Trash2}
              label={"Remove " + entry.item.name}
              onPress={() =>
                setItems(items.filter((i) => i.item.id !== entry.item.id))
              }
            />
          </Row>
          <Row>
            <Field
              accessibilityLabel={"Amount for " + entry.item.name}
              keyboardType="decimal-pad"
              value={entry.amount}
              onChangeText={(amount) =>
                setItems(
                  items.map((i) =>
                    i.item.id === entry.item.id ? { ...i, amount } : i,
                  ),
                )
              }
              style={{ flex: 1 }}
            />
            <Row>
              {(["g", "ml", "piece"] as const).map((unit) => (
                <Chip
                  key={unit}
                  label={unit}
                  selected={entry.item.unit === unit}
                  onPress={() =>
                    setItems(
                      items.map((i) =>
                        i.item.id === entry.item.id
                          ? { ...i, item: { ...i.item, unit } }
                          : i,
                      ),
                    )
                  }
                />
              ))}
            </Row>
            <Chip
              label="Correct"
              onPress={() =>
                setEditing(editing === entry.item.id ? null : entry.item.id)
              }
            />
          </Row>
          {editing === entry.item.id ? (
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {ingredients.map((i) => (
                <Chip
                  key={i.id}
                  label={i.name}
                  selected={entry.item.ingredientId === i.id}
                  onPress={() => {
                    setItems(
                      items.map((e) =>
                        e.item.id === entry.item.id
                          ? {
                              ...e,
                              item: {
                                ...e.item,
                                ingredientId: i.id,
                                name: ingredientById[i.id].name,
                              },
                              confidence: 1,
                            }
                          : e,
                      ),
                    );
                    setEditing(null);
                  }}
                />
              ))}
            </View>
          ) : null}
        </View>
      ))}
      {error ? <T style={{ color: c.danger }}>{error}</T> : null}
    </Screen>
  );
}
