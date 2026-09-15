import { Brand } from "@/components/Brand";
import { cookingStreak } from "@/domain/activity";
import { Flame } from "lucide-react-native";
import { router } from "expo-router";
import { View, ScrollView, Pressable } from "react-native";
import {
  ShoppingBasket,
  ChevronRight,
  UserRound,
  Refrigerator,
} from "lucide-react-native";
import {
  Screen,
  T,
  Row,
  IconButton,
  Empty,
  SectionHeader,
} from "@/components/ui";
import { RecipeCard } from "@/components/RecipeCard";
import { recipes } from "@/data/catalog";
import { eligible, match } from "@/domain/matching";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
export default function Home() {
  const cookedDays = useCook((s) => s.cookedDays);
  const streak = cookingStreak(cookedDays);
  const c = useTheme();
  const p = useCook((s) => s.preferences);
  const pantry = useCook((s) => s.pantry);
  const ranked = recipes
    .filter((r) => eligible(r, p))
    .map((r) => ({ recipe: r, ...match(r, pantry) }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        Number(a.recipe.minutes > p.minutes) -
          Number(b.recipe.minutes > p.minutes),
    );
  const hero = ranked[0];
  return (
    <Screen style={{ gap: 22 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <View>
          <Brand />
        </View>
        <Row style={{ gap: 8 }}>
          <Row style={{ gap: 3 }}>
            <Flame
              size={22}
              color={streak.active ? "#F15A38" : c.muted}
              fill={streak.active ? "#F15A38" : "transparent"}
            />
            <T bold style={{ color: streak.active ? "#F15A38" : c.muted }}>
              {streak.count.toLocaleString("en-US")}
            </T>
          </Row>
          <IconButton
            icon={ShoppingBasket}
            label="Shopping list"
            onPress={() => router.push("/shopping")}
          />
          <IconButton
            icon={UserRound}
            label="My profile"
            onPress={() => router.push("/profile")}
          />
        </Row>
      </Row>
      <T bold size={32}>
        What should I cook today?
      </T>
      {hero ? (
        <RecipeCard
          recipe={hero.recipe}
          score={pantry.length ? hero.score : undefined}
        />
      ) : (
        <Empty
          title="Let’s find another idea"
          body="No recipes fit your preferences. Allergy exclusions stay in place."
        />
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => router.push(pantry.length ? "/pantry" : "/scan")}
        style={{ paddingVertical: 10 }}
      >
        <Row>
          <View
            style={{ padding: 12, backgroundColor: c.soft, borderRadius: 15 }}
          >
            <Refrigerator size={24} color={c.primary} />
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <T bold size={16}>
              Cook with what you have
            </T>
            <T muted size={12}>
              {pantry.length
                ? pantry.length + " ingredients ready for a good meal"
                : "Your next meal could be in your fridge"}
            </T>
          </View>
          <ChevronRight size={20} color={c.text} />
        </Row>
      </Pressable>
      <SectionHeader
        title="Quick tonight"
        action="Explore"
        onPress={() => router.push("/discover")}
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 16 }}
      >
        {ranked.slice(1).map((r) => (
          <RecipeCard key={r.recipe.id} recipe={r.recipe} variant="rail" />
        ))}
      </ScrollView>
      <T size={11} muted>
        A little inspiration for your next meal.
      </T>
    </Screen>
  );
}
