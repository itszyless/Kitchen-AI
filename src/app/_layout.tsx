import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/theme/useTheme";
import { useCook } from "@/state/store";
import { Loading, T } from "@/components/ui";
import { View } from "react-native";
import { AuthProvider, useAuth } from "@/services/supabase/AuthProvider";
export { ErrorBoundary } from "expo-router";
export default function Root() {
  const c = useTheme();
  const ready = useCook((s) => s.hydrated);
  const error = useCook((s) => s.storageError);
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style={c.dark ? "light" : "dark"} />
        {error ? (
          <View style={{ padding: 12, backgroundColor: c.soft }}>
            <T>
              Device storage is unavailable. Changes may not survive closing
              Cook.
            </T>
          </View>
        ) : null}
        {ready ? <Routes /> : <Loading />}

      </AuthProvider>
    </SafeAreaProvider>
  );
}

function Routes() {
  const c = useTheme();
  const { session, ready } = useAuth();
  const onboarded = useCook(s => s.onboarded);
  if (!ready) return <Loading />;
  return <Stack initialRouteName={onboarded ? "auth" : "onboarding"} screenOptions={{headerShown:false,contentStyle:{backgroundColor:c.bg}}}>
    <Stack.Screen name="onboarding" />
    <Stack.Screen name="auth" />
    <Stack.Protected guard={Boolean(session) && onboarded}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="add" />
      <Stack.Screen name="barcode" />
      <Stack.Screen name="capture" />
      <Stack.Screen name="cook/[id]" />
      <Stack.Screen name="library/[id]" />
      <Stack.Screen name="products" />
      <Stack.Screen name="recipe/[id]" />
      <Stack.Screen name="review" />
      <Stack.Screen name="shopping" />
    </Stack.Protected>
  </Stack>;
}
