import AsyncStorage from "@react-native-async-storage/async-storage";
import { z } from "zod";
import { kitchenAI } from "./client";
const result = z.object({ texts: z.array(z.string().max(18000)).max(100) });
const pending = new Map<string, Promise<string[]>>();
export function translateRecipe(id: string, texts: string[]): Promise<string[]> {
  const source = JSON.stringify(texts);
  let hash = 0;
  for (let i = 0; i < source.length; i++) hash = (Math.imul(31, hash) + source.charCodeAt(i)) | 0;
  const key = `cook-translation-de-v1-${id}-${hash}`;
  const existing = pending.get(key);
  if (existing) return existing;
  const operation = (async () => {
    const cached = await AsyncStorage.getItem(key).catch(() => null);
    if (cached) {
      let raw: unknown;
      try { raw = JSON.parse(cached); } catch { raw = null; }
      const parsed = result.safeParse(raw);
      if (parsed.success && parsed.data.texts.length === texts.length) return parsed.data.texts;
    }
    const translated = result.parse(await kitchenAI({ action: "translate", language: "de", texts }));
    if (translated.texts.length !== texts.length) throw new Error("Translation is unavailable. Showing the original recipe.");
    await AsyncStorage.setItem(key, JSON.stringify(translated)).catch(() => {});
    return translated.texts;
  })().finally(() => pending.delete(key));
  pending.set(key, operation);
  return operation;
}
