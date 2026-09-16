import type { User } from "@supabase/supabase-js";
export const validUsername = (name: string) =>
  /^[A-Za-z0-9_]{3,20}$/.test(name);
export const needsSocialUsername = (user: User) =>
  !user.user_metadata?.username &&
  ["google", "apple"].includes(user.app_metadata?.provider ?? "");
