import { beforeEach, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({ getSession: vi.fn(), invoke: vi.fn() }));
vi.mock("@/services/supabase/client", () => ({ supabase: { auth: { getSession: mocks.getSession }, functions: { invoke: mocks.invoke } } }));
import { kitchenAI } from "@/services/ai/client";
beforeEach(() => vi.clearAllMocks());
it.each(["scan", "substitute", "translate"])("blocks guest %s requests before calling the backend", async action => {
  mocks.getSession.mockResolvedValue({ data: { session: null } });
  await expect(kitchenAI({ action })).rejects.toThrow("Please sign in");
  expect(mocks.invoke).not.toHaveBeenCalled();
});
it("allows authenticated scans", async () => {
  mocks.getSession.mockResolvedValue({ data: { session: { user: { id: "test" } } } });
  mocks.invoke.mockResolvedValue({ data: { ingredients: [] }, error: null });
  expect(await kitchenAI({ action: "scan" })).toEqual({ ingredients: [] });
  expect(mocks.invoke).toHaveBeenCalledOnce();
});
