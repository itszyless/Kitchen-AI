import { afterEach, expect, it, vi } from "vitest";
import { webcrypto } from "node:crypto";

vi.mock("expo-crypto", () => ({
  CryptoDigestAlgorithm: { SHA256: "SHA-256" },
  digest: (algorithm: string, data: BufferSource) => webcrypto.subtle.digest(algorithm, data),
  getRandomValues: (data: Uint32Array) => webcrypto.getRandomValues(data),
}));
afterEach(() => { vi.unstubAllGlobals(); vi.resetModules(); });

it("provides native S256 hashing matching the RFC 7636 PKCE vector", async () => {
  vi.stubGlobal("crypto", undefined);
  await import("../src/services/supabase/crypto.native");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"));
  expect(Buffer.from(digest).toString("base64url")).toBe("E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM");
  const values = new Uint32Array(32);
  expect(crypto.getRandomValues(values)).toBe(values);
  expect(values.some(value => value !== 0)).toBe(true);
  await expect(crypto.subtle.digest("SHA-1", new Uint8Array())).rejects.toThrow("Unsupported");
});

it("preserves an existing WebCrypto implementation", async () => {
  vi.stubGlobal("crypto", webcrypto);
  await import("../src/services/supabase/crypto.native");
  expect(globalThis.crypto).toBe(webcrypto);
  expect(globalThis.crypto.subtle).toBe(webcrypto.subtle);
});
