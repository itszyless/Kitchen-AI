type SecureStorage = {
  getItemAsync: (key: string) => Promise<string | null>;
  setItemAsync: (key: string, value: string) => Promise<void>;
  deleteItemAsync: (key: string) => Promise<void>;
};
type Manifest = { generation: string; count: number };
const parse = (value: string | null): Manifest | null => {
  if (!value?.startsWith("chunks:")) return null;
  try {
    const data = JSON.parse(value.slice(7));
    return typeof data.generation === "string" && /^[a-z0-9-]+$/.test(data.generation) && Number.isInteger(data.count) && data.count > 0 && data.count <= 100 ? data : null;
  } catch { return null; }
};
// Write the manifest last so interrupted writes never expose a partial session.
export function chunkedStorage(secure: SecureStorage) {
  const keyFor = (key: string, m: Manifest, index: number) => `${key}.${m.generation}.${index}`;
  const clear = async (key: string, m: Manifest | null) => {
    if (m) await Promise.all(Array.from({ length: m.count }, (_, i) => secure.deleteItemAsync(keyFor(key, m, i))));
  };
  return {
    async getItem(key: string) {
      const raw = await secure.getItemAsync(key);
      const manifest = parse(raw);
      if (!manifest) return raw?.startsWith("chunks:") ? null : raw;
      const chunks = await Promise.all(Array.from({ length: manifest.count }, (_, i) => secure.getItemAsync(keyFor(key, manifest, i))));
      return chunks.some(chunk => chunk === null) ? null : chunks.join("");
    },
    async setItem(key: string, value: string) {
      const previous = parse(await secure.getItemAsync(key));
      // Split by Unicode code points so emoji pairs stay intact across native storage.
      const points = Array.from(value);
      const chunks: string[] = [];
      for (let i = 0; i < points.length; i += 400) chunks.push(points.slice(i, i + 400).join(""));
      if (!chunks.length) chunks.push("");
      if (chunks.length > 100) throw new Error("Session is too large to save securely.");
      const manifest = { generation: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`, count: chunks.length };
      try {
        const writes = await Promise.allSettled(chunks.map((chunk, i) => secure.setItemAsync(keyFor(key, manifest, i), chunk)));
        const failed = writes.find(write => write.status === "rejected");
        if (failed?.status === "rejected") throw failed.reason;
        await secure.setItemAsync(key, "chunks:" + JSON.stringify(manifest));
      } catch (error) { await clear(key, manifest).catch(() => {}); throw error; }
      await clear(key, previous).catch(() => {});
    },
    async removeItem(key: string) {
      const previous = parse(await secure.getItemAsync(key));
      await secure.deleteItemAsync(key);
      await clear(key, previous);
    },
  };
}
