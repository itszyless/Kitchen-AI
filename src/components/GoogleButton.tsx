import { useTranslate } from "@/i18n";
import { Pressable, View } from "react-native";
import { Image } from "expo-image";
import { T } from "./ui";
import googleIcon from "../../assets/images/google-g.png";
export function GoogleButton({
  onPress,
  disabled = false,
}: {
  onPress: () => void;
  disabled?: boolean;
}) {
  const t = useTranslate();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={t("Continue with Google")}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        minHeight: 56,
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#747775",
        borderRadius: 12,
        justifyContent: "center",
        paddingHorizontal: 18,
        opacity: disabled ? 0.45 : pressed ? 0.7 : 1,
      })}
    >
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 12,
        }}
      >
        <Image
          source={googleIcon}
          contentFit="contain"
          style={{ width: 22, height: 22 }}
        />
        <T size={16} style={{ color: "#1F1F1F", fontWeight: "500" }}>
          Continue with Google
        </T>
      </View>
    </Pressable>
  );
}
