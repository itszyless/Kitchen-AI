import * as ExpoCrypto from "expo-crypto";

// Supabase needs these two WebCrypto operations for secure S256 PKCE on native.
const crypto = globalThis.crypto ?? ({} as Crypto);
if (!crypto.getRandomValues) {
  Object.defineProperty(crypto, "getRandomValues", { value: ExpoCrypto.getRandomValues });
}
if (!crypto.subtle) {
  Object.defineProperty(crypto, "subtle", { value: {
    digest: async (algorithm: string | { name: string }, data: BufferSource) => {
      const name = typeof algorithm === "string" ? algorithm : algorithm.name;
      if (name.toUpperCase() !== "SHA-256") throw new Error("Unsupported digest algorithm");
      return ExpoCrypto.digest(ExpoCrypto.CryptoDigestAlgorithm.SHA256, data);
    },
  } });
}
if (!globalThis.crypto) Object.defineProperty(globalThis, "crypto", { value: crypto });
