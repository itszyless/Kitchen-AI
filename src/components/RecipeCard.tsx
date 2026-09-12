import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Bookmark, Clock } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { Recipe } from "@/domain/types";
import { useTheme } from "@/theme/useTheme";
import { useCook } from "@/state/store";
import { Row, T, IconButton, Button, Progress } from "./ui";
export function RecipeCard({
  recipe,
  score,
  compact = false,
  variant,
}: {
  recipe: Recipe;
  score?: number;
  compact?: boolean;
  variant?: "featured" | "rail" | "list";
}) {
  const c = useTheme();
  const saved = useCook((s) => s.saved.includes(recipe.id));
  const toggle = useCook((s) => s.toggleSaved);
  const kind = variant || (compact ? "list" : "featured");
  const open = () =>
    router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } });
  const save = () => {
    toggle(recipe.id);
    void Haptics.selectionAsync().catch(() => {});
  };
  if (kind === "list")
    return (
      <Row style={{ paddingVertical: 10, gap: 14 }}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Open " + recipe.title}
          onPress={open}
        >
          <Image
            source={recipe.image}
            style={{ width: 100, height: 102, borderRadius: 17 }}
            contentFit="cover"
            transition={180}
          />
        </Pressable>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Recipe " + recipe.title}
          onPress={open}
          style={{ flex: 1, gap: 6 }}
        >
          <T bold size={16}>
            {recipe.title}
          </T>
          <T muted size={12}>
            {recipe.minutes} min · {recipe.tags[0]}
          </T>
          {score !== undefined ? (
            <T size={12} style={{ color: c.muted }}>
              {score}% pantry match
            </T>
          ) : null}
          {recipe.source === "Community" ? (
            <T muted size={11}>
              Community
            </T>
          ) : null}
        </Pressable>
        <IconButton
          icon={Bookmark}
          active={saved}
          label={saved ? "Unsave " + recipe.title : "Save " + recipe.title}
          onPress={save}
        />
      </Row>
    );
  return (
    <View
      style={{
        gap: 10,
        flexShrink: 0,
        width: kind === "rail" ? 222 : undefined,
      }}
    >
      <View
        style={{ borderRadius: 16, overflow: "hidden", backgroundColor: c.bg }}
      >
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Open " + recipe.title}
          onPress={open}
        >
          <Image
            source={recipe.image}
            style={{ height: kind === "rail" ? 156 : 240, width: "100%" }}
            contentFit="cover"
            transition={180}
          />
        </Pressable>
        <View style={{ position: "absolute", top: 12, right: 12 }}>
          <IconButton
            icon={Bookmark}
            active={saved}
            label={saved ? "Unsave " + recipe.title : "Save " + recipe.title}
            onPress={save}
          />
        </View>
        {kind === "featured" ? (
          <View style={{ paddingTop: 16, gap: 14, backgroundColor: c.bg }}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={"Recipe " + recipe.title}
              onPress={open}
            >
              <T bold size={22}>
                {recipe.title}
              </T>
              <T muted size={13}>
                {recipe.minutes} min · Beginner friendly
              </T>
            </Pressable>
            <View style={{ gap: 16 }}>
              <Row style={{ gap: 16 }}>
                <View style={{ flex: 1, gap: 8 }}>
                  <T size={12} bold style={{ color: c.success }}>
                    {score === undefined
                      ? "A fresh idea for tonight"
                      : score + "% pantry match"}
                  </T>
                  {score !== undefined ? <Progress value={score} /> : null}
                </View>
              </Row>
              <Button label="View recipe" onPress={open} />
            </View>
          </View>
        ) : null}
      </View>
      {kind === "rail" ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={"Recipe " + recipe.title}
          onPress={open}
          style={{ gap: 5 }}
        >
          <T bold size={16}>
            {recipe.title}
          </T>
          <Row style={{ gap: 5 }}>
            <Clock size={14} color={c.muted} />
            <T muted size={12}>
              {recipe.minutes} min · {recipe.tags[0]}
            </T>
          </Row>
        </Pressable>
      ) : null}
    </View>
  );
}
