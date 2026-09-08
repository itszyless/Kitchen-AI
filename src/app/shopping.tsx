import { Pressable } from "react-native";
import { Check, Plus } from "lucide-react-native";
import { Screen, Back, T, Row, Empty } from "@/components/ui";
import { useCook } from "@/state/store";
import { ingredientById } from "@/data/catalog";
import { useTheme } from "@/theme/useTheme";
export default function Shopping() {
  const items = useCook((s) => s.shopping);
  const toggle = useCook((s) => s.toggleShopping);
  const c = useTheme();
  return (
    <Screen>
      <Back title="Shopping list" />
      <T bold size={34}>
        A few good things.
      </T>
      <T muted>
        Missing ingredients, all in one place. Matching ingredients and units
        are combined.
      </T>
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
            {i.checked ? <Check color={c.primary} /> : <Plus color={c.muted} />}
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
      {!items.length ? (
        <Empty
          title="Nothing to pick up yet"
          body="Open a recipe and add its missing ingredients here."
        />
      ) : null}
      <T size={12} muted>
        Retailer links and affiliate offers are not enabled.
      </T>
    </Screen>
  );
}
