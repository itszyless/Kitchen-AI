import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { Plus, Minus, Trash2 } from "lucide-react-native";
import {
  Screen,
  T,
  Field,
  Row,
  Button,
  Chip,
  IconButton,
  Empty,
} from "@/components/ui";
import { useCook } from "@/state/store";
import { ingredientById } from "@/data/catalog";
import { useTheme } from "@/theme/useTheme";
export default function Pantry() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [removed, setRemoved] = useState<
    ReturnType<typeof useCook.getState>["pantry"][number] | null
  >(null);
  const pantry = useCook((s) => s.pantry);
  const update = useCook((s) => s.updatePantry);
  const remove = useCook((s) => s.removePantry);
  const add = useCook((s) => s.addPantry);
  const c = useTheme();
  const result = pantry
    .filter(
      (i) =>
        i.name.toLowerCase().includes(query.toLowerCase()) &&
        (category === "All" ||
          ingredientById[i.ingredientId]?.category === category),
    )
    .sort((a, b) => (a.expires || "9999").localeCompare(b.expires || "9999"));
  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <T size={36} bold>
          Your pantry.
        </T>
        <IconButton
          icon={Plus}
          label="Add ingredients"
          onPress={() => router.push("/add")}
        />
      </Row>
      <T muted>A little less waste. A lot more possibility.</T>
      <Field
        accessibilityLabel="Search pantry"
        placeholder="Find an ingredient…"
        value={query}
        onChangeText={setQuery}
      />
      <Row style={{ flexWrap: "wrap" }}>
        {["All", "Produce", "Fridge", "Cupboard"].map((x) => (
          <Chip
            key={x}
            label={x}
            selected={x === category}
            onPress={() => setCategory(x)}
          />
        ))}
      </Row>
      {removed ? (
        <Button
          secondary
          label={"Undo removing " + removed.name}
          onPress={() => {
            add([removed]);
            setRemoved(null);
          }}
        />
      ) : null}
      <T size={13} muted>
        {result.length} ingredients · soonest expiry first
      </T>
      {result.map((item) => (
        <View
          key={item.id}
          style={{
            paddingVertical: 16,
            gap: 12,
            borderBottomWidth: 1,
            borderColor: c.border,
          }}
        >
          <Row style={{ justifyContent: "space-between" }}>
            <View style={{ flex: 1, gap: 4 }}>
              <T bold size={19}>
                {item.name}
              </T>
              <T muted size={13}>
                {ingredientById[item.ingredientId]?.category || "Your products"}
                {item.expires ? " · Use by " + item.expires : ""}
              </T>
            </View>
            <IconButton
              icon={Trash2}
              label={"Remove " + item.name}
              onPress={() => {
                remove(item.id);
                setRemoved(item);
              }}
            />
          </Row>
          <Row>
            <IconButton
              icon={Minus}
              label={"Decrease " + item.name}
              onPress={() =>
                update(item.id, {
                  quantity: Math.max(
                    0,
                    item.quantity - (item.unit === "piece" ? 1 : 25),
                  ),
                })
              }
            />
            <T bold style={{ minWidth: 70, textAlign: "center" }}>
              {item.quantity} {item.unit}
            </T>
            <IconButton
              icon={Plus}
              label={"Increase " + item.name}
              onPress={() =>
                update(item.id, {
                  quantity: item.quantity + (item.unit === "piece" ? 1 : 25),
                })
              }
            />
          </Row>
        </View>
      ))}
      {!result.length ? (
        <>
          <Empty
            title={
              pantry.length
                ? "Nothing in this corner"
                : "Let’s stock your kitchen"
            }
            body="Start with a few things you already have. Rough amounts are completely fine."
          />
          <Button label="Add ingredients" onPress={() => router.push("/add")} />
        </>
      ) : null}
    </Screen>
  );
}
