import { useColorScheme } from "react-native";
import { useCook } from "@/state/store";
import { palettes } from "./tokens";
export function useTheme() {
  const system = useColorScheme();
  const preference = useCook((s) => s.theme);
  const dark =
    preference === "dark" || (preference === "system" && system === "dark");
  return { ...palettes[dark ? "dark" : "light"], dark };
}
