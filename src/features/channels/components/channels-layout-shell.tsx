"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { ChannelSidebar } from "@/features/channels/components/channel-sidebar";
import { ChannelsEmptyState } from "@/features/channels/components/channels-empty-state";
import { useChannels } from "@/features/channels/hooks/use-channels";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/store/workspace-store";

export function ChannelsLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ workspaceId: string; channelId?: string }>();
  const workspaceId = params.workspaceId;
  const channelId = params.channelId;
  const router = useRouter();
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const { data: channels, isLoading } = useChannels(workspaceId);

  useEffect(() => {
    setActiveWorkspaceId(workspaceId);
  }, [workspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    if (isLoading || channelId || !channels?.length) return;
    router.replace(ROUTES.workspaceChannel(workspaceId, channels[0].id));
  }, [isLoading, channelId, channels, workspaceId, router]);

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden md:-m-6">
      <ChannelSidebar workspaceId={workspaceId} activeChannelId={channelId} />
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        {children ?? <ChannelsEmptyState workspaceId={workspaceId} />}
      </div>
    </div>
  );
}
