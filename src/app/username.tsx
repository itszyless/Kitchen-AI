import { useState } from "react";
import { Redirect, router } from "expo-router";
import { Screen, T, Field, Button } from "@/components/ui";
import { useAuth } from "@/services/supabase/AuthProvider";
import { supabase } from "@/services/supabase/client";
import { useCook } from "@/state/store";
export default function Username() {
  const { session } = useAuth();
  const onboarded = useCook(s => s.onboarded);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!session) return <Redirect href="/auth" />;
  const valid = /^[A-Za-z0-9_]{3,20}$/.test(name);
  return <Screen style={{ flexGrow: 1 }} footer={<Button label={busy ? "Please wait…" : "Continue"} disabled={!valid || busy} onPress={() => {
    if (!supabase) return;
    setBusy(true); setError("");
    void supabase.auth.updateUser({ data: { username: name } }).then(({ error }) => {
      if (error) setError(error.message);
      else router.replace(onboarded ? "/" : "/onboarding");
    }).catch(() => setError("Could not save. Please try again.")).finally(() => setBusy(false));
  }} />}><T bold size={34}>Create a username</T><T muted>Make your kitchen feel like yours.</T><Field accessibilityLabel="Username" placeholder="Username" value={name} onChangeText={setName} autoCapitalize="none" autoCorrect={false} maxLength={20} /><T muted size={14}>Use 3-20 characters. Letters, numbers and underscores allowed.</T>{error ? <T accessibilityRole="alert">{error}</T> : null}</Screen>;
}
