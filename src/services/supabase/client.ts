import "react-native-url-polyfill/auto";
import { createClient, processLock } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const storage = {
  getItem: (k: string) => SecureStore.getItemAsync(k),
  setItem: (k: string, v: string) => SecureStore.setItemAsync(k, v),
  removeItem: (k: string) => SecureStore.deleteItemAsync(k),
};
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          ...(Platform.OS !== "web" ? { storage } : {}),
          autoRefreshToken: true,
          persistSession: Platform.OS !== "web",
          detectSessionInUrl: false,
          lock: processLock,
        },
      })
    : null;
