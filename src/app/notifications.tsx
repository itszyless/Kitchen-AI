import { useState } from "react";
import { Linking, View } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Screen, Back, T, Button } from "@/components/ui";
import { NotificationSwitch } from "@/components/notification-switch";
import { AppIcon } from "@/components/app-icon";
import { useCook } from "@/state/store";
import {
  scheduleTimerAlert,
  supportsTimerNotifications,
} from "@/services/timer-notifications";
export default function NotificationsPage() {
  const { onboarding } = useLocalSearchParams<{ onboarding?: string }>();
  const enabled = useCook((s) => s.preferences.notificationsEnabled !== false);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const finish = () => {
    if (onboarding === "1")
      router.replace({ pathname: "/auth", params: { mode: "register" } });
    else if (router.canGoBack()) router.back();
    else router.replace("/settings");
  };
  return (
    <Screen
      footer={
        <Button
          label={onboarding === "1" ? "Continue" : "Done"}
          onPress={finish}
          disabled={busy}
        />
      }
    >
      <Back title="Notifications" />
      <View style={{ alignItems: "center", paddingVertical: 35 }}>
        <AppIcon
          name={enabled ? "notificationsOn" : "notificationsOff"}
          size={68}
        />
      </View>
      <T bold size={30}>
        A little help when time is up.
      </T>
      <T muted>
        Get a cooking timer alert while you're using another app or your phone
        is locked.
      </T>
      <NotificationSwitch />
      {supportsTimerNotifications ? (
        <>
          <Button
            secondary
            label="Test alert in 5 seconds"
            disabled={busy || !enabled}
            onPress={() => {
              setBusy(true);
              void scheduleTimerAlert(
                Date.now() + 5000,
                "Your test alert is ready",
                enabled,
              )
                .then((id) =>
                  setMessage(
                    id
                      ? "Test scheduled. Switch away now to check delivery."
                      : "Enable notifications first.",
                  ),
                )
                .catch(() =>
                  setMessage("Could not schedule the test. Try again."),
                )
                .finally(() => setBusy(false));
            }}
          />
          <Button
            secondary
            label="Open phone settings"
            onPress={() =>
              void Linking.openSettings().catch(() =>
                setMessage("Open notification settings on your phone."),
              )
            }
          />
          <T muted size={12}>
            In Expo Go, the permission and notification name belong to Expo Go.
            Your phone’s notification and Focus settings affect alerts.
          </T>
        </>
      ) : null}
      {message ? <T accessibilityRole="alert">{message}</T> : null}
      {onboarding === "1" ? (
        <Button secondary label="Not now" onPress={finish} disabled={busy} />
      ) : null}
    </Screen>
  );
}
