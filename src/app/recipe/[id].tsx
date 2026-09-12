import { useLanguage } from "@/i18n";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useState } from "react";
import { View, Pressable, Share } from "react-native";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import {
  Bookmark,
  Share2,
  Check,
  Plus,
  Minus,
  ArrowLeft,
} from "lucide-react-native";
import {
  Back,
  Screen,
  T,
  Row,
  IconButton,
  Panel,
  Button,
  Empty,
  Progress,
} from "@/components/ui";
import { recipes, ingredientById } from "@/data/catalog";
import { eligible, match, available, substitutes } from "@/domain/matching";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { AISubstitutions } from "@/components/AISubstitutions";
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
  const language = useLanguage(s => s.language);
  const [original, setOriginal] = useState(false);
  const insets = useSafeAreaInsets();
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
  const start = () =>
    router.push({
      pathname: "/cook/[id]",
      params: { id: r.id, servings: String(servings) },
    });
  return (
    <Screen
      style={{ paddingTop: 0, gap: 18 }}
      footer={<Button label="Start cooking" onPress={start} />}
    >
      <View style={{ marginHorizontal: -20 }}>
        <Image
          source={r.image}
          contentFit="cover"
          style={{ width: "100%", height: 300 }}
        />
        <Row
          style={{
            position: "absolute",
            top: Math.max(insets.top, 20),
            left: 20,
            right: 20,
            justifyContent: "space-between",
          }}
        >
          <IconButton
            icon={ArrowLeft}
            label="Go back"
            onPress={() =>
              router.canGoBack() ? router.back() : router.replace("/")
            }
          />
          <Row>
            <IconButton
              icon={Bookmark}
              active={saved.includes(r.id)}
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
      </View>
      <T muted size={12}>
        {r.source === "Cook" ? "THE COOK KITCHEN" : "COMMUNITY"}
      </T>
      <T bold size={32} original={original}>
        {r.title}
      </T>
      <T muted original={original}>{r.subtitle}</T>
      {language === "de" ? <Button secondary label={original ? "Show translation" : "Show original"} onPress={() => setOriginal(!original)} /> : null}
      <Row
        style={{
          paddingVertical: 12,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: c.border,
          justifyContent: "space-between",
        }}
      >
        <View style={{ gap: 4 }}>
          <T bold>{r.minutes} min</T>
          <T muted size={12}>
            Total time
          </T>
        </View>
        <View style={{ gap: 4 }}>
          <T bold>Easy</T>
          <T muted size={12}>
            Skill level
          </T>
        </View>
        <View style={{ gap: 4 }}>
          <T bold>{r.servings}</T>
          <T muted size={12}>
            Servings
          </T>
        </View>
      </Row>
      <Row>
        <View style={{ flex: 1, gap: 8 }}>
          <T bold size={15}>
            {m.score}% in your pantry
          </T>
          <Progress value={m.score} />
        </View>
        <T muted size={12}>
          {m.missing.length} missing
        </T>
      </Row>
      <Row style={{ justifyContent: "space-between", flexWrap: "wrap" }}>
        <T bold size={24}>
          Ingredients
        </T>
        <Row style={{ gap: 8 }}>
          <IconButton
            icon={Minus}
            label="Fewer servings"
            onPress={() => {
              setServings((s) => Math.max(1, s - 1));
              setAdded(false);
            }}
          />
          <T bold>{servings} servings</T>
          <IconButton
            icon={Plus}
            label="More servings"
            onPress={() => {
              setServings((s) => Math.min(12, s + 1));
              setAdded(false);
            }}
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
              paddingBottom: 12,
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
                    {owned
                      ? "You have it"
                      : i.optional
                        ? "Optional"
                        : "Missing"}
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
                <AISubstitutions
                  ingredient={`${amount} ${i.unit} ${ingredientById[i.ingredientId].name}`}
                  recipe={
                    r.title + "\n" + r.steps.map((step) => step.body).join("\n")
                  }
                />

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
      <T bold size={24}>
        A peek at the steps
      </T>
      {r.steps.map((s, n) => (
        <Row key={s.title}>
          <T bold muted>
            {String(n + 1).padStart(2, "0")}
          </T>
          <T original={original}>{s.title}</T>
        </Row>
      ))}
      <T size={12} muted>
        Always check ingredient labels and allergy cross-contact risks.
      </T>
    </Screen>
  );
}
