import { useState } from "react";
import { Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Bell, Timer } from "lucide-react-native";
import { Screen, Back, T, Button, Panel } from "@/components/ui";
import { LanguagePicker } from "@/components/LanguagePicker";
import { useTheme } from "@/theme/useTheme";
import { enableTimerNotifications, scheduleTimerAlert, supportsTimerNotifications } from "@/services/timer-notifications";

export default function NotificationsPage() {
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const [busy, setBusy] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [message, setMessage] = useState("");
  const c = useTheme();
  const finish = () => {
    if (onboarding === "1") router.replace({ pathname: "/auth", params: { mode: "register" } });
    else if (router.canGoBack()) router.back();
    else router.replace("/profile");
  };
  return <Screen footer={<Button label={onboarding === "1" ? "Continue" : "Done"} onPress={finish} disabled={busy} />}>
    <Back title="Notifications" />
    <LanguagePicker compact />
    <View style={{ alignItems: "center", paddingVertical: 28 }}><Bell size={68} color={c.text} /></View>
    <T bold size={34}>A little help when time is up.</T>
    <T muted>Get a cooking timer alert while you're using another app or your phone is locked.</T>
    <Panel><Timer size={24} color={c.text} /><T bold>Cooking timers</T><T>Only timers you start. You can cancel them at any time.</T></Panel>
    {supportsTimerNotifications ? <>
      <Button label={busy ? "Please wait…" : enabled ? "Notifications enabled" : "Enable notifications"} disabled={busy || enabled} onPress={() => {
        setBusy(true);
        void enableTimerNotifications().then(granted => {
          setEnabled(granted);
          setMessage(granted ? "Ready. Try a test alert, then switch away for five seconds." : "Notifications are off. You can continue and enable them later in your phone settings.");
        }).catch(() => setMessage("Couldn't enable notifications. You can continue and try again later.")).finally(() => setBusy(false));
      }} />
      {enabled ? <Button secondary label="Test alert in 5 seconds" disabled={busy} onPress={() => {
        setBusy(true);
        void scheduleTimerAlert(Date.now() + 5000, "Your test alert is ready").then(id => setMessage(id ? "Test scheduled. Switch away now to check delivery." : "Notifications are off. Enable them in your phone settings.")).catch(() => setMessage("Couldn't schedule the test. Please try again.")).finally(() => setBusy(false));
      }} /> : <Button secondary label="Open phone settings" onPress={() => void Linking.openSettings().catch(() => setMessage("Please open notification settings on your phone."))} />}
      <T muted size={12}>In Expo Go, the permission and notification name belong to Expo Go. Your phone's notification and Focus settings affect alerts.</T>
    </> : <T muted>Timer notifications are available in the iPhone and Android app. Browser timers work while the app stays open.</T>}
    {message ? <T accessibilityRole="alert">{message}</T> : null}
    {onboarding === "1" ? <Button secondary label="Not now" onPress={finish} disabled={busy} /> : null}
  </Screen>;
}
