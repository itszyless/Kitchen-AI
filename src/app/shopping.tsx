import { useState } from "react";
import { ShoppingItem } from "@/domain/types";
import { ShoppingSwipe } from "@/components/ShoppingSwipe";
import { View } from "react-native";
import { Pressable } from "react-native-gesture-handler";
import { Check } from "lucide-react-native";
import { Screen, Back, T, Row, Empty, Progress, Button } from "@/components/ui";
import { useCook } from "@/state/store";
import { ingredientById } from "@/data/catalog";
import { useTheme } from "@/theme/useTheme";
export default function Shopping() {
  const [deleted, setDeleted] = useState<ShoppingItem | null>(null);
  const restoreShopping = useCook((s) => s.restoreShopping);
  const items = useCook((s) => s.shopping);
  const remove = useCook((s) => s.removeShopping);
  const toggle = useCook((s) => s.toggleShopping);
  const c = useTheme();
  return (
    <Screen>
      <Back title="Your kitchen" />
      <T bold size={34}>
        Shopping list
      </T>
      <T muted>
        {items.filter((i) => !i.checked).length}{" "}
        {items.filter((i) => !i.checked).length === 1 ? "thing" : "things"} left
        to pick up.
      </T>
      {items.length ? (
        <Row>
          <Progress
            value={(items.filter((i) => i.checked).length / items.length) * 100}
          />
          <T muted size={12}>
            {items.filter((i) => i.checked).length}/{items.length}
          </T>
        </Row>
      ) : null}
      <View>
        {items.map((i, n) => (
          <ShoppingSwipe
            key={i.ingredientId + i.unit}
            first={n === 0}
            onDelete={() => {
              setDeleted(i);
              remove(n);
            }}
          >
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: i.checked }}
              aria-checked={i.checked}
              onPress={() => toggle(n)}
              style={{
                paddingVertical: 20,
                backgroundColor: c.bg,
                borderBottomWidth: 1,
                borderColor: c.border,
              }}
            >
              <Row>
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 8,
                    borderWidth: 1.5,
                    borderColor: i.checked ? c.primary : c.border,
                    backgroundColor: i.checked ? c.primary : "transparent",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {i.checked ? <Check color={c.onPrimary} size={17} /> : null}
                </View>
                <T
                  style={{
                    flex: 1,
                    textDecorationLine: i.checked ? "line-through" : "none",
                  }}
                >
                  {ingredientById[i.ingredientId]?.name || i.ingredientId}
                </T>
                <T muted>
                  {Math.round(i.quantity * 10) / 10} {i.unit}
                </T>
              </Row>
            </Pressable>
          </ShoppingSwipe>
        ))}
      </View>
      {deleted ? (
        <Button
          secondary
          label="Undo delete"
          onPress={() => {
            restoreShopping(deleted);
            setDeleted(null);
          }}
        />
      ) : null}
      {!items.length ? (
        <Empty
          title="Nothing to pick up yet"
          body="Open a recipe and add its missing ingredients here."
        />
      ) : null}
    </Screen>
  );
}
