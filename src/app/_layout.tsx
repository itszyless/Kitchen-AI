import { needsSocialUsername } from "@/domain/account";
import asset0 from "../../assets/fonts/SF-Pro-Display-Regular.otf";
import asset1 from "../../assets/fonts/SF-Pro-Display-Medium.otf";
import asset2 from "../../assets/fonts/SF-Pro-Display-Bold.otf";
import asset3 from "../../assets/fonts/SF-Pro-Display-Black.otf";
import { useFonts } from "expo-font";
import { LaunchScreen } from "@/components/LaunchScreen";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { useTheme } from "@/theme/useTheme";
import { useCook } from "@/state/store";
import { T } from "@/components/ui";
import { View } from "react-native";
import { AuthProvider, useAuth } from "@/services/supabase/AuthProvider";
export { ErrorBoundary } from "expo-router";
export default function Root() {
  const c = useTheme();
  const error = useCook((s) => s.storageError);
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style={c.dark ? "light" : "dark"} />
          {error ? (
            <View style={{ padding: 12, backgroundColor: c.soft }}>
              <T>
                Device storage is unavailable. Changes may not survive closing
                Kitchen AI.
              </T>
            </View>
          ) : null}
          <Routes />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

function Routes() {
  const [fontsLoaded, fontError] = useFonts({
    SFRegular: asset0,
    SFMedium: asset1,
    SFBold: asset2,
    SFBlack: asset3,
  });
  const c = useTheme();
  const { session, ready } = useAuth();
  const onboarded = useCook((s) => s.onboarded);
  const hydrated = useCook((s) => s.hydrated);
  return (
    <LaunchScreen
      ready={ready && hydrated && (fontsLoaded || Boolean(fontError))}
    >
      <Stack
        initialRouteName={onboarded ? "(tabs)" : "onboarding"}
        screenOptions={{
          headerShown: false,
          animation: "slide_from_right",
          gestureEnabled: true,
          contentStyle: { backgroundColor: c.bg },
        }}
      >
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="auth" />
        <Stack.Screen name="username" />
        <Stack.Protected
          guard={
            (!session || !needsSocialUsername(session.user)) && onboarded
          }
        >
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
      </Stack>
    </LaunchScreen>
  );
}
