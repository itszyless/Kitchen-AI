import asset0 from "../../assets/images/icons/darkmode_text.png";
import asset1 from "../../assets/images/icons/lightmode_text.png";
import { View } from "react-native";
import { Image } from "expo-image";
import { useTheme } from "@/theme/useTheme";
export function Brand({ width = 160, light }: { width?: number; light?: boolean }) {
  const c = useTheme();
  const scale = width / 1604;
  return <View style={{ width, height: 292 * scale, overflow: "hidden" }}><Image accessibilityLabel="Kitchen AI" source={(light ?? c.dark) ? asset0 : asset1} contentFit="contain" style={{ position: "absolute", left: -275 * scale, top: -198 * scale, width: 2172 * scale, height: 724 * scale }} /></View>;
}
