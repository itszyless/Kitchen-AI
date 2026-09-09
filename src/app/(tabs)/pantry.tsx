import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import { router } from "expo-router";
import {
  Plus,
  Minus,
  Trash2,
  Carrot,
  Milk,
  Package,
  ChevronDown,
} from "lucide-react-native";
import {
  Screen,
  T,
  SearchBar,
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
  const [expanded, setExpanded] = useState<string | null>(null);
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
    <Screen style={{ gap: 18 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <T bold size={32}>
          Pantry
        </T>
        <IconButton
          icon={Plus}
          label="Add ingredients"
          onPress={() => router.push("/add")}
        />
      </Row>
      <SearchBar
        accessibilityLabel="Search pantry"
        placeholder="Search your kitchen"
        value={query}
        onChangeText={setQuery}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {["All", "Produce", "Fridge", "Cupboard"].map((x) => (
          <Chip
            key={x}
            label={x}
            selected={x === category}
            onPress={() => setCategory(x)}
          />
        ))}
      </ScrollView>
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
      <T muted size={12}>
        {result.length} ingredients · Soonest expiry first
      </T>
      <View>
        {result.map((item) => {
          const cat = ingredientById[item.ingredientId]?.category;
          const Icon =
            cat === "Produce" ? Carrot : cat === "Fridge" ? Milk : Package;
          return (
            <View
              key={item.id}
              style={{ borderBottomWidth: 1, borderColor: c.border }}
            >
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={"Edit " + item.name}
                accessibilityState={{ expanded: expanded === item.id }}
                onPress={() =>
                  setExpanded(expanded === item.id ? null : item.id)
                }
                style={{ paddingVertical: 16 }}
              >
                <Row>
                  <View
                    style={{
                      width: 44,
                      height: 48,
                      borderRadius: 13,
                      backgroundColor: c.surface,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Icon color={c.muted} size={24} />
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <T bold size={15}>
                      {item.name}
                    </T>
                    <T muted size={12}>
                      {item.expires
                        ? "Use by " + item.expires
                        : cat || "Private product"}
                    </T>
                  </View>
                  <T size={13}>
                    {item.quantity} {item.unit}
                  </T>
                  <ChevronDown size={16} color={c.muted} />
                </Row>
              </Pressable>
              {expanded === item.id ? (
                <Row
                  style={{ paddingBottom: 14, justifyContent: "space-between" }}
                >
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
                    <T size={13}>Adjust amount</T>
                    <IconButton
                      icon={Plus}
                      label={"Increase " + item.name}
                      onPress={() =>
                        update(item.id, {
                          quantity:
                            item.quantity + (item.unit === "piece" ? 1 : 25),
                        })
                      }
                    />
                  </Row>
                  <IconButton
                    icon={Trash2}
                    label={"Remove " + item.name}
                    onPress={() => {
                      remove(item.id);
                      setRemoved(item);
                    }}
                  />
                </Row>
              ) : null}
            </View>
          );
        })}
      </View>
      {!result.length ? (
        <>
          <Empty
            title={
              pantry.length
                ? "No matching ingredients"
                : "What’s in your kitchen?"
            }
            body="Add a few ingredients to find out what you can make."
          />
          <Button label="Add ingredients" onPress={() => router.push("/add")} />
        </>
      ) : null}
    </Screen>
  );
}
