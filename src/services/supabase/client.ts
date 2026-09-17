import "./crypto";
import { chunkedStorage } from "./chunkedStorage";
import "react-native-url-polyfill/auto";
import { createClient } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const storage = chunkedStorage(SecureStore);
export const supabase =
  url && key
    ? createClient(url, key, {
        auth: {
          flowType: "pkce",
          storage: Platform.OS === "web" ? AsyncStorage : storage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: false,
        },
      })
    : null;
