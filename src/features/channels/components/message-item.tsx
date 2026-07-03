"use client";

import { useAuthStore } from "@/store/auth-store";
import type { Message } from "@/types/channel";
import { cn } from "@/lib/utils";

interface MessageItemProps {
  message: Message;
  isThread?: boolean;
  onOpenThread?: (message: Message) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function MessageItem({
  message,
  isThread = false,
  onOpenThread,
}: MessageItemProps) {
  const currentUser = useAuthStore((state) => state.user);
  const isOwn = currentUser?.id === message.author_id;
  const authorLabel =
    message.author_id === currentUser?.id
      ? "You"
      : `${message.author_id.slice(0, 8)}…`;

  return (
    <article
      className={cn(
        "group flex gap-3 rounded-lg px-3 py-2 hover:bg-muted/50",
        isOwn && "bg-muted/30",
      )}
    >
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-medium",
          isOwn ? "bg-primary text-primary-foreground" : "bg-muted",
        )}
      >
        {authorLabel.charAt(0).toUpperCase()}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{authorLabel}</span>
          <time className="text-xs text-muted-foreground">
            {formatTime(message.created_at)}
          </time>
        </div>
        <p className="mt-0.5 whitespace-pre-wrap break-words text-sm">
          {message.content}
        </p>
        {!isThread && onOpenThread && (
          <button
            type="button"
            onClick={() => onOpenThread(message)}
            className="mt-1 text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 hover:text-foreground"
          >
            Reply in thread
          </button>
        )}
      </div>
    </article>
  );
}
