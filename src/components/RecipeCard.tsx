import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { router } from "expo-router";
import { Clock, ArrowUpRight } from "lucide-react-native";
import { Recipe } from "@/domain/types";
import { useTheme } from "@/theme/useTheme";
import { Row, T } from "./ui";
export function RecipeCard({
  recipe,
  score,
  compact = false,
}: {
  recipe: Recipe;
  score?: number;
  compact?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={"Open " + recipe.title}
      onPress={() =>
        router.push({ pathname: "/recipe/[id]", params: { id: recipe.id } })
      }
      style={{ gap: 12, flexShrink: 0, minWidth: 0 }}
    >
      <View
        style={{
          borderRadius: 24,
          overflow: "hidden",
          backgroundColor: c.soft,
        }}
      >
        <Image
          source={recipe.image}
          style={{ height: compact ? 180 : 300, width: "100%" }}
          contentFit="cover"
          transition={200}
          accessibilityLabel={recipe.title}
        />
        <View
          style={{
            position: "absolute",
            left: 16,
            top: 16,
            backgroundColor: c.surface,
            paddingHorizontal: 12,
            paddingVertical: 8,
            borderRadius: 20,
          }}
        >
          <T size={12} bold>
            {recipe.source === "Community"
              ? "COMMUNITY · SAMPLE"
              : "FROM THE COOK KITCHEN"}
          </T>
        </View>
        {score !== undefined ? (
          <View
            style={{
              position: "absolute",
              bottom: 16,
              left: 16,
              backgroundColor: c.primary,
              borderRadius: 18,
              paddingHorizontal: 13,
              paddingVertical: 8,
            }}
          >
            <T size={13} bold style={{ color: c.onPrimary }}>
              {score === 100 ? "You have everything" : score + "% pantry match"}
            </T>
          </View>
        ) : null}
      </View>
      <Row style={{ justifyContent: "space-between" }}>
        <T size={compact ? 20 : 25} bold style={{ flex: 1 }}>
          {recipe.title}
        </T>
        <ArrowUpRight size={23} color={c.text} />
      </Row>
      <Row>
        <Clock size={15} color={c.muted} />
        <T size={13} muted>
          {recipe.minutes} min · {recipe.tags[0]} · {recipe.protein}g protein*
        </T>
      </Row>
    </Pressable>
  );
}
