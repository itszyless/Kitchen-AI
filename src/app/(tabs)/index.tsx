import { Brand } from "@/components/Brand";
import { Streak } from "@/components/streak";
import { AppIcon } from "@/components/app-icon";
import { router } from "expo-router";
import { View, ScrollView, Pressable } from "react-native";
import { ChevronRight } from "lucide-react-native";
import { Screen, T, Row, Empty, SectionHeader } from "@/components/ui";
import { RecipeCard } from "@/components/RecipeCard";
import { recipes } from "@/data/catalog";
import { eligible, match } from "@/domain/matching";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
export default function Home() {
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
          <Brand width={140} />
        </View>
        <Streak />
      </Row>
      <T bold size={29}>
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
            <AppIcon name="pantry" size={24} color={c.primary} />
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
