import { useEffect, useState } from "react";
import { View } from "react-native";
import { Button, T } from "./ui";
import { useLanguage } from "@/i18n";
import { translateRecipe } from "@/services/ai/translation";

export function useRecipeTranslation(id: string, texts: string[]) {
  const language = useLanguage(s => s.language);
  const [original, setOriginal] = useState(false);
  const [result, setResult] = useState<{ source: string; texts: string[] } | null>(null);
  const [failure, setFailure] = useState<{ source: string; message: string } | null>(null);
  const source = JSON.stringify(texts);
  useEffect(() => {
    if (language === "en" || !id || original) return;
    let active = true;
    void translateRecipe(id, JSON.parse(source)).then(translated => {
      if (active) setResult({ source, texts: translated });
    }).catch(() => {
      if (active) setFailure({ source, message: "Translation is unavailable. Showing the original recipe." });
    });
    return () => { active = false; };
  }, [id, source, language, original]);
  const translated = result?.source === source ? result.texts : null;
  const error = failure?.source === source ? failure.message : "";
  return {
    texts: language === "de" && !original && translated ? translated : texts,
    control: language === "de" ? <View style={{ gap: 8 }}>
      <Button secondary label={original ? "Show translation" : "Show original"} onPress={() => setOriginal(!original)} />
      {!original && !translated ? <T muted size={12}>{error || "Translating recipe…"}</T> : null}
      {!original && translated ? <T muted size={12}>Translated with AI. Check the original if anything is unclear.</T> : null}
    </View> : null,
  };
}
