import { Platform } from "react-native";

export const supportsTimerNotifications = Platform.OS !== "web";
async function notifications() {
  const api = await import("expo-notifications");
  api.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  return api;
}
export async function enableTimerNotifications() {
  if (!supportsTimerNotifications) return false;
  const api = await notifications();
  if (Platform.OS === "android")
    await api.setNotificationChannelAsync("cooking-timers", {
      name: "Cooking timers",
      importance: api.AndroidImportance.HIGH,
      sound: "default",
    });
  const current = await api.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await api.requestPermissionsAsync()).granted;
}
export async function notificationPermission() {
  if (!supportsTimerNotifications) return false;
  return (await (await notifications()).getPermissionsAsync()).granted;
}
export async function disableKitchenNotifications() {
  if (!supportsTimerNotifications) return;
  const api = await notifications();
  const scheduled = await api.getAllScheduledNotificationsAsync();
  await Promise.all(
    scheduled
      .filter(
        (item) =>
          item.content.data?.owner === "kitchen-ai-timer" ||
          item.content.title === "Kitchen AI · Timer finished",
      )
      .map((item) => api.cancelScheduledNotificationAsync(item.identifier)),
  );
}
export async function scheduleTimerAlert(
  end: number,
  title: string,
  enabled = true,
): Promise<string | null> {
  if (!enabled || !supportsTimerNotifications || end <= Date.now()) return null;
  const api = await notifications();
  if (!(await api.getPermissionsAsync()).granted) return null;
  return api.scheduleNotificationAsync({
    content: {
      title: "Kitchen AI · Timer finished",
      body: `${title}. Check your food before moving on.`,
      sound: "default",
      data: { owner: "kitchen-ai-timer" },
    },
    trigger: {
      type: api.SchedulableTriggerInputTypes.DATE,
      date: new Date(end),
      channelId: "cooking-timers",
    },
  });
}
export async function cancelTimerAlert(id: string) {
  const api = await notifications();
  await api.cancelScheduledNotificationAsync(id);
}
