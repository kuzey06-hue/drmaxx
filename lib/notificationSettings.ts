import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";

export type NotificationSettings = {
  emailNotif: boolean;
  smsNotif: boolean;
  orderNotif: boolean;
  reviewNotif: boolean;
  lowStockNotif: boolean;
  failedPaymentNotif: boolean;
  notificationEmail: string;
  orderNotificationEmails: string[];
};

export const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotif: true,
  smsNotif: true,
  orderNotif: true,
  reviewNotif: true,
  lowStockNotif: true,
  failedPaymentNotif: true,
  notificationEmail: "admin@drmaxx.com.tr",
  orderNotificationEmails: ["admin@drmaxx.com.tr"],
};

export async function readNotificationSettings() {
  return readCmsContent<NotificationSettings>(
    "notification_settings",
    DEFAULT_NOTIFICATION_SETTINGS,
  );
}

export async function writeNotificationSettings(settings: Partial<NotificationSettings>) {
  const current = await readNotificationSettings();
  await writeCmsContent("notification_settings", { ...current, ...settings });
}
