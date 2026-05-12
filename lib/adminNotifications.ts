import { readCmsContent, writeCmsContent } from "@/lib/cmsStore";
import { readNotificationSettings } from "@/lib/notificationSettings";

export type AdminNotificationType =
  | "new_order"
  | "new_review"
  | "low_stock"
  | "failed_payment"
  | "system";

export type AdminNotification = {
  id: string;
  type: AdminNotificationType;
  title: string;
  message: string;
  href?: string;
  read: boolean;
  createdAt: string;
};

const KEY = "admin_notifications";

const typeEnabledKey: Record<AdminNotificationType, keyof Awaited<ReturnType<typeof readNotificationSettings>> | null> = {
  new_order: "orderNotif",
  new_review: "reviewNotif",
  low_stock: "lowStockNotif",
  failed_payment: "failedPaymentNotif",
  system: null,
};

export async function readAdminNotifications() {
  return readCmsContent<AdminNotification[]>(KEY, []);
}

export async function writeAdminNotifications(items: AdminNotification[]) {
  await writeCmsContent(KEY, items.slice(0, 100));
}

export async function createAdminNotification(input: Omit<AdminNotification, "id" | "read" | "createdAt">) {
  const settings = await readNotificationSettings();
  const enabledKey = typeEnabledKey[input.type];
  if (enabledKey && !settings[enabledKey]) return;

  const items = await readAdminNotifications();
  const next: AdminNotification = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    read: false,
    createdAt: new Date().toISOString(),
    ...input,
  };

  await writeAdminNotifications([next, ...items]);
}
