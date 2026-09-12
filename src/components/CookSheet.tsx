import { PropsWithChildren } from "react";
import { Modal, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { X } from "lucide-react-native";
import { useTheme } from "@/theme/useTheme";
import { useTranslate } from "@/i18n";
import { IconButton, Row, T } from "./ui";

export function CookSheet({
  visible,
  onClose,
  title,
  children,
}: PropsWithChildren<{
  visible: boolean;
  onClose: () => void;
  title: string;
}>) {
  const c = useTheme();
  const t = useTranslate();
  const insets = useSafeAreaInsets();
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
      navigationBarTranslucent
    >
      <View style={{ flex: 1, justifyContent: "flex-end" }}>
        <Pressable
          accessibilityLabel={t("Close filters")}
          accessibilityRole="button"
          onPress={onClose}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        />
        <View
          accessibilityViewIsModal
          style={{
            backgroundColor: c.bg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 10,
            paddingBottom: Math.max(insets.bottom, 20),
            maxHeight: "85%",
            width: "100%",
            maxWidth: 600,
            alignSelf: "center",
          }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              backgroundColor: c.border,
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 12,
            }}
          />
          <Row style={{ paddingHorizontal: 24, paddingBottom: 16 }}>
            <T bold size={24} style={{ flex: 1 }}>
              {title}
            </T>
            <IconButton icon={X} label={t("Close filters")} onPress={onClose} />
          </Row>
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              paddingHorizontal: 24,
              gap: 20,
              paddingBottom: 8,
            }}
          >
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
