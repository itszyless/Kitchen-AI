import { useEffect, useState } from "react";
import { AccessibilityInfo, Platform, View, ViewProps } from "react-native";
import {
  GlassView,
  isLiquidGlassAvailable,
  isGlassEffectAPIAvailable,
} from "expo-glass-effect";
import { useTheme } from "@/theme/useTheme";
export function GlassSurface({
  style,
  tintColor,
  ...props
}: ViewProps & { tintColor?: string }) {
  const c = useTheme();
  const [reduced, setReduced] = useState(true);
  useEffect(() => {
    if (Platform.OS !== "ios") return;
    let active = true;
    void AccessibilityInfo.isReduceTransparencyEnabled()
      .then((value) => {
        if (active) setReduced(value);
      })
      .catch(() => {
        if (active) setReduced(true);
      });
    const sub = AccessibilityInfo.addEventListener(
      "reduceTransparencyChanged",
      setReduced,
    );
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  if (
    Platform.OS === "ios" &&
    !reduced &&
    isGlassEffectAPIAvailable() &&
    isLiquidGlassAvailable()
  ) {
    return (
      <GlassView
        {...props}
        glassEffectStyle="regular"
        tintColor={tintColor}
        isInteractive
        colorScheme={c.dark ? "dark" : "light"}
        style={style}
      />
    );
  }
  return (
    <View
      {...props}
      style={[{ backgroundColor: tintColor ?? c.surface }, style]}
    />
  );
}
