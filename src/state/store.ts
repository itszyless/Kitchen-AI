import { addHistory, dayKey, FoodHistory } from "@/domain/activity";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLocales } from "expo-localization";
import {
  PantryItem,
  Preferences,
  RecipeIngredient,
  ShoppingItem,
} from "@/domain/types";
import { mergeShopping } from "@/domain/matching";
export const initialPreferences: Preferences = {
  country: getLocales()[0]?.regionCode || "US",
  allergies: [],
  diet: "Anything",
  skill: "Getting started",
  minutes: 30,
  household: 2,
  dislikes: [],
};
type CookState = {
  hydrated: boolean;
  storageError: boolean;
  onboarded: boolean;
  onboardingAnswered: number[];
  answerOnboarding: (step: number, answered?: boolean) => void;
  preferences: Preferences;
  pantry: PantryItem[];
  saved: string[];
  shopping: ShoppingItem[];
  theme: "system" | "light" | "dark";
  completed: number;
  foodHistory: FoodHistory[];
  cookedDays: string[];
  shoppingHintSeen: boolean;
  markShoppingHint: () => void;
  removeShopping: (index: number) => void;
  restoreShopping: (item: ShoppingItem) => void;
  setHydrated: () => void;
  setStorageError: () => void;
  updatePreferences: (p: Partial<Preferences>) => void;
  finishOnboarding: () => void;
  addPantry: (items: PantryItem[]) => void;
  updatePantry: (id: string, p: Partial<PantryItem>) => void;
  removePantry: (id: string) => void;
  toggleSaved: (id: string) => void;
  addShopping: (items: RecipeIngredient[]) => void;
  toggleShopping: (index: number) => void;
  setTheme: (t: CookState["theme"]) => void;
  complete: () => void;
};
export const useCook = create<CookState>()(
  persist(
    (set) => ({
      hydrated: false,
      storageError: false,
      onboarded: false,
      onboardingAnswered: [],
      answerOnboarding: (step, answered = true) =>
        set((s) => ({
          onboardingAnswered: answered
            ? [...new Set([...s.onboardingAnswered, step])]
            : s.onboardingAnswered.filter((value) => value !== step),
        })),
      preferences: initialPreferences,
      pantry: [],
      saved: [],
      shopping: [],
      theme: "light",
      completed: 0,
      foodHistory: [],
      cookedDays: [],
      shoppingHintSeen: false,
      markShoppingHint: () => set({ shoppingHintSeen: true }),
      restoreShopping: (item) =>
        set((s) => ({ shopping: [...s.shopping, item] })),
      removeShopping: (index) =>
        set((s) => ({ shopping: s.shopping.filter((_, n) => n !== index) })),
      setHydrated: () => set({ hydrated: true }),
      setStorageError: () => set({ storageError: true, hydrated: true }),
      updatePreferences: (p) =>
        set((s) => ({ preferences: { ...s.preferences, ...p } })),
      finishOnboarding: () => set({ onboarded: true }),
      addPantry: (items) =>
        set((s) => {
          const pantry = s.pantry.map((i) => ({ ...i }));
          for (const item of items) {
            const old = pantry.find(
              (i) =>
                i.ingredientId === item.ingredientId &&
                i.unit === item.unit &&
                i.expires === item.expires,
            );
            if (old) old.quantity += item.quantity;
            else pantry.push(item);
          }
          return { pantry, foodHistory: addHistory(s.foodHistory, items) };
        }),
      updatePantry: (id, p) =>
        set((s) => ({
          pantry: s.pantry.map((i) =>
            i.id === id ? { ...i, ...p, id: i.id } : i,
          ),
        })),
      removePantry: (id) =>
        set((s) => ({ pantry: s.pantry.filter((i) => i.id !== id) })),
      toggleSaved: (id) =>
        set((s) => ({
          saved: s.saved.includes(id)
            ? s.saved.filter((i) => i !== id)
            : [...s.saved, id],
        })),
      addShopping: (items) =>
        set((s) => ({ shopping: mergeShopping(s.shopping, items) })),
      toggleShopping: (index) =>
        set((s) => ({
          shopping: s.shopping.map((i, n) =>
            n === index ? { ...i, checked: !i.checked } : i,
          ),
        })),
      setTheme: (theme) => set({ theme }),
      complete: () =>
        set((s) => ({
          completed: s.completed + 1,
          cookedDays: [...new Set([...s.cookedDays, dayKey()])],
        })),
    }),
    {
      name: "cook-local-v1",
      // One-time reset of the development test data requested before onboarding QA.
      version: 2,
      migrate: () => ({
        onboarded: false,
        preferences: initialPreferences,
        pantry: [],
        saved: [],
        shopping: [],
        theme: "light" as const,
        completed: 0,
        foodHistory: [],
        cookedDays: [],
        shoppingHintSeen: false,
      }),
      storage: createJSONStorage(() => ({
        getItem: AsyncStorage.getItem,
        setItem: async (k, v) => {
          try {
            await AsyncStorage.setItem(k, v);
          } catch {
            useCook.getState().setStorageError();
          }
        },
        removeItem: AsyncStorage.removeItem,
      })),
      partialize: (s) => ({
        onboarded: s.onboarded,
        onboardingAnswered: s.onboardingAnswered,
        preferences: s.preferences,
        pantry: s.pantry,
        saved: s.saved,
        shopping: s.shopping,
        theme: s.theme,
        completed: s.completed,
        foodHistory: s.foodHistory,
        cookedDays: s.cookedDays,
        shoppingHintSeen: s.shoppingHintSeen,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) useCook.getState().setStorageError();
        else state?.setHydrated();
      },
    },
  ),
);
