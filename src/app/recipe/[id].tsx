import { useState } from "react";
import { View, Pressable, Share } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { Bookmark, Share2, Check, Plus, Minus } from "lucide-react-native";
import {
  Back,
  Screen,
  T,
  Row,
  IconButton,
  Panel,
  Button,
  Empty,
} from "@/components/ui";
import { recipes, ingredientById } from "@/data/catalog";
import { eligible, match, available, substitutes } from "@/domain/matching";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
export default function Detail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const r = recipes.find((r) => r.id === id);
  const p = useCook((s) => s.preferences);
  const pantry = useCook((s) => s.pantry);
  const saved = useCook((s) => s.saved);
  const toggle = useCook((s) => s.toggleSaved);
  const addShopping = useCook((s) => s.addShopping);
  const [servings, setServings] = useState(r?.servings || 2);
  const [selected, setSelected] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const c = useTheme();
  if (!r)
    return (
      <Screen>
        <Back title="Recipe" />
        <Empty
          title="Recipe not found"
          body="Return to Discover to choose another recipe."
        />
      </Screen>
    );
  if (!eligible(r, p))
    return (
      <Screen>
        <Back title="Recipe" />
        <Empty
          title="This recipe doesn’t fit your preferences"
          body="It has been excluded based on your allergy or food preferences."
        />
      </Screen>
    );
  const m = match(r, pantry, servings);
  return (
    <Screen>
      <Row style={{ justifyContent: "space-between" }}>
        <Back title="Recipe" />
        <Row>
          <IconButton
            icon={Bookmark}
            label={saved.includes(r.id) ? "Unsave recipe" : "Save recipe"}
            onPress={() => toggle(r.id)}
          />
          <IconButton
            icon={Share2}
            label="Share recipe"
            onPress={() =>
              void Share.share({
                message: r.title + " — " + r.subtitle + " From Cook.",
              }).catch(() => {})
            }
          />
        </Row>
      </Row>
      <Image
        source={r.image}
        style={{ height: 300, borderRadius: 28 }}
        contentFit="cover"
      />
      <T size={12} bold muted>
        {r.source === "Cook" ? "COOK ORIGINAL" : "COMMUNITY · SAMPLE"}
        {saved.includes(r.id) ? " · SAVED" : ""}
      </T>
      <T size={36} bold>
        {r.title}
      </T>
      <T muted>{r.subtitle}</T>
      <T size={13} muted>
        {r.author} · {r.minutes} min · Beginner friendly
      </T>
      <Row>
        <Panel>
          <T bold>{r.calories} kcal*</T>
          <T size={12} muted>
            per serving
          </T>
        </Panel>
        <Panel>
          <T bold>{r.protein}g protein*</T>
          <T size={12} muted>
            per serving
          </T>
        </Panel>
      </Row>
      <Panel>
        <T bold>
          {m.score === 100 ? "You have everything" : m.score + "% pantry match"}
        </T>
        <T muted size={14}>
          {m.missing.length
            ? m.missing.length + " ingredients need topping up."
            : "Your kitchen is ready for this one."}
        </T>
      </Panel>
      <Row style={{ justifyContent: "space-between" }}>
        <T size={25} bold>
          Ingredients
        </T>
        <Row>
          <IconButton
            icon={Minus}
            label="Fewer servings"
            onPress={() => setServings((s) => Math.max(1, s - 1))}
          />
          <T bold>{servings}</T>
          <IconButton
            icon={Plus}
            label="More servings"
            onPress={() => setServings((s) => Math.min(12, s + 1))}
          />
        </Row>
      </Row>
      {r.ingredients.map((i) => {
        const amount =
          Math.round(((i.quantity * servings) / r.servings) * 10) / 10;
        const owned = available(i, pantry) >= amount;
        const swaps = substitutes(i.ingredientId, p.allergies, pantry, p.diet);
        return (
          <View
            key={i.ingredientId}
            style={{
              gap: 12,
              paddingBottom: 16,
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={
                "Ingredient details for " + ingredientById[i.ingredientId].name
              }
              onPress={() =>
                setSelected(selected === i.ingredientId ? null : i.ingredientId)
              }
            >
              <Row>
                {owned ? (
                  <Check size={20} color={c.primary} />
                ) : (
                  <Plus size={20} color={c.muted} />
                )}
                <View style={{ flex: 1 }}>
                  <T bold>{ingredientById[i.ingredientId].name}</T>
                  <T muted size={12}>
                    {owned ? "Have" : i.optional ? "Optional" : "Missing"}
                    {swaps.some((s) => s.owned)
                      ? " · Substitute in pantry"
                      : ""}
                  </T>
                </View>
                <T>
                  {amount} {i.unit}
                </T>
              </Row>
            </Pressable>
            {selected === i.ingredientId ? (
              <Panel>
                <T bold>Substitution ideas</T>
                {swaps.length ? (
                  swaps.map((s) => (
                    <View key={s.to} style={{ gap: 6 }}>
                      <T bold>
                        {s.owned ? "You already have" : "Other option"} ·{" "}
                        {ingredientById[s.to].name}
                      </T>
                      <T size={14}>
                        {s.note} Best as a {s.context}. Check labels and
                        preparation yourself.
                      </T>
                    </View>
                  ))
                ) : (
                  <T muted size={14}>
                    No verified substitute is available in this recipe context.
                  </T>
                )}
              </Panel>
            ) : null}
          </View>
        );
      })}
      <Button
        secondary
        disabled={!m.missing.length || added}
        label={
          added
            ? "Added to shopping list"
            : m.missing.length
              ? "Add missing ingredients to list"
              : "Pantry is ready"
        }
        onPress={() => {
          addShopping(m.missing);
          setAdded(true);
        }}
      />
      <Button
        label="Start cooking"
        onPress={() =>
          router.push({ pathname: "/cook/[id]", params: { id: r.id } })
        }
      />
      <T bold size={24}>
        A peek at the steps
      </T>
      {r.steps.map((s, n) => (
        <Row key={s.title}>
          <T bold muted>
            {String(n + 1).padStart(2, "0")}
          </T>
          <T>{s.title}</T>
        </Row>
      ))}
      <T size={12} muted>
        *Illustrative nutrition, not verified calculations. Always check
        ingredient labels and allergy cross-contact risks.
      </T>
    </Screen>
  );
}
