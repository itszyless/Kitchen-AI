import { PropsWithChildren } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TextInputProps,
  TextProps,
  View,
  ViewStyle,
  StyleProp,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ArrowLeft, LucideIcon } from "lucide-react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme/useTheme";
export function T({
  children,
  size = 16,
  muted = false,
  bold = false,
  style,
  ...props
}: TextProps & { size?: number; muted?: boolean; bold?: boolean }) {
  const c = useTheme();
  return (
    <Text
      {...props}
      style={[
        {
          fontSize: size,
          lineHeight: size * 1.35,
          color: muted ? c.muted : c.text,
          fontWeight: bold ? "700" : "400",
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}
export function Screen({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: c.bg }}
      contentContainerStyle={[
        {
          paddingTop: Math.max(insets.top, 20),
          paddingHorizontal: 24,
          paddingBottom: 32,
          gap: 24,
          width: "100%",
          maxWidth: 760,
          alignSelf: "center",
        },
        style,
      ]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}
export function Row({
  children,
  style,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return (
    <View
      style={[{ flexDirection: "row", alignItems: "center", gap: 12 }, style]}
    >
      {children}
    </View>
  );
}
export function Button({
  label,
  onPress,
  secondary = false,
  disabled = false,
  icon: Icon,
}: {
  label: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: LucideIcon;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={({ pressed }) => ({
        backgroundColor: secondary ? c.soft : c.primary,
        paddingVertical: 17,
        paddingHorizontal: 22,
        borderRadius: 18,
        alignItems: "center",
        opacity: disabled ? 0.4 : pressed ? 0.75 : 1,
        minHeight: 56,
      })}
    >
      <Row>
        {Icon ? (
          <Icon size={20} color={secondary ? c.text : c.onPrimary} />
        ) : null}
        <T bold style={{ color: secondary ? c.text : c.onPrimary }}>
          {label}
        </T>
      </Row>
    </Pressable>
  );
}
export function IconButton({
  icon: Icon,
  label,
  onPress,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: c.surface,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
        borderWidth: 1,
        borderColor: c.border,
      })}
    >
      <Icon size={22} color={c.text} />
    </Pressable>
  );
}
export function Chip({
  label,
  selected = false,
  onPress,
}: {
  label: string;
  selected?: boolean;
  onPress: () => void;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      aria-selected={selected}
      onPress={onPress}
      style={{
        paddingHorizontal: 17,
        paddingVertical: 12,
        minHeight: 44,
        borderRadius: 24,
        backgroundColor: selected ? c.primary : c.surface,
        borderWidth: 1,
        borderColor: selected ? c.primary : c.border,
      }}
    >
      <T size={14} bold style={{ color: selected ? c.onPrimary : c.text }}>
        {label}
      </T>
    </Pressable>
  );
}
export function Field(props: TextInputProps) {
  const c = useTheme();
  return (
    <TextInput
      placeholderTextColor={c.muted}
      {...props}
      style={[
        {
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 16,
          minHeight: 54,
          paddingHorizontal: 16,
          paddingVertical: 12,
          color: c.text,
          backgroundColor: c.surface,
          fontSize: 16,
        },
        props.style,
      ]}
    />
  );
}
export function Back({ title }: { title: string }) {
  return (
    <Row>
      <IconButton
        icon={ArrowLeft}
        label="Go back"
        onPress={() =>
          router.canGoBack() ? router.back() : router.replace("/")
        }
      />
      <T bold size={18}>
        {title}
      </T>
    </Row>
  );
}
export function Panel({ children }: PropsWithChildren) {
  const c = useTheme();
  return (
    <View
      style={{
        padding: 20,
        gap: 12,
        borderRadius: 22,
        backgroundColor: c.soft,
      }}
    >
      {children}
    </View>
  );
}
export function Empty({ title, body }: { title: string; body: string }) {
  return (
    <Panel>
      <T bold size={21}>
        {title}
      </T>
      <T muted>{body}</T>
    </Panel>
  );
}
export function Loading() {
  const c = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: c.bg,
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
      }}
    >
      <ActivityIndicator color={c.primary} />
      <T>Getting your kitchen ready…</T>
    </View>
  );
}
