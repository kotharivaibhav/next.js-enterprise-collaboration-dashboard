"use client";

import { useEffect, useRef } from "react";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { MessageItem } from "@/features/channels/components/message-item";
import {
  flattenMessages,
  useChannelMessages,
} from "@/features/channels/hooks/use-channels";
import type { Message } from "@/types/channel";

interface MessageListProps {
  workspaceId: string;
  channelId: string;
  parentId?: string | null;
  onOpenThread?: (message: Message) => void;
}

export function MessageList({
  workspaceId,
  channelId,
  parentId,
  onOpenThread,
}: MessageListProps) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChannelMessages(workspaceId, channelId, parentId);

  const messages = flattenMessages(data?.pages);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length, channelId, parentId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner label="Loading messages" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-destructive">
        Unable to load messages.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
      <div ref={topRef} className="flex justify-center py-2">
        {hasNextPage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? "Loading..." : "Load older messages"}
          </Button>
        )}
      </div>

      {messages.length === 0 ? (
        <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
          No messages yet. Start the conversation.
        </div>
      ) : (
        <div className="space-y-1 px-2 pb-4">
          {messages.map((message) => (
            <MessageItem
              key={message.id}
              message={message}
              isThread={Boolean(parentId)}
              onOpenThread={onOpenThread}
            />
          ))}
        </div>
      )}

      <div ref={bottomRef} />
    </div>
  );
}
