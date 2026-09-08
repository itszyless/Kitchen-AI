import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/theme/useTheme";
import { useCook } from "@/state/store";
import { Loading, T } from "@/components/ui";
import { View } from "react-native";
export { ErrorBoundary } from "expo-router";
export default function Root() {
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
      {ready ? (
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
