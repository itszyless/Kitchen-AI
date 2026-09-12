import { router } from "expo-router";
import { Image } from "expo-image";
import { recipeLibrary, libraryEligible } from "@/data/recipeLibrary";
import { SlidersHorizontal } from "lucide-react-native";
import { CookSheet } from "@/components/CookSheet";
import { useState } from "react";
import { View, ScrollView, Pressable } from "react-native";
import {
  Screen,
  T,
  SearchBar,
  Chip,
  Row,
  Empty,
  IconButton,
  Button,
} from "@/components/ui";
import { RecipeCard } from "@/components/RecipeCard";
import { recipes, ingredientById } from "@/data/catalog";
import { eligible, normalize, match } from "@/domain/matching";
import { useCook } from "@/state/store";
export default function Discover() {
  const [sheetOpen, setSheetOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(20);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("All recipes");
  const p = useCook((s) => s.preferences);
  const pantry = useCook((s) => s.pantry);
  const saved = useCook((s) => s.saved);
  const result = recipes
    .filter((r) => eligible(r, p))
    .filter(
      (r) =>
        filter === "All recipes" ||
        (filter === "Under 20 min" && r.minutes <= 20) ||
        (filter === "Saved" && saved.includes(r.id)) ||
        (filter === "Community" && r.source === "Community") ||
        r.tags.includes(filter),
    )
    .filter((r) =>
      normalize(query)
        .split(" ")
        .every((t) =>
          normalize(
            [
              r.title,
              r.cuisine,
              ...r.tags,
              ...r.ingredients.map((i) => ingredientById[i.ingredientId].name),
            ].join(" "),
          ).includes(t),
        ),
    );
  const library = recipeLibrary
    .filter((r) => libraryEligible(r, p))
    .filter(
      (r) =>
        filter === "All recipes" ||
        (filter === "Vegan" && r.category === "Vegan") ||
        (filter === "Saved" && saved.includes(r.id)) || filter === "Community",
    )
    .filter((r) =>
      normalize(
        [
          r.title,
          r.cuisine,
          r.category,
          ...r.ingredients.map((i) => i.name),
        ].join(" "),
      ).includes(normalize(query)),
    );
  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <T size={32} bold>
          Discover
        </T>
        <IconButton
          icon={SlidersHorizontal}
          label="Recipe filters"
          onPress={() => setSheetOpen(true)}
        />
      </Row>
      <SearchBar
        accessibilityLabel="Search recipes"
        placeholder="Recipes, ingredients, cuisines…"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginHorizontal: -20 }}
        contentContainerStyle={{ paddingHorizontal: 20, gap: 8 }}
      >
        {[
          "All recipes",
          "Under 20 min",
          "High protein",
          "Vegan",
          "Saved",
          "Community",
        ].map((f) => (
          <Chip
            key={f}
            label={f}
            selected={f === filter}
            onPress={() => setFilter(f)}
          />
        ))}
      </ScrollView>
      <T muted size={13}>
        {result.length + library.length} recipes · tailored to your food
        preferences
      </T>
      <View style={{ gap: 8 }}>
        {result.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            score={pantry.length ? match(r, pantry).score : undefined}
            compact
          />
        ))}
      </View>
      {library.slice(0, visibleCount).map((r) => (
        <Pressable
          key={r.id}
          accessibilityRole="button"
          accessibilityLabel={r.title}
          onPress={() =>
            router.push({ pathname: "/library/[id]", params: { id: r.id } })
          }
        >
          <Row>
            <Image
              source={r.image}
              style={{ width: 96, height: 96, borderRadius: 16 }}
              contentFit="cover"
            />
            <View style={{ flex: 1, gap: 6 }}>
              <T bold size={17}>
                {r.title}
              </T>
              <T muted size={12}>
                {[r.cuisine, r.category].filter(Boolean).join(" · ")}
              </T>
              <T muted size={11}>
                TheMealDB
              </T>
            </View>
          </Row>
        </Pressable>
      ))}
      {library.length > visibleCount ? (
        <Button
          label="Load more recipes"
          secondary
          onPress={() => setVisibleCount((n) => n + 20)}
        />
      ) : null}
      {!result.length && !library.length ? (
        <Empty
          title="A fresh search?"
          body="Try an ingredient or a cuisine, or change the filters. Allergy exclusions are always applied."
        />
      ) : null}
      <CookSheet
        visible={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Your kind of cooking"
      >
        <T muted>Allergy exclusions always stay on.</T>
        <Row style={{ flexWrap: "wrap" }}>
          {[
            "All recipes",
            "Under 20 min",
            "High protein",
            "Vegan",
            "Saved",
            "Community",
          ].map((f) => (
            <Chip
              key={f}
              label={f}
              selected={f === filter}
              onPress={() => setFilter(f)}
            />
          ))}
        </Row>
        <Button label="Show recipes" onPress={() => setSheetOpen(false)} />
      </CookSheet>
    </Screen>
  );
}
