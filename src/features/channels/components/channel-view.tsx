"use client";

import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { ChannelHeader } from "@/features/channels/components/channel-header";
import { MessageComposer } from "@/features/channels/components/message-composer";
import { MessageList } from "@/features/channels/components/message-list";
import { ThreadSheet } from "@/features/channels/components/thread-sheet";
import { TypingIndicator } from "@/features/channels/components/typing-indicator";
import {
  useChannel,
  useChannels,
} from "@/features/channels/hooks/use-channels";
import { useRealtimeChannel } from "@/features/channels/hooks/use-realtime-channel";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/store/workspace-store";
import type { Message } from "@/types/channel";
import { useRouter } from "next/navigation";

interface ChannelViewProps {
  workspaceId: string;
  channelId: string;
}

export function ChannelView({ workspaceId, channelId }: ChannelViewProps) {
  const router = useRouter();
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const {
    data: channel,
    isLoading,
    isError,
  } = useChannel(workspaceId, channelId);
  const { data: channels } = useChannels(workspaceId);
  const [threadRoot, setThreadRoot] = useState<Message | null>(null);
  const [threadOpen, setThreadOpen] = useState(false);

  useRealtimeChannel(workspaceId, channelId);

  useEffect(() => {
    setActiveWorkspaceId(workspaceId);
  }, [workspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    if (!channels?.length) return;
    const exists = channels.some((item) => item.id === channelId);
    if (!exists && channels[0]) {
      router.replace(ROUTES.workspaceChannel(workspaceId, channels[0].id));
    }
  }, [channels, channelId, workspaceId, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner label="Loading channel" />
      </div>
    );
  }

  if (isError || !channel) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-destructive">
        Channel not found or you do not have access.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ChannelHeader workspaceId={workspaceId} channel={channel} />
      <MessageList
        workspaceId={workspaceId}
        channelId={channelId}
        onOpenThread={(message) => {
          setThreadRoot(message);
          setThreadOpen(true);
        }}
      />
      <TypingIndicator channelId={channelId} />
      <MessageComposer
        workspaceId={workspaceId}
        channelId={channelId}
        placeholder={`Message #${channel.name}`}
      />
      <ThreadSheet
        workspaceId={workspaceId}
        channelId={channelId}
        rootMessage={threadRoot}
        open={threadOpen}
        onOpenChange={setThreadOpen}
      />
    </div>
  );
}
