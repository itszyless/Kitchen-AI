import { describe, it, expect, vi } from "vitest";
import { reuseSubstitution } from "../src/services/ai/request-cache";
describe("substitution requests", () => {
  it("shares concurrent checks and recently completed results", async () => {
    const run = vi.fn(async () => ({ suggestions: [] }));
    const [a, b] = await Promise.all([reuseSubstitution("same", run), reuseSubstitution("same", run)]);
    expect(a).toBe(b);
    await reuseSubstitution("same", run);
    expect(run).toHaveBeenCalledTimes(1);
  });
  it("does not cache failures and permits retry", async () => {
    await expect(reuseSubstitution("retry", async () => { throw new Error("offline"); })).rejects.toThrow("offline");
    await expect(reuseSubstitution("retry", async () => "ok")).resolves.toBe("ok");
  });
  it("keeps distinct account and pantry contexts separate", async () => {
    await expect(reuseSubstitution("user-a:pantry-a", async () => "a")).resolves.toBe("a");
    await expect(reuseSubstitution("user-b:pantry-a", async () => "b")).resolves.toBe("b");
    await expect(reuseSubstitution("user-a:pantry-b", async () => "c")).resolves.toBe("c");
  });
  it("refreshes expired results", async () => {
    const now = vi.spyOn(Date, "now").mockReturnValue(1000);
    try {
      await reuseSubstitution("expiry", async () => "old");
      now.mockReturnValue(301001);
      await expect(reuseSubstitution("expiry", async () => "new")).resolves.toBe("new");
    } finally { now.mockRestore(); }
  });
});
