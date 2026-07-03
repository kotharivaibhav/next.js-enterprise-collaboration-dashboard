"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { CHANNEL_QUERY_KEYS } from "@/features/channels/constants/query-keys";
import { realtimeClient } from "@/services/realtime/websocket-client";
import { useTypingStore } from "@/store/typing-store";
import type { Message } from "@/types/channel";
import type {
  MessageCreatedEventData,
  RealtimeEvent,
  TypingEventData,
} from "@/types/realtime";

function upsertMessageInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  channelId: string,
  message: Message,
  parentId?: string | null,
) {
  const queryKey = CHANNEL_QUERY_KEYS.messages(
    workspaceId,
    channelId,
    parentId ?? message.parent_id,
  );

  queryClient.setQueryData(
    queryKey,
    (
      oldData:
        { pages: { items: Message[] }[]; pageParams: unknown[] } | undefined,
    ) => {
      if (!oldData) return oldData;

      const exists = oldData.pages.some((page) =>
        page.items.some((item) => item.id === message.id),
      );
      if (exists) return oldData;

      const [firstPage, ...restPages] = oldData.pages;
      const updatedFirstPage = {
        ...firstPage,
        items: [message, ...firstPage.items],
      };

      return {
        ...oldData,
        pages: [updatedFirstPage, ...restPages],
      };
    },
  );
}

export function useRealtimeChannel(workspaceId: string, channelId: string) {
  const queryClient = useQueryClient();
  const setTyping = useTypingStore((state) => state.setTyping);
  const clearChannel = useTypingStore((state) => state.clearChannel);
  const channelIdRef = useRef(channelId);

  useEffect(() => {
    channelIdRef.current = channelId;
  }, [channelId]);

  useEffect(() => {
    if (!workspaceId || !channelId) return;

    void realtimeClient.connect();

    const subscription = {
      roomType: "channel" as const,
      roomId: channelId,
      workspaceId,
    };

    realtimeClient.subscribe(subscription);

    const handleEvent = (event: RealtimeEvent) => {
      if (
        event.room_type !== "channel" ||
        event.room_id !== channelIdRef.current
      ) {
        return;
      }

      if (event.event === "message.created") {
        const data = event.data as unknown as MessageCreatedEventData;
        const message: Message = {
          id: data.id,
          channel_id: data.channel_id,
          workspace_id: data.workspace_id,
          author_id: data.author_id,
          content: data.content,
          parent_id: data.parent_id,
          metadata: data.metadata ?? {},
          is_edited: false,
          is_deleted: false,
          created_at: data.created_at,
          updated_at: data.created_at,
        };

        upsertMessageInCache(
          queryClient,
          workspaceId,
          channelIdRef.current,
          message,
          message.parent_id,
        );
      }

      if (event.event === "typing") {
        const data = event.data as unknown as TypingEventData;
        setTyping(channelIdRef.current, data.user_id, data.is_typing);
      }
    };

    const removeListener = realtimeClient.addEventListener(handleEvent);

    return () => {
      removeListener();
      realtimeClient.unsubscribe(subscription);
      clearChannel(channelId);
    };
  }, [workspaceId, channelId, queryClient, setTyping, clearChannel]);
}

export function useTypingEmitter(
  workspaceId: string,
  channelId: string,
  isTyping: boolean,
) {
  useEffect(() => {
    if (!workspaceId || !channelId) return;

    realtimeClient.sendTyping(
      { roomType: "channel", roomId: channelId, workspaceId },
      isTyping,
    );
  }, [workspaceId, channelId, isTyping]);
}
