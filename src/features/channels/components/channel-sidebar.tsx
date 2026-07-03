"use client";

import { Hash, Lock } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { CreateChannelDialog } from "@/features/channels/components/create-channel-dialog";
import { useChannels } from "@/features/channels/hooks/use-channels";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";
import type { Channel } from "@/types/channel";

interface ChannelSidebarProps {
  workspaceId: string;
  activeChannelId?: string;
}

function ChannelNavItem({
  channel,
  workspaceId,
  isActive,
}: {
  channel: Channel;
  workspaceId: string;
  isActive: boolean;
}) {
  const Icon = channel.channel_type === "private" ? Lock : Hash;

  return (
    <Link
      href={ROUTES.workspaceChannel(workspaceId, channel.id)}
      className={cn(
        "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        isActive &&
          "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
      )}
    >
      <Icon className="size-4 shrink-0 opacity-70" />
      <span className="truncate">{channel.name}</span>
    </Link>
  );
}

export function ChannelSidebar({
  workspaceId,
  activeChannelId,
}: ChannelSidebarProps) {
  const { data: channels, isLoading } = useChannels(workspaceId);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between border-b px-3 py-3">
        <h2 className="text-sm font-semibold">Channels</h2>
        <CreateChannelDialog
          workspaceId={workspaceId}
          trigger={
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            >
              +
            </button>
          }
        />
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {isLoading &&
          Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}

        {!isLoading && channels?.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted-foreground">
            No channels yet. Create one to start chatting.
          </p>
        )}

        {channels?.map((channel) => (
          <ChannelNavItem
            key={channel.id}
            channel={channel}
            workspaceId={workspaceId}
            isActive={channel.id === activeChannelId}
          />
        ))}
      </nav>
    </aside>
  );
}
