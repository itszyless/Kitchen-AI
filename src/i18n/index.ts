import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { translate, Language } from "./translate";
export { translate } from "./translate";
export type { Language } from "./translate";

export const useLanguage = create<{
  language: Language;
  setLanguage: (language: Language) => void;
}>()(
  persist(
    (set) => ({ language: "en", setLanguage: (language) => set({ language }) }),
    {
      name: "cook-language",
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
export const useTranslate = () => {
  const language = useLanguage((s) => s.language);
  return (text: string) => translate(text, language);
};
