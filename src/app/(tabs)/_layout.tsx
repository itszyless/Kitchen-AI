import { Redirect, router } from "expo-router";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, View, Platform } from "react-native";
import { ScanLine } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { T, Loading } from "@/components/ui";
import { AppIcon, AppIconName } from "@/components/app-icon";
import { GlassSurface } from "@/components/glass-surface";
import { useAuth } from "@/services/supabase/AuthProvider";
function Tab({
  name,
  label,
  center = false,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  name?: AppIconName;
  label: string;
  center?: boolean;
}) {
  const c = useTheme();
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={label}
      accessibilityState={{ selected: isFocused }}
      style={{
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        gap: 1,
        paddingVertical: 7,
        minHeight: 56,
        borderRadius: 30,
        backgroundColor: isFocused ? c.soft : "transparent",
      }}
    >
      {center ? (
        <View style={{ backgroundColor: c.ink, padding: 5, borderRadius: 16 }}>
          <ScanLine size={23} color="#FFFFFF" />
        </View>
      ) : (
        <AppIcon
          name={name!}
          filled={isFocused}
          size={23}
          color={isFocused ? c.text : c.muted}
        />
      )}
      <T size={10} bold={isFocused} muted={!isFocused}>
        {label}
      </T>
    </Pressable>
  );
}
export default function Layout() {
  const { ready } = useAuth();
  const onboarded = useCook((s) => s.onboarded);
  const c = useTheme();
  const insets = useSafeAreaInsets();
  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!ready) return <Loading />;
  return (
    <Tabs style={{ flex: 1, backgroundColor: c.bg }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList asChild>
        <GlassSurface
          style={{
            borderRadius: 36,
            padding: 4,
            marginTop: 6,
            marginBottom: Math.max(insets.bottom, 8),
            width: Platform.OS === "ios" ? "92%" : "96%",
            maxWidth: 600,
            alignSelf: "center",
          }}
        >
          <TabTrigger name="home" href="/" asChild>
            <Tab name="home" label="Home" />
          </TabTrigger>
          <TabTrigger name="discover" href="/discover" asChild>
            <Tab name="recipes" label="Recipes" />
          </TabTrigger>
          <View style={{ flex: 1 }}>
            <Tab label="Scan" center onPress={() => router.push("/capture")} />
          </View>
          <TabTrigger name="pantry" href="/pantry" asChild>
            <Tab name="pantry" label="Pantry" />
          </TabTrigger>
          <TabTrigger name="profile" href="/profile" asChild>
            <Tab name="profile" label="Profile" />
          </TabTrigger>
        </GlassSurface>
      </TabList>
    </Tabs>
  );
}
