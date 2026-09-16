import { useState } from "react";
import { Redirect, router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Screen, T, Field, Button, IconButton, Row } from "@/components/ui";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useAuth } from "@/services/supabase/AuthProvider";
import { supabase } from "@/services/supabase/client";
import { needsSocialUsername, validUsername } from "@/domain/account";
export default function Username() {
  const { session } = useAuth();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  if (!session)
    return (
      <Redirect href={{ pathname: "/auth", params: { mode: "register" } }} />
    );
  if (!needsSocialUsername(session.user)) return <Redirect href="/" />;
  const save = async () => {
    if (!supabase) return;
    setBusy(true);
    setError("");
    try {
      const result = await supabase.rpc("claim_username", {
        requested: name.trim(),
      });
      if (result.error)
        throw new Error(
          result.error.code === "23505"
            ? "That username is already taken. Choose another."
            : "Could not save your username. Please try again.",
        );
      const { error: refreshError } = await supabase.auth.refreshSession();
      if (refreshError) throw refreshError;
      router.replace("/");
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Could not save. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  return (
    <Screen
      style={{ flexGrow: 1 }}
      footer={
        <Button
          label={busy ? "Please wait…" : "Let’s go"}
          disabled={!validUsername(name.trim()) || busy}
          onPress={() => void save()}
        />
      }
    >
      <Row style={{ justifyContent: "space-between" }}>
        <IconButton
          icon={ArrowLeft}
          label="Back"
          onPress={() => {
            void supabase?.auth
              .signOut()
              .then(({ error }) => {
                if (error) setError(error.message);
                else
                  router.replace({
                    pathname: "/auth",
                    params: { mode: "register" },
                  });
              })
              .catch(() => setError("Could not sign out. Please try again."));
          }}
        />
        <LanguagePicker compact />
      </Row>
      <T bold size={34}>
        Create a username
      </T>
      <T muted>Make your kitchen feel like yours.</T>
      <Field
        accessibilityLabel="Username"
        placeholder="Username"
        value={name}
        onChangeText={setName}
        autoCapitalize="none"
        autoCorrect={false}
        maxLength={20}
      />
      <T muted size={14}>
        Use 3-20 characters. Letters, numbers and underscores allowed.
      </T>
      {error ? <T accessibilityRole="alert">{error}</T> : null}
    </Screen>
  );
}
