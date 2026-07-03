"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { applyCardMovedToCache } from "@/features/boards/hooks/use-boards";
import { realtimeClient } from "@/services/realtime/websocket-client";
import type { CardMovedEventData, RealtimeEvent } from "@/types/realtime";

export function useRealtimeBoard(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();
  const boardIdRef = useRef(boardId);

  useEffect(() => {
    boardIdRef.current = boardId;
  }, [boardId]);

  useEffect(() => {
    if (!workspaceId || !boardId) return;

    void realtimeClient.connect();

    const subscription = {
      roomType: "board" as const,
      roomId: boardId,
      workspaceId,
    };

    realtimeClient.subscribe(subscription);

    const handleEvent = (event: RealtimeEvent) => {
      if (
        event.room_type !== "board" ||
        event.room_id !== boardIdRef.current ||
        event.event !== "card.moved"
      ) {
        return;
      }

      const data = event.data as unknown as CardMovedEventData;
      applyCardMovedToCache(queryClient, workspaceId, boardIdRef.current, data);
    };

    const removeListener = realtimeClient.addEventListener(handleEvent);

    return () => {
      removeListener();
      realtimeClient.unsubscribe(subscription);
    };
  }, [workspaceId, boardId, queryClient]);
}
