import { expect, it } from "vitest";
import { validUsername, needsSocialUsername } from "@/domain/account";
import type { User } from "@supabase/supabase-js";
it("validates username characters and length", () => {
  for (const value of ["ab", "a b", "a@b", "x".repeat(21)])
    expect(validUsername(value)).toBe(false);
  expect(validUsername("Chef_123")).toBe(true);
});
it("does not send existing email users to social username setup", () => {
  const user = (provider: string, username?: string) =>
    ({ app_metadata: { provider }, user_metadata: { username } }) as unknown as User;
  expect(needsSocialUsername(user("email"))).toBe(false);
  expect(needsSocialUsername(user("google"))).toBe(true);
  expect(needsSocialUsername(user("google", "Chef"))).toBe(false);
});
