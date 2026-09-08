import { useState } from "react";
import { View } from "react-native";
import { Screen, T, Field, Chip, Row, Empty } from "@/components/ui";
import { RecipeCard } from "@/components/RecipeCard";
import { recipes, ingredientById } from "@/data/catalog";
import { eligible, normalize, match } from "@/domain/matching";
import { useCook } from "@/state/store";
export default function Discover() {
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
  return (
    <Screen>
      <T size={36} bold>
        Find your next favorite.
      </T>
      <T muted>A good meal starts with a little curiosity.</T>
      <Field
        accessibilityLabel="Search recipes"
        placeholder="Pasta, chickpeas, Mediterranean…"
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />
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
      <T muted size={13}>
        {result.length} recipes · tailored to your food preferences
      </T>
      <View style={{ gap: 28 }}>
        {result.map((r) => (
          <RecipeCard
            key={r.id}
            recipe={r}
            score={pantry.length ? match(r, pantry).score : undefined}
            compact
          />
        ))}
      </View>
      {!result.length ? (
        <Empty
          title="A fresh search?"
          body="Try an ingredient or a cuisine, or change the filters. Allergy exclusions are always applied."
        />
      ) : null}
    </Screen>
  );
}
