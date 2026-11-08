import * as Notifications from "expo-notifications";
import { AndroidImportance, IosAuthorizationStatus } from "expo-notifications";
import { Platform } from "react-native";
import { createReminderQueue, REMINDER_ID } from "./reminder-queue";
Notifications.setNotificationHandler({
  handleNotification: async () => ({ shouldPlaySound: false, shouldSetBadge: false,
    shouldShowBanner: true, shouldShowList: true }),
});
export async function reminderPermission(request = false) {
  if (Platform.OS === "android") await Notifications.setNotificationChannelAsync("learning", {
    name: "PhraseUNO", importance: AndroidImportance.LOW,
    sound: null, enableVibrate: false, showBadge: false,
  });
  let status = await Notifications.getPermissionsAsync();
  if (request && !status.granted && status.canAskAgain) {
    status = await Notifications.requestPermissionsAsync({
      ios: { allowAlert: true, allowBadge: false, allowSound: false },
    });
  }
  return status.granted || status.ios?.status === IosAuthorizationStatus.PROVISIONAL;
}
export const synchronizeReminder = createReminderQueue({
  cancel: () => Notifications.cancelScheduledNotificationAsync(REMINDER_ID),
  allowed: () => reminderPermission(),
  schedule: async ({ time, language }) => {
    const [hour, minute] = time.split(":").map(Number);
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: { title: "PhraseUNO", sound: false,
        body: language === "de" ? "Ein kleiner Moment für dein Spanisch? Dein Lerntag wartet auf dich." : "A little moment for your Spanish? Your learning day is waiting for you.",
        data: { learningReminder: true },
      },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DAILY, hour, minute,
        ...(Platform.OS === "android" ? { channelId: "learning" } : {}) },
    });
  },
});
