"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

import {
  realtimeEventToNotification,
  shouldSkipNotification,
} from "@/features/notifications/utils/notification-events";
import { realtimeClient } from "@/services/realtime/websocket-client";
import { useAuthStore } from "@/store/auth-store";
import { useNotificationStore } from "@/store/notification-store";

export function useNotificationListener() {
  const pathname = usePathname();
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationStore(
    (state) => state.addNotification,
  );

  useEffect(() => {
    void realtimeClient.connect();
  }, []);

  useEffect(() => {
    const unsubscribe = realtimeClient.addEventListener((event) => {
      const authorId =
        event.event === "message.created"
          ? (event.data as { author_id?: string }).author_id
          : event.event === "card.moved"
            ? (event.data as { moved_by?: string }).moved_by
            : event.event === "document.updated"
              ? (event.data as { updated_by?: string }).updated_by
              : undefined;

      if (
        shouldSkipNotification({
          pathname,
          event,
          currentUserId: user?.id,
          authorId,
        })
      ) {
        return;
      }

      const notification = realtimeEventToNotification(event, user?.email);
      if (notification) {
        addNotification(notification);
      }
    });

    return unsubscribe;
  }, [addNotification, pathname, user?.email, user?.id]);
}
