import { createClient } from "npm:@supabase/supabase-js@2.116.0";
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization,x-client-info,apikey,content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
  "Cache-Control": "no-store",
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers });
const hash = async (value: string) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("");
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  try {
    const raw = await req.text();
    if (raw.length > 4096) return reply({ error: "Invalid request" }, 400);
    const { username, password } = JSON.parse(raw);
    if (
      typeof username !== "string" ||
      !/^[A-Za-z0-9_]{3,20}$/.test(username) ||
      typeof password !== "string" ||
      !password ||
      password.length > 1024
    )
      return reply({ error: "Invalid credentials" }, 400);
    const url = Deno.env.get("SUPABASE_URL")!;
    const admin = createClient(
      url,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false, autoRefreshToken: false } },
    );
    // Account and project-wide quotas do not depend on spoofable forwarding headers.
    for (const [bucket, limit] of [
      [await hash(username.toLowerCase()), 10],
      ["global", 1000],
    ] as const) {
      const { data, error } = await admin.rpc("reserve_username_login", {
        bucket_key: bucket,
        maximum: limit,
      });
      if (error || !data)
        return reply({ error: "Please wait before trying again." }, 429);
    }
    const { data: email, error } = await admin.rpc("username_login_email", {
      requested: username,
    });
    if (error) return reply({ error: "Sign-in unavailable" }, 503);
    const auth = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    // Use the same auth path for unknown names; never return a resolved email.
    const result = await auth.auth.signInWithPassword({
      email: email || "unknown-user@invalid.example",
      password,
    });
    if (result.error || !email || !result.data.session)
      return reply({ error: "Invalid credentials" }, 401);
    return reply({
      access_token: result.data.session.access_token,
      refresh_token: result.data.session.refresh_token,
    });
  } catch {
    return reply({ error: "Sign-in unavailable" }, 503);
  }
});
