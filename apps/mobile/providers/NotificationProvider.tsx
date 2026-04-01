import * as Notifications from "expo-notifications";
import { useEffect, type ReactNode } from "react";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void Notifications.requestPermissionsAsync();
  }, []);

  return <>{children}</>;
}

// Utility: schedule a local notification when countdown ends
export async function scheduleCountdownEndNotification(subjectName: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "专注完成 🎉",
      body: `「${subjectName}」时间到！`,
    },
    trigger: null, // fire immediately
  });
}
