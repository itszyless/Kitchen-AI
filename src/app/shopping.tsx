import { Pressable, View } from "react-native";
import { Check } from "lucide-react-native";
import { Screen, Back, T, Row, Empty, Progress } from "@/components/ui";
import { useCook } from "@/state/store";
import { ingredientById } from "@/data/catalog";
import { useTheme } from "@/theme/useTheme";
export default function Shopping() {
  const items = useCook((s) => s.shopping);
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
          <Pressable
            key={i.ingredientId + "-" + n}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: i.checked }}
            aria-checked={i.checked}
            onPress={() => toggle(n)}
            style={{
              paddingVertical: 20,
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
        ))}
      </View>
      {!items.length ? (
        <Empty
          title="Nothing to pick up yet"
          body="Open a recipe and add its missing ingredients here."
        />
      ) : null}
    </Screen>
  );
}
