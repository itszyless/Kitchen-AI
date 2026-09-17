import { beforeEach, expect, it, vi } from "vitest";
const api = vi.hoisted(() => ({
  getPermissionsAsync: vi.fn(), requestPermissionsAsync: vi.fn(),
  scheduleNotificationAsync: vi.fn(), cancelScheduledNotificationAsync: vi.fn(),
  setNotificationHandler: vi.fn(), setNotificationChannelAsync: vi.fn(),
  SchedulableTriggerInputTypes: { DATE: "date" }, AndroidImportance: { HIGH: 4 },
}));
vi.mock("react-native", () => ({ Platform: { OS: "ios" } }));
vi.mock("expo-notifications", () => api);
import { enableTimerNotifications, scheduleTimerAlert, cancelTimerAlert } from "@/services/timer-notifications";
beforeEach(() => vi.resetAllMocks());
it("does not schedule an alert without permission or request permission during cooking", async () => {
  api.getPermissionsAsync.mockResolvedValue({ granted: false });
  expect(await scheduleTimerAlert(Date.now() + 10000, "Pasta")).toBeNull();
  expect(api.scheduleNotificationAsync).not.toHaveBeenCalled();
  expect(api.requestPermissionsAsync).not.toHaveBeenCalled();
});
it("does not repeat a denied permission request when the OS disallows asking", async () => {
  api.getPermissionsAsync.mockResolvedValue({ granted: false, canAskAgain: false });
  expect(await enableTimerNotifications()).toBe(false);
  expect(api.requestPermissionsAsync).not.toHaveBeenCalled();
});
it("schedules an absolute deadline and cancels only its own notification", async () => {
  api.getPermissionsAsync.mockResolvedValue({ granted: true });
  api.scheduleNotificationAsync.mockResolvedValue("timer-123");
  const end = Date.now() + 10000;
  expect(await scheduleTimerAlert(end, "Pasta")).toBe("timer-123");
  expect(api.scheduleNotificationAsync).toHaveBeenCalledWith(expect.objectContaining({ trigger: expect.objectContaining({ date: new Date(end) }) }));
  await cancelTimerAlert("timer-123");
  expect(api.cancelScheduledNotificationAsync).toHaveBeenCalledWith("timer-123");
});
it("does not schedule an expired timer", async () => {
  expect(await scheduleTimerAlert(Date.now() - 1, "Pasta")).toBeNull();
  expect(api.scheduleNotificationAsync).not.toHaveBeenCalled();
});
