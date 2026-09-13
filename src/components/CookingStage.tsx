import { View } from "react-native";
import Animated, {
  FadeInRight,
  useReducedMotion,
} from "react-native-reanimated";
import { T } from "./ui";
import { useTheme } from "@/theme/useTheme";
export function CookingStage({
  step,
  total,
  title,
  body,
  original = false,
}: {
  step: number;
  total: number;
  title: string;
  body: string;
  original?: boolean;
}) {
  const c = useTheme();
  const reduced = useReducedMotion();
  return (
    <Animated.View
      key={step}
      entering={reduced ? undefined : FadeInRight.duration(220)}
      style={{ gap: 24, paddingVertical: 16 }}
    >
      <View style={{ flexDirection: "row", gap: 6 }}>
        {Array.from({ length: total }, (_, n) => (
          <View
            key={n}
            style={{
              flex: 1,
              height: 5,
              borderRadius: 3,
              backgroundColor: n <= step ? c.text : c.border,
            }}
          />
        ))}
      </View>
      <View style={{ flexDirection: "row", alignItems: "baseline", gap: 8 }}>
        <T size={64} bold style={{ letterSpacing: -4 }}>
          {String(step + 1).padStart(2, "0")}
        </T>
        <T muted size={16}>
          / {String(total).padStart(2, "0")}
        </T>
      </View>
      <T bold size={32} original={original}>
        {title}
      </T>
      <T size={23} original={original} style={{ lineHeight: 35 }}>
        {body}
      </T>
    </Animated.View>
  );
}
