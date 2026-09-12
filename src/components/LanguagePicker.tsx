import Svg, { Rect, Path } from "react-native-svg";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { Check, ChevronDown } from "lucide-react-native";
import { CookSheet } from "./CookSheet";
import { T } from "./ui";
import { useLanguage, useTranslate } from "@/i18n";
import { useTheme } from "@/theme/useTheme";

function Flag({code}:{code:"en"|"de"}) {
  return <Svg width={22} height={16} viewBox="0 0 60 40">
    {code === "de" ? <><Rect width="60" height="14" fill="#181818" /><Rect y="13" width="60" height="14" fill="#D52430" /><Rect y="26" width="60" height="14" fill="#F4C644" /></> : <><Rect width="60" height="40" fill="#173B79" /><Path d="M0 0L60 40M60 0L0 40" stroke="#fff" strokeWidth="8" /><Path d="M0 0L60 40M60 0L0 40" stroke="#CB283E" strokeWidth="3" /><Path d="M30 0V40M0 20H60" stroke="#fff" strokeWidth="13" /><Path d="M30 0V40M0 20H60" stroke="#CB283E" strokeWidth="7" /></>}
  </Svg>;
}
export function LanguagePicker() {
  const { language, setLanguage } = useLanguage();
  const [open, setOpen] = useState(false);
  const c = useTheme();
  const t = useTranslate();
  return (
    <>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("Choose language")}
        onPress={() => setOpen(true)}
        style={{
          alignSelf: "flex-end",
          flexDirection: "row",
          alignItems: "center",
          gap: 8,
          minHeight: 44,
          paddingHorizontal: 14,
          borderRadius: 24,
          backgroundColor: c.surface,
        }}
      >
        <Flag code={language} /><T size={14}>{language.toUpperCase()}</T>
        <ChevronDown size={14} color={c.text} />
      </Pressable>
      <CookSheet
        visible={open}
        title={t("Language")}
        onClose={() => setOpen(false)}
      >
        {(
          [
            { code: "en", flag: "🇬🇧", name: "English" },
            { code: "de", flag: "🇩🇪", name: "Deutsch" },
          ] as const
        ).map((item) => (
          <Pressable
            key={item.code}
            accessibilityRole="button"
            accessibilityState={{ selected: item.code === language }}
            onPress={() => {
              setLanguage(item.code);
              setOpen(false);
            }}
            style={{
              minHeight: 64,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
              borderBottomWidth: 1,
              borderColor: c.border,
            }}
          >
            <Flag code={item.code} />
            <View style={{ flex: 1 }}>
              <T bold>{item.name}</T>
            </View>
            {item.code === language ? <Check size={22} color={c.text} /> : null}
          </Pressable>
        ))}
      </CookSheet>
    </>
  );
}
