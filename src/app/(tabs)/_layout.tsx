import { useTranslate } from "@/i18n";
import { Redirect, router } from "expo-router";
import {
  Tabs,
  TabList,
  TabTrigger,
  TabSlot,
  TabTriggerSlotProps,
} from "expo-router/ui";
import { Pressable, View } from "react-native";
import {
  Home,
  Compass,
  ScanLine,
  Refrigerator,
  UserRound,
  LucideIcon,
} from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import { T, Loading } from "@/components/ui";
import { useAuth } from "@/services/supabase/AuthProvider";
function Tab({
  icon: Icon,
  label,
  center = false,
  isFocused,
  ...props
}: TabTriggerSlotProps & {
  icon: LucideIcon;
  label: string;
  center?: boolean;
}) {
  const c = useTheme();
  const t = useTranslate();
  return (
    <Pressable
      {...props}
      accessibilityRole="tab"
      accessibilityLabel={t(label)}
      accessibilityState={{ selected: isFocused }}
      aria-selected={isFocused}
      style={{
        flex: 1,
        alignItems: "center",
        gap: 5,
        paddingVertical: 8,
        minHeight: 60,
      }}
    >
      <View
        style={{
          backgroundColor: center ? c.ink : isFocused ? c.soft : "transparent",
          padding: center ? 13 : 5,
          borderRadius: 22,
          borderBottomWidth: 0,
          borderBottomColor: c.primary,
          marginTop: center ? -15 : 0,
        }}
      >
        <Icon
          size={center ? 27 : 23}
          color={center ? "#FFFFFF" : isFocused ? c.primary : c.muted}
          strokeWidth={isFocused ? 2.5 : 1.8}
        />
      </View>
      <T size={11} bold={isFocused} muted={!isFocused}>
        {label}
      </T>
    </Pressable>
  );
}
export default function Layout() {
  const { session, ready } = useAuth();
  const onboarded = useCook((s) => s.onboarded);
  const c = useTheme();
  const insets = useSafeAreaInsets();
  if (!onboarded) return <Redirect href="/onboarding" />;
  if (!ready) return <Loading />;
  if (!session) return <Redirect href="/auth" />;
  return (
    <Tabs style={{ flex: 1, backgroundColor: c.bg }}>
      <TabSlot style={{ flex: 1 }} />
      <TabList
        style={{
          backgroundColor: c.nav,
          borderTopWidth: 1,
          borderColor: c.border,
          paddingTop: 10,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingHorizontal: 12,
          width: "100%",
          maxWidth: 600,
          alignSelf: "center",
        }}
      >
        <TabTrigger name="home" href="/" asChild>
          <Tab icon={Home} label="Home" />
        </TabTrigger>
        <TabTrigger name="discover" href="/discover" asChild>
          <Tab icon={Compass} label="Discover" />
        </TabTrigger>
        <TabTrigger name="scan" href="/scan" asChild>
          <Tab
            icon={ScanLine}
            label="Scan"
            center
            onPress={() => router.push("/capture")}
          />
        </TabTrigger>
        <TabTrigger name="pantry" href="/pantry" asChild>
          <Tab icon={Refrigerator} label="Pantry" />
        </TabTrigger>
        <TabTrigger name="profile" href="/profile" asChild>
          <Tab icon={UserRound} label="Profile" />
        </TabTrigger>
      </TabList>
    </Tabs>
  );
}
