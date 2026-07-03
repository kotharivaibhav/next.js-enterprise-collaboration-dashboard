"use client";

import { Hash, Lock, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  useChannelPermissions,
  useDeleteChannel,
} from "@/features/channels/hooks/use-channels";
import type { Channel } from "@/types/channel";

interface ChannelHeaderProps {
  workspaceId: string;
  channel: Channel;
}

export function ChannelHeader({ workspaceId, channel }: ChannelHeaderProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const permissions = useChannelPermissions(workspaceId, channel.id);
  const deleteChannel = useDeleteChannel(workspaceId);
  const Icon = channel.channel_type === "private" ? Lock : Hash;

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex min-w-0 items-center gap-2">
        <Icon className="size-4 shrink-0 text-muted-foreground" />
        <h1 className="truncate font-semibold">{channel.name}</h1>
        <Badge variant="secondary" className="hidden sm:inline-flex">
          {channel.channel_type}
        </Badge>
      </div>

      {permissions.canDelete && (
        <>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="ghost" size="icon-sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-4" />
                Delete channel
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete #{channel.name}?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will deactivate the channel. Messages will no longer be
                  accessible via the API.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  variant="destructive"
                  disabled={deleteChannel.isPending}
                  onClick={async () => {
                    await deleteChannel.mutateAsync(channel.id);
                    setDeleteOpen(false);
                  }}
                >
                  {deleteChannel.isPending ? "Deleting..." : "Delete"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </>
      )}
    </header>
  );
}
