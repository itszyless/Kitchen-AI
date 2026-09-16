import { useState } from "react";
import { Redirect, router, useLocalSearchParams } from "expo-router";
import { View, Pressable } from "react-native";
import { ArrowLeft } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import {
  Screen,
  T,
  Button,
  Field,
  IconButton,
  Row,
  Loading,
} from "@/components/ui";
import { LanguagePicker } from "@/components/LanguagePicker";
import { GoogleButton } from "@/components/GoogleButton";
import { supabase } from "@/services/supabase/client";
import { useAuth } from "@/services/supabase/AuthProvider";
import { useCook } from "@/state/store";
import { needsSocialUsername, validUsername } from "@/domain/account";
import { useTheme } from "@/theme/useTheme";

WebBrowser.maybeCompleteAuthSession();
export default function Auth() {
  const { session, ready } = useAuth();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const [register, setRegister] = useState(mode === "register");
  const [identifier, setIdentifier] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const c = useTheme();
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
  if (!ready) return <Loading />;
  if (session && !busy)
    return (
      <Redirect href={needsSocialUsername(session.user) ? "/username" : "/"} />
    );
  const enter = () => useCook.getState().finishOnboarding();
  const social = () =>
    run(async () => {
      if (!supabase)
        throw new Error(
          "Sign-in is unavailable right now. Please try again later.",
        );
      const redirectTo = Linking.createURL("auth");
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
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
        enter();
      }
    });
  const submit = () =>
    run(async () => {
      if (!supabase)
        throw new Error(
          "Sign-in is unavailable right now. Please try again later.",
        );
      if (register) {
        const { data: available, error: checkError } = await supabase.rpc(
          "username_available",
          { requested: username.trim() },
        );
        if (checkError)
          throw new Error("Could not check your username. Please try again.");
        if (!available)
          throw new Error("That username is already taken. Choose another.");
        const { data, error } = await supabase.auth.signUp({
          email: identifier.trim(),
          password,
          options: { data: { username: username.trim() } },
        });
        if (error)
          throw new Error(
            error.message.includes("Database error")
              ? "Could not create the account. Your username may have just been taken; choose another and retry."
              : error.message,
          );
        if (data.session) enter();
        else {
          setRegister(false);
          setMessage(
            "Check your email to confirm your account, then return here to sign in.",
          );
        }
      } else if (identifier.includes("@")) {
        const { error } = await supabase.auth.signInWithPassword({
          email: identifier.trim(),
          password,
        });
        if (error)
          throw new Error(
            "Could not sign in. Check your email or username and password.",
          );
        enter();
      } else {
        const { data, error } = await supabase.functions.invoke(
          "username-login",
          { body: { username: identifier.trim(), password } },
        );
        if (error || !data?.access_token || !data?.refresh_token)
          throw new Error(
            "Could not sign in. Check your email or username and password, or try your email address.",
          );
        const { error: sessionError } = await supabase.auth.setSession(data);
        if (sessionError) throw sessionError;
        enter();
      }
    });
  const valid = register
    ? validUsername(username.trim()) &&
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier.trim()) &&
      password.length >= 8
    : Boolean(identifier.trim()) && password.length > 0;
  return (
    <Screen style={{ flexGrow: 1, gap: 22 }}>
      <Row style={{ justifyContent: "space-between" }}>
        <IconButton
          icon={ArrowLeft}
          label="Back"
          onPress={() => {
            if (router.canGoBack()) router.back();
            else router.replace("/onboarding");
          }}
        />
        <LanguagePicker compact />
      </Row>
      <T bold size={34}>
        {register ? "Create your account" : "Welcome back."}
      </T>
      <T muted>
        {register
          ? "Save your preferences and make this kitchen yours."
          : "Sign in to your Kitchen AI account."}
      </T>
      <View style={{ gap: 14, paddingTop: 16 }}>
        {register ? (
          <>
            <Field
              accessibilityLabel="Username"
              placeholder="Username"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
            />
            <T muted size={13}>
              Use 3-20 characters. Letters, numbers and underscores allowed.
            </T>
          </>
        ) : null}
        <Field
          accessibilityLabel={register ? "Email address" : "Username or email"}
          placeholder={register ? "Email address" : "Username or email"}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType={register ? "email-address" : "default"}
          autoComplete={register ? "email" : "username"}
        />
        <Field
          accessibilityLabel="Password"
          placeholder={
            register ? "Password (at least 8 characters)" : "Password"
          }
          secureTextEntry
          value={password}
          onChangeText={setPassword}
          autoCapitalize="none"
          autoComplete={register ? "new-password" : "current-password"}
          onSubmitEditing={() => {
            if (valid && !busy) void submit();
          }}
        />
        {message ? (
          <T accessibilityRole="alert" selectable>
            {message}
          </T>
        ) : null}
        <Button
          label={
            busy ? "Please wait…" : register ? "Create account" : "Sign in"
          }
          disabled={busy || !valid}
          onPress={() => void submit()}
        />
      </View>
      <Row>
        <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
        <T muted size={14}>
          OR
        </T>
        <View style={{ flex: 1, height: 1, backgroundColor: c.border }} />
      </Row>
      <GoogleButton disabled={busy} onPress={() => void social()} />
      <Pressable
        accessibilityRole="button"
        disabled={busy}
        onPress={() => {
          setMessage("");
          if (!register) router.replace("/onboarding");
          else setRegister(false);
        }}
        style={{ minHeight: 44, justifyContent: "center" }}
      >
        <T size={14} style={{ textAlign: "center" }}>
          {register ? "Already have an account? " : "New to Kitchen AI? "}
          <T size={14} bold>
            {register ? "Sign in" : "Get started"}
          </T>
        </T>
      </Pressable>
    </Screen>
  );
}
