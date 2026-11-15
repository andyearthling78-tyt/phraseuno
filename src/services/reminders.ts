import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
// One quiet local reminder per day. Scheduled on the device; nothing is sent to a server.
export const REMINDER_ID = "phraseuno.daily";
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldShowBanner: true, shouldShowList: true, shouldPlaySound: false, shouldSetBadge: false }),
});
export async function reminderAllowed(ask: boolean) {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!ask || !current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}
let pending: Promise<unknown> = Promise.resolve();
/** Replaces the scheduled reminder. Returns "off" | "scheduled" | "blocked". Calls are serialised. */
export function syncReminder(input: { enabled: boolean; time: string; title: string; body: string }) {
  const run = async () => {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID).catch(() => {});
    if (!input.enabled) return "off" as const;
    if (!(await reminderAllowed(false))) return "blocked" as const;
    // eslint-disable-next-line import/namespace -- the enum is re-exported; the lint resolver cannot see it
    const importance = Notifications.AndroidImportance.DEFAULT;
    if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("daily", { name: "PhraseUNO", importance, sound: null });
    const [hour, minute] = input.time.split(":").map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID, content: { title: input.title, body: input.body, sound: false },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute, channelId: "daily" },
    });
    return "scheduled" as const;
  };
  const result = pending.then(run, run);
  pending = result.catch(() => {});
  return result;
}
