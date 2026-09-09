import { useFonts } from "expo-font";
import { PlusJakartaSans_400Regular } from "@expo-google-fonts/plus-jakarta-sans/400Regular";
import { PlusJakartaSans_600SemiBold } from "@expo-google-fonts/plus-jakarta-sans/600SemiBold";
import { PlusJakartaSans_800ExtraBold } from "@expo-google-fonts/plus-jakarta-sans/800ExtraBold";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/theme/useTheme";
import { useCook } from "@/state/store";
import { Loading, T } from "@/components/ui";
import { View } from "react-native";
export { ErrorBoundary } from "expo-router";
export default function Root() {
  const [fontsLoaded, fontError] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_800ExtraBold,
  });
  const c = useTheme();
  const ready = useCook((s) => s.hydrated);
  const error = useCook((s) => s.storageError);
  return (
    <SafeAreaProvider>
      <StatusBar style={c.dark ? "light" : "dark"} />
      {error ? (
        <View style={{ padding: 12, backgroundColor: c.soft }}>
          <T>
            Device storage is unavailable. Changes may not survive closing Cook.
          </T>
        </View>
      ) : null}
      {ready && (fontsLoaded || fontError) ? (
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: c.bg },
          }}
        />
      ) : (
        <Loading />
      )}
    </SafeAreaProvider>
  );
}
