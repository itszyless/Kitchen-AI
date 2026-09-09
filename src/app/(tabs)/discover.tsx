import {
  BottomSheetModal,
  BottomSheetView,
} from "@expo/ui/community/bottom-sheet";
import { SlidersHorizontal } from "lucide-react-native";
import { useTheme } from "@/theme/useTheme";
import { useState, useRef } from "react";
import { View, ScrollView } from "react-native";
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
  const sheet = useRef<BottomSheetModal>(null);
  const c = useTheme();
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
      <Row style={{ justifyContent: "space-between" }}>
        <T size={32} bold>
          Discover
        </T>
        <IconButton
          icon={SlidersHorizontal}
          label="Recipe filters"
          onPress={() => sheet.current?.present()}
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
        {result.length} recipes · tailored to your food preferences
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
      {!result.length ? (
        <Empty
          title="A fresh search?"
          body="Try an ingredient or a cuisine, or change the filters. Allergy exclusions are always applied."
        />
      ) : null}
      <BottomSheetModal ref={sheet} snapPoints={["65%"]} enablePanDownToClose>
        <BottomSheetView
          style={{ padding: 24, gap: 20, backgroundColor: c.bg }}
        >
          <T bold size={26}>
            Your kind of cooking
          </T>
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
          <Button
            label="Show recipes"
            onPress={() => sheet.current?.dismiss()}
          />
        </BottomSheetView>
      </BottomSheetModal>
    </Screen>
  );
}
