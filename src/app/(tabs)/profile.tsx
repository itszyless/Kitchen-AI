import { router } from "expo-router";
import { View } from "react-native";
import { Leaf, ShoppingBasket, Bookmark } from "lucide-react-native";
import { Screen, T, Panel, Button, Chip, Row } from "@/components/ui";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { allergens } from "@/domain/types";
export default function Profile() {
  const p = useCook((s) => s.preferences);
  const update = useCook((s) => s.updatePreferences);
  const theme = useCook((s) => s.theme);
  const setTheme = useCook((s) => s.setTheme);
  const completed = useCook((s) => s.completed);
  const c = useTheme();
  return (
    <Screen>
      <Row>
        <Leaf size={34} color={c.primary} />
        <T size={36} bold>
          Your kitchen.
        </T>
      </Row>
      <Panel>
        <T bold size={24}>
          Home cook
        </T>
        <T muted>
          {completed} {completed === 1 ? "meal" : "meals"} made · Guest on this
          device
        </T>
        <T size={13}>
          Your pantry, preferences and saves work without an account. Cloud sync
          will be available after Supabase is connected.
        </T>
      </Panel>
      <Button
        secondary
        icon={ShoppingBasket}
        label="My shopping list"
        onPress={() => router.push("/shopping")}
      />
      <Button
        secondary
        icon={Bookmark}
        label="Browse recipes & saves"
        onPress={() => router.push("/discover")}
      />
      <T bold size={24}>
        Make yourself at home
      </T>
      <T bold>Appearance</T>
      <Row>
        {(["system", "light", "dark"] as const).map((t) => (
          <Chip
            key={t}
            label={t[0].toUpperCase() + t.slice(1)}
            selected={t === theme}
            onPress={() => setTheme(t)}
          />
        ))}
      </Row>
      <T bold>Food preferences</T>
      <Row style={{ flexWrap: "wrap" }}>
        {(["Anything", "Vegetarian", "Vegan"] as const).map((d) => (
          <Chip
            key={d}
            label={d}
            selected={p.diet === d}
            onPress={() => update({ diet: d })}
          />
        ))}
      </Row>
      <T bold>Excluded allergens</T>
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
        {allergens.map((a) => (
          <Chip
            key={a}
            label={a}
            selected={p.allergies.includes(a)}
            onPress={() =>
              update({
                allergies: p.allergies.includes(a)
                  ? p.allergies.filter((x) => x !== a)
                  : [...p.allergies, a],
              })
            }
          />
        ))}
      </View>
      <T size={13} muted>
        Always verify labels and cross-contact risks. Cook is not a substitute
        for checking food safety yourself.
      </T>
      <T bold>Product region · {p.country}</T>
      <Row style={{ flexWrap: "wrap" }}>
        {["AT", "DE", "US", "GB", "FR", "IT"].map((country) => (
          <Chip
            key={country}
            label={country}
            selected={country === p.country}
            onPress={() => update({ country })}
          />
        ))}
      </Row>
      <Panel>
        <T bold>Private by default</T>
        <T size={14}>
          This preview stores kitchen data on this device. No analytics, ads,
          subscriptions or AI uploads are active. Recipe photos load from
          Unsplash when online.
        </T>
      </Panel>
      <T size={12} muted>
        Cook 0.1 · Development preview. Account deletion, data export and legal
        pages are release prerequisites.
      </T>
    </Screen>
  );
}
