import { useEffect, useState } from "react";
import { AppState, Switch, View } from "react-native";
import { useCook } from "@/state/store";
import { useTheme } from "@/theme/useTheme";
import {
  enableTimerNotifications,
  notificationPermission,
  disableKitchenNotifications,
  supportsTimerNotifications,
} from "@/services/timer-notifications";
import { AppIcon } from "./app-icon";
import { Row, T } from "./ui";
export function NotificationSwitch() {
  const desired = useCook((s) => s.preferences.notificationsEnabled);
  const update = useCook((s) => s.updatePreferences);
  const [granted, setGranted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const c = useTheme();
  useEffect(() => {
    let active = true;
    const refresh = () => {
      void notificationPermission()
        .then((value) => {
          if (active) setGranted(value);
        })
        .catch(() => {
          if (active) setGranted(false);
        });
    };
    refresh();
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });
    return () => {
      active = false;
      sub.remove();
    };
  }, []);
  const enabled = desired !== false && granted;
  const change = async (value: boolean) => {
    setBusy(true);
    setMessage("");
    try {
      if (value) {
        const allowed = await enableTimerNotifications();
        setGranted(allowed);
        update({ notificationsEnabled: allowed });
        if (!allowed)
          setMessage(
            "Allow notifications in your phone settings to turn this on.",
          );
      } else {
        update({ notificationsEnabled: false });
        await disableKitchenNotifications();
      }
    } catch {
      setMessage("Could not update notifications. Please try again.");
    } finally {
      setBusy(false);
    }
  };
  return (
    <View style={{ gap: 9 }}>
      <Row>
        <AppIcon
          name={enabled ? "notificationsOn" : "notificationsOff"}
          size={23}
        />
        <T bold size={15} style={{ flex: 1 }}>
          Notifications
        </T>
        <Switch
          accessibilityLabel="Notifications"
          disabled={busy || !supportsTimerNotifications}
          value={enabled}
          onValueChange={(value) => void change(value)}
          trackColor={{ true: c.primary }}
        />
      </Row>
      <T muted size={12}>
        {supportsTimerNotifications
          ? "Alerts for cooking timers you start."
          : "Available in the iPhone and Android app."}
      </T>
      {message ? (
        <T size={12} accessibilityRole="alert">
          {message}
        </T>
      ) : null}
    </View>
  );
}
