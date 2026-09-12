import { expect, it } from "vitest";
import { chunkedStorage } from "../src/services/supabase/chunkedStorage";
it("roundtrips a large Unicode session and removes its chunks on sign out", async () => {
  const data = new Map<string, string>();
  const secure = { getItemAsync: async (key: string) => data.get(key) ?? null, setItemAsync: async (key: string, value: string) => { expect(new TextEncoder().encode(value).length).toBeLessThan(2000); data.set(key, value); }, deleteItemAsync: async (key: string) => { data.delete(key); } };
  const storage = chunkedStorage(secure);
  const session = JSON.stringify({ token: "token".repeat(1000), name: "🍳".repeat(500) });
  await storage.setItem("session", session);
  expect(await storage.getItem("session")).toBe(session);
  await storage.setItem("session", "replacement");
  expect(data.size).toBe(2);
  expect(await storage.getItem("session")).toBe("replacement");
  await storage.removeItem("session"); expect(data.size).toBe(0);
});
it("keeps the previous session intact if a chunk write fails", async () => {
  const data = new Map<string, string>([["session", "previous"]]);
  const storage = chunkedStorage({ getItemAsync: async key => data.get(key) ?? null, setItemAsync: async (key, value) => { if (key.endsWith(".1")) throw new Error("Storage full"); data.set(key, value); }, deleteItemAsync: async key => { data.delete(key); } });
  await expect(storage.setItem("session", "x".repeat(1000))).rejects.toThrow();
  expect(await storage.getItem("session")).toBe("previous");
  expect(data.size).toBe(1);
});
