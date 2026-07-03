"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

import { applyDocumentUpdatedToCache } from "@/features/documents/hooks/use-documents";
import { realtimeClient } from "@/services/realtime/websocket-client";
import type { DocumentUpdatedEventData, RealtimeEvent } from "@/types/realtime";

export function useRealtimeDocument(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient();
  const documentIdRef = useRef(documentId);

  useEffect(() => {
    documentIdRef.current = documentId;
  }, [documentId]);

  useEffect(() => {
    if (!workspaceId || !documentId) return;

    void realtimeClient.connect();

    const subscription = {
      roomType: "document" as const,
      roomId: documentId,
      workspaceId,
    };

    realtimeClient.subscribe(subscription);

    const handleEvent = (event: RealtimeEvent) => {
      if (
        event.room_type !== "document" ||
        event.room_id !== documentIdRef.current ||
        event.event !== "document.updated"
      ) {
        return;
      }

      const data = event.data as unknown as DocumentUpdatedEventData;
      applyDocumentUpdatedToCache(
        queryClient,
        workspaceId,
        documentIdRef.current,
        data,
      );
    };

    const removeListener = realtimeClient.addEventListener(handleEvent);

    return () => {
      removeListener();
      realtimeClient.unsubscribe(subscription);
    };
  }, [workspaceId, documentId, queryClient]);
}
