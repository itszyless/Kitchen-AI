import { useCook } from "@/state/store";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useState } from "react";
import { Redirect, useLocalSearchParams } from "expo-router";
import { View, Pressable } from "react-native";
import { Image } from "expo-image";
import { Mail } from "lucide-react-native";
import { GoogleButton } from "@/components/GoogleButton";
import appIcon from "../../assets/images/icons/full/lightmode.png";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import { Screen, T, Button, Field } from "@/components/ui";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/services/supabase/AuthProvider";
WebBrowser.maybeCompleteAuthSession();
export default function Auth() {
  const { session } = useAuth();
  const onboarded = useCook(s => s.onboarded);
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [emailOpen, setEmailOpen] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [register, setRegister] = useState(mode !== "signin");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  if (session) return <Redirect href={session.user.user_metadata?.username ? (onboarded ? "/" : "/onboarding") : "/username"} />;
  const run = async (action: () => Promise<void>) => {
    setBusy(true);
    setMessage("");
    try {
      await action();
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Sign-in failed. Please try again.",
      );
    } finally {
      setBusy(false);
    }
  };
  const social = (provider: "google" | "apple") =>
    run(async () => {
      if (!supabase)
        throw new Error(
          "Sign-in is unavailable right now. Please try again later.",
        );
      const redirectTo = Linking.createURL("auth");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error) throw error;
      if (!data.url)
        throw new Error("The sign-in provider did not return a login page.");
      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        redirectTo,
      );
      if (result.type === "success") {
        const callback = new URL(result.url);
        const code = callback.searchParams.get("code");
        if (!code)
          throw new Error(
            callback.searchParams.get("error_description") ||
              "Sign-in was not completed.",
          );
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
      }
    });
  if (!emailOpen)
    return (
      <Screen
        style={{ flexGrow: 1 }}
        footer={
          <View style={{ gap: 12 }}>
            <GoogleButton
              disabled={busy}
              onPress={() => void social("google")}
            />
            <Button
              label="Continue with email"
              icon={Mail}
              disabled={busy}
              onPress={() => setEmailOpen(true)}
            />
            <Pressable
              accessibilityRole="button"
              onPress={() => {
                setRegister(false);
                setEmailOpen(true);
              }}
              style={{ minHeight: 44, justifyContent: "center" }}
            >
              <T size={14} style={{ textAlign: "center" }}>
                Already have an account? <T bold>Sign in</T>
              </T>
            </Pressable>
            {message ? <T accessibilityRole="alert">{message}</T> : null}
          </View>
        }
      >
        <LanguagePicker />
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            gap: 28,
            paddingVertical: 48,
          }}
        >
          <Image
            source={appIcon}
            style={{ width: 84, height: 84, borderRadius: 22 }}
          />
          <T bold size={36} style={{ textAlign: "center" }}>
            Your kitchen,{String.fromCharCode(10)}your way.
          </T>
          <T muted style={{ textAlign: "center", maxWidth: 270 }}>
            Save your favorites and make something good.
          </T>
        </View>
      </Screen>
    );
  return (
    <Screen style={{ flexGrow: 1, gap: 20 }}>
      <Pressable
        accessibilityRole="button"
        onPress={() => setEmailOpen(false)}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <T>Back</T>
      </Pressable>
      <T bold size={36}>
        {register ? "Create your account" : "Welcome back."}
      </T>
      <T muted>
        {register ? "One account. Your whole kitchen." : "Let’s get cooking."}
      </T>
      <Field
        accessibilityLabel="Email address"
        placeholder="Email address"
        autoCapitalize="none"
        keyboardType="email-address"
        autoComplete="email"
        value={email}
        onChangeText={setEmail}
      />
      <Field
        accessibilityLabel="Password"
        placeholder="Password (at least 8 characters)"
        secureTextEntry
        autoCapitalize="none"
        autoComplete={register ? "new-password" : "current-password"}
        value={password}
        onChangeText={setPassword}
      />
      <Button
        label={busy ? "Please wait…" : register ? "Create account" : "Sign in"}
        disabled={busy || !email.includes("@") || password.length < 8}
        onPress={() =>
          void run(async () => {
            if (!supabase)
              throw new Error(
                "Sign-in is unavailable right now. Please try again later.",
              );
            const { data, error } = register
              ? await supabase.auth.signUp({ email: email.trim(), password })
              : await supabase.auth.signInWithPassword({
                  email: email.trim(),
                  password,
                });
            if (error) throw error;
            if (!data.session)
              setMessage(
                "Check your email to confirm your account, then return here to sign in.",
              );
          })
        }
      />
      <Button
        label={
          register
            ? "Already have an account? Sign in"
            : "New to Kitchen AI? Create account"
        }
        secondary
        disabled={busy}
        onPress={() => setRegister(!register)}
      />
      <T muted style={{ textAlign: "center" }}>OR</T>
      <GoogleButton disabled={busy} onPress={() => void social("google")} />
      {message ? <T accessibilityRole="alert">{message}</T> : null}
    </Screen>
  );
}
