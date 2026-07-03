"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MessageComposer } from "@/features/channels/components/message-composer";
import { MessageList } from "@/features/channels/components/message-list";
import { useRealtimeChannel } from "@/features/channels/hooks/use-realtime-channel";
import type { Message } from "@/types/channel";

interface ThreadSheetProps {
  workspaceId: string;
  channelId: string;
  rootMessage: Message | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ThreadSheet({
  workspaceId,
  channelId,
  rootMessage,
  open,
  onOpenChange,
}: ThreadSheetProps) {
  useRealtimeChannel(workspaceId, channelId);

  if (!rootMessage) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b px-4 py-3">
          <div className="flex items-center justify-between">
            <SheetTitle>Thread</SheetTitle>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => onOpenChange(false)}
            >
              <X className="size-4" />
            </Button>
          </div>
          <p className="text-left text-sm text-muted-foreground">
            {rootMessage.content}
          </p>
        </SheetHeader>

        <div className="flex min-h-0 flex-1 flex-col">
          <MessageList
            workspaceId={workspaceId}
            channelId={channelId}
            parentId={rootMessage.id}
          />
          <MessageComposer
            workspaceId={workspaceId}
            channelId={channelId}
            parentId={rootMessage.id}
            placeholder="Reply in thread"
          />
        </div>
      </SheetContent>
    </Sheet>
  );
}
