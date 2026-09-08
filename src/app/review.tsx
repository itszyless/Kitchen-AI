import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Trash2 } from "lucide-react-native";
import {
  Screen,
  T,
  Back,
  Panel,
  Row,
  Field,
  Button,
  Chip,
  IconButton,
} from "@/components/ui";
import { sampleCandidates } from "@/services/ai/provider";
import { ingredients, ingredientById } from "@/data/catalog";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { quantitySchema } from "@/features/pantry/validation";
export default function Review() {
  const [items, setItems] = useState(
    sampleCandidates.map((c) => ({
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
    router.replace("/pantry");
  };
  return (
    <Screen>
      <Back title="Review ingredients" />
      <T size={34} bold>
        A second look, then you’re set.
      </T>
      <Panel>
        <T bold>Sample scan · no photo analyzed</T>
        <T size={14}>
          These are demonstration results. Correct names and amounts just as you
          would after a real scan.
        </T>
      </Panel>
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
              <T size={20} bold>
                {entry.item.name}
              </T>
              <T size={13} muted>
                {entry.confidence < 0.8
                  ? "Please check this match"
                  : "Suggested match"}{" "}
                · sample
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
            <T>{entry.item.unit}</T>
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
      <Button
        label={"Add " + items.length + " items to pantry"}
        disabled={!items.length}
        onPress={save}
      />
    </Screen>
  );
}
