import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { AppNotification } from "@/types/notification";

const MAX_NOTIFICATIONS = 50;

interface NotificationState {
  notifications: AppNotification[];
  addNotification: (notification: Omit<AppNotification, "read">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set) => ({
      notifications: [],
      addNotification: (notification) =>
        set((state) => {
          const exists = state.notifications.some(
            (item) => item.id === notification.id,
          );
          if (exists) return state;

          const next = [
            { ...notification, read: false },
            ...state.notifications,
          ];
          return { notifications: next.slice(0, MAX_NOTIFICATIONS) };
        }),
      markAsRead: (id) =>
        set((state) => ({
          notifications: state.notifications.map((item) =>
            item.id === id ? { ...item, read: true } : item,
          ),
        })),
      markAllAsRead: () =>
        set((state) => ({
          notifications: state.notifications.map((item) => ({
            ...item,
            read: true,
          })),
        })),
      clearAll: () => set({ notifications: [] }),
      removeNotification: (id) =>
        set((state) => ({
          notifications: state.notifications.filter((item) => item.id !== id),
        })),
    }),
    { name: "collabforge-notifications" },
  ),
);

export function selectUnreadCount(state: NotificationState): number {
  return state.notifications.filter((item) => !item.read).length;
}
