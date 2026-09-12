import { PropsWithChildren, ReactNode, Children } from "react";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  useReducedMotion,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ArrowLeft,
  Search,
  Check,
  LucideIcon,
  Utensils,
} from "lucide-react-native";
import { router } from "expo-router";
import * as Haptics from "expo-haptics";
import { useTheme } from "@/theme/useTheme";
import { useTranslate } from "@/i18n";
import { tokens } from "@/theme/tokens";
import { Image } from "expo-image";
import appIcon from "../../assets/images/app-icon.png";
export function T({
  children,
  size = 16,
  muted = false,
  bold = false,
  original = false,
  style,
  ...props
}: TextProps & { size?: number; muted?: boolean; bold?: boolean; original?: boolean }) {
  const c = useTheme();
  const t = useTranslate();
  const parts = Children.toArray(children);
  const text = original ? children : parts.every(
    (part) => typeof part === "string" || typeof part === "number",
  )
    ? t(parts.join(""))
    : parts.map((part) => (typeof part === "string" ? t(part) : part));
  return (
    <Text
      {...props}
      style={[
        {
          fontSize: size,
          lineHeight: size * (size >= 28 ? 1.15 : 1.45),
          color: muted ? c.muted : c.text,
          fontWeight: bold ? "700" : "400",
          letterSpacing: size >= 24 ? -0.9 : 0,
        },
        style,
      ]}
    >
      {text}
    </Text>
  );
}
export function Screen({
  children,
  style,
  footer,
}: PropsWithChildren<{ style?: StyleProp<ViewStyle>; footer?: ReactNode }>) {
  const c = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bg }}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          {
            paddingTop: Math.max(insets.top, 20),
            paddingHorizontal: 20,
            paddingBottom: 32,
            gap: 20,
            width: "100%",
            maxWidth: 600,
            alignSelf: "center",
          },
          style,
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {children}
      </ScrollView>
      {footer ? (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Math.max(insets.bottom, 16),
            borderTopWidth: 1,
            borderColor: c.border,
            backgroundColor: c.bg,
            width: "100%",
            maxWidth: 600,
            alignSelf: "center",
            gap: 8,
          }}
        >
          {footer}
        </View>
      ) : null}
    </View>
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
  const scale = useSharedValue(1);
  const reduce = useReducedMotion();
  const a = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <Animated.View style={a}>
      <Pressable
        accessibilityRole="button"
        disabled={disabled}
        onPressIn={() => {
          if (!reduce) scale.set(withSpring(0.975, tokens.motion.spring));
        }}
        onPressOut={() => {
          scale.set(withSpring(1, tokens.motion.spring));
        }}
        onPress={() => {
          void Haptics.selectionAsync().catch(() => {});
          onPress();
        }}
        style={{
          backgroundColor: secondary ? c.surface : c.primary,
          borderRadius: 999,
          minHeight: 56,
          paddingHorizontal: 18,
          paddingVertical: 15,
          alignItems: "center",
          justifyContent: "center",
          opacity: disabled ? 0.4 : 1,
        }}
      >
        <Row>
          {Icon ? (
            <Icon size={20} color={secondary ? c.text : c.onPrimary} />
          ) : null}
          <T
            bold
            style={{
              color: secondary ? c.text : c.onPrimary,
              textAlign: "center",
            }}
          >
            {label}
          </T>
        </Row>
      </Pressable>
    </Animated.View>
  );
}
export function IconButton({
  icon: Icon,
  label,
  onPress,
  active = false,
}: {
  icon: LucideIcon;
  label: string;
  onPress: () => void;
  active?: boolean;
}) {
  const c = useTheme();
  const t = useTranslate();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t(label)}
      onPress={onPress}
      style={({ pressed }) => ({
        width: 44,
        height: 44,
        borderRadius: 15,
        backgroundColor: active ? c.soft : c.surface,
        alignItems: "center",
        justifyContent: "center",
        opacity: pressed ? 0.6 : 1,
      })}
    >
      <Icon
        size={21}
        color={active ? c.primary : c.text}
        fill={active ? c.primary : "none"}
        strokeWidth={1.8}
      />
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
        paddingHorizontal: 16,
        paddingVertical: 12,
        minHeight: 44,
        borderRadius: 14,
        backgroundColor: selected ? c.soft : c.surface,
        borderWidth: 1,
        borderColor: selected ? c.primary : "transparent",
      }}
    >
      <T
        size={13}
        bold={selected}
        style={{ color: selected ? c.primary : c.text }}
      >
        {label}
      </T>
    </Pressable>
  );
}
export function Field(props: TextInputProps) {
  const c = useTheme();
  const t = useTranslate();
  return (
    <TextInput
      placeholderTextColor={c.muted}
      {...props}
      placeholder={props.placeholder ? t(props.placeholder) : undefined}
      accessibilityLabel={
        props.accessibilityLabel ? t(props.accessibilityLabel) : undefined
      }
      style={[
        {
          borderWidth: 1,
          borderColor: c.border,
          borderRadius: 14,
          minHeight: 52,
          paddingHorizontal: 15,
          paddingVertical: 12,
          color: c.text,
          backgroundColor: c.surface,
          fontSize: 15,
        },
        props.style,
      ]}
    />
  );
}
export function SearchBar(props: TextInputProps) {
  const c = useTheme();
  return (
    <Row
      style={{
        backgroundColor: c.surface,
        borderRadius: 16,
        paddingLeft: 15,
        gap: 4,
      }}
    >
      <Search color={c.muted} size={20} />
      <Field
        {...props}
        style={{ flex: 1, borderWidth: 0, backgroundColor: "transparent" }}
      />
    </Row>
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
      <T bold size={16}>
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
        padding: 18,
        gap: 10,
        borderRadius: 18,
        backgroundColor: c.surface,
      }}
    >
      {children}
    </View>
  );
}
export function Empty({ title, body }: { title: string; body: string }) {
  const c = useTheme();
  return (
    <View style={{ paddingVertical: 36, gap: 12, alignItems: "center" }}>
      <Utensils color={c.primary} size={40} />
      <T bold size={23} style={{ textAlign: "center" }}>
        {title}
      </T>
      <T muted style={{ textAlign: "center", maxWidth: 300 }}>
        {body}
      </T>
    </View>
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
      <Image
        source={appIcon}
        style={{ width: 96, height: 96, borderRadius: 24 }}
      />
      <T size={36} bold>
        COOK
      </T>
      <ActivityIndicator color={c.primary} />
    </View>
  );
}
export function SectionHeader({
  title,
  action,
  onPress,
}: {
  title: string;
  action?: string;
  onPress?: () => void;
}) {
  const c = useTheme();
  return (
    <Row style={{ justifyContent: "space-between" }}>
      <T bold size={21} style={{ flex: 1 }}>
        {title}
      </T>
      {action ? (
        <Pressable
          accessibilityRole="button"
          onPress={onPress}
          style={{ minHeight: 44, justifyContent: "center" }}
        >
          <T bold size={13} style={{ color: c.primary }}>
            {action}
          </T>
        </Pressable>
      ) : null}
    </Row>
  );
}
export function Progress({ value }: { value: number }) {
  const c = useTheme();
  const width = useSharedValue(value);
  const reduced = useReducedMotion();
  useEffect(() => {
    width.value = withTiming(Math.max(0, Math.min(100, value)), {
      duration: reduced ? 0 : 240,
    });
  }, [value, width, reduced]);
  const a = useAnimatedStyle(() => ({
    width: (width.value + "%") as `${number}%`,
  }));
  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: value }}
      style={{
        height: 7,
        backgroundColor: c.border,
        borderRadius: 8,
        overflow: "hidden",
        flex: 1,
      }}
    >
      <Animated.View
        style={[{ height: 7, borderRadius: 8, backgroundColor: c.primary }, a]}
      />
    </View>
  );
}
export function Choice({
  title,
  body,
  selected,
  onPress,
  icon: Icon = Utensils,
}: {
  title: string;
  body?: string;
  selected: boolean;
  onPress: () => void;
  icon?: LucideIcon;
}) {
  const c = useTheme();
  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ checked: selected }}
      aria-checked={selected}
      onPress={() => {
        void Haptics.selectionAsync().catch(() => {});
        onPress();
      }}
      style={{
        padding: 18,
        borderRadius: 18,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? c.primary : c.border,
        backgroundColor: selected ? c.soft : c.surface,
        minHeight: 90,
      }}
    >
      <Row>
        <Icon
          size={30}
          color={selected ? c.primary : c.text}
          strokeWidth={1.6}
        />
        <View style={{ flex: 1, gap: 5 }}>
          <T bold size={17}>
            {title}
          </T>
          {body ? (
            <T muted size={13}>
              {body}
            </T>
          ) : null}
        </View>
        <View
          style={{
            width: 23,
            height: 23,
            borderRadius: 12,
            borderWidth: 1.5,
            borderColor: selected ? c.primary : c.muted,
            backgroundColor: selected ? c.primary : "transparent",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          {selected ? <Check size={15} color={c.onPrimary} /> : null}
        </View>
      </Row>
    </Pressable>
  );
}
