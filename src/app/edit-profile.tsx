import { useState } from "react";
import { Redirect, router } from "expo-router";
import { Screen, Back, T, Field, Button, Loading } from "@/components/ui";
import { useAuth } from "@/services/supabase/AuthProvider";
import { supabase } from "@/services/supabase/client";
import { validUsername } from "@/domain/account";
import { CountryPicker } from "@/components/country-picker";
import { useCook } from "@/state/store";
export default function EditProfile() {
  const { session, ready } = useAuth();
  const [username, setUsername] = useState(
    session?.user.user_metadata?.username ?? "",
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const country = useCook((s) => s.preferences.country);
  const update = useCook((s) => s.updatePreferences);
  if (!ready) return <Loading />;
  if (!session)
    return (
      <Redirect href={{ pathname: "/auth", params: { mode: "signin" } }} />
    );
  const save = async () => {
    if (!supabase || busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await supabase.rpc("claim_username", {
        requested: username.trim(),
      });
      if (result.error)
        throw new Error(
          result.error.code === "23505"
            ? "That username is already taken."
            : "Could not save your username. Try again.",
        );
      const refreshed = await supabase.auth.refreshSession();
      if (refreshed.error) throw refreshed.error;
      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save. Try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      footer={
        <Button
          label={busy ? "Saving…" : "Save profile"}
          disabled={busy || !validUsername(username.trim())}
          onPress={() => void save()}
        />
      }
    >
      <Back title="Edit profile" />
      <T size={28} bold>
        Make it yours.
      </T>
      <T bold size={14}>
        Username
      </T>
      <Field
        accessibilityLabel="Username"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
      />
      <T muted size={12}>
        3–20 letters, numbers or underscores. Each username is unique.
      </T>
      <T bold size={14}>
        Email
      </T>
      <T original muted>
        {session.user.email}
      </T>
      <T bold size={14}>
        Country & product region
      </T>
      <CountryPicker
        value={country}
        onChange={(value) => update({ country: value })}
      />
      <Button
        secondary
        label="Privacy & preferences"
        onPress={() => router.push("/settings")}
      />
      {error ? <T accessibilityRole="alert">{error}</T> : null}
    </Screen>
  );
}
