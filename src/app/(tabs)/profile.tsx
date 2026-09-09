import { router } from "expo-router";
import { View, Pressable } from "react-native";
import {
  UserRound,
  ShoppingBasket,
  Bookmark,
  ChevronRight,
} from "lucide-react-native";
import { Screen, T, Panel, Chip, Row } from "@/components/ui";
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
        <T size={32} bold>
          Profile
        </T>
      </Row>
      <Row style={{ paddingVertical: 14 }}>
        <View
          style={{
            width: 64,
            height: 64,
            borderRadius: 32,
            backgroundColor: c.surface,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <UserRound size={30} color={c.text} />
        </View>
        <View style={{ gap: 5, flex: 1 }}>
          <T bold size={23}>
            Home cook
          </T>
          <T muted size={13}>
            {completed} {completed === 1 ? "meal" : "meals"} made · Guest
          </T>
        </View>
      </Row>
      <View>
        {[
          {
            title: "My shopping list",
            icon: ShoppingBasket,
            route: "/shopping" as const,
          },
          {
            title: "Browse recipes & saves",
            icon: Bookmark,
            route: "/discover" as const,
          },
        ].map(({ title, icon: Icon, route }) => (
          <Pressable
            key={title}
            accessibilityRole="button"
            onPress={() => router.push(route)}
            style={{
              paddingVertical: 18,
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <Row>
              <Icon size={22} color={c.text} />
              <T style={{ flex: 1 }}>{title}</T>
              <ChevronRight color={c.muted} size={19} />
            </Row>
          </Pressable>
        ))}
      </View>
      <T bold size={24}>
        Preferences
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
