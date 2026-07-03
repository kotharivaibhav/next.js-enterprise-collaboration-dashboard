"use client";

import { MessageSquare } from "lucide-react";

import { CreateChannelDialog } from "@/features/channels/components/create-channel-dialog";

interface ChannelsEmptyStateProps {
  workspaceId: string;
}

export function ChannelsEmptyState({ workspaceId }: ChannelsEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <MessageSquare className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium">No channel selected</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Pick a channel from the sidebar or create a new one to start messaging
        in real time.
      </p>
      <div className="mt-6">
        <CreateChannelDialog workspaceId={workspaceId} />
      </div>
    </div>
  );
}
