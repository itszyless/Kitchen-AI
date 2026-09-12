import { supabase } from "@/services/supabase/client";
export async function kitchenAI(body: Record<string, unknown>) {
  if (!supabase)
    throw new Error(
      "Scanning is unavailable right now. Please try again later.",
    );
  const { data, error } = await supabase.functions.invoke("kitchen-ai", {
    body,
  });
  if (error) {
    let message =
      "AI is unavailable right now. You can still add items manually.";
    if (error.context instanceof Response) {
      const payload = await error.context.json().catch(() => null);
      if (typeof payload?.error === "string") message = payload.error;
    }
    throw new Error(message);
  }
  return data;
}
