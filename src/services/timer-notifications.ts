import { Platform } from "react-native";

export const supportsTimerNotifications = Platform.OS !== "web";
async function notifications() {
  const api = await import("expo-notifications");
  api.setNotificationHandler({ handleNotification: async () => ({
    shouldShowBanner: true, shouldShowList: true, shouldPlaySound: true, shouldSetBadge: false,
  }) });
  return api;
}
export async function enableTimerNotifications() {
  if (!supportsTimerNotifications) return false;
  const api = await notifications();
  if (Platform.OS === "android") await api.setNotificationChannelAsync("cooking-timers", {
    name: "Cooking timers", importance: api.AndroidImportance.HIGH, sound: "default",
  });
  const current = await api.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await api.requestPermissionsAsync()).granted;
}
export async function scheduleTimerAlert(end: number, title: string): Promise<string | null> {
  if (!supportsTimerNotifications || end <= Date.now()) return null;
  const api = await notifications();
  if (!(await api.getPermissionsAsync()).granted) return null;
  return api.scheduleNotificationAsync({
    content: { title: "Kitchen AI · Timer finished", body: `${title}. Check your food before moving on.`, sound: "default" },
    trigger: { type: api.SchedulableTriggerInputTypes.DATE, date: new Date(end), channelId: "cooking-timers" },
  });
}
export async function cancelTimerAlert(id: string) {
  const api = await notifications();
  await api.cancelScheduledNotificationAsync(id);
}
