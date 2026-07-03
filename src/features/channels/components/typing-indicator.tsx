"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/store/auth-store";
import { selectChannelTypers, useTypingStore } from "@/store/typing-store";

interface TypingIndicatorProps {
  channelId: string;
}

export function TypingIndicator({ channelId }: TypingIndicatorProps) {
  const currentUserId = useAuthStore((state) => state.user?.id);
  const pruneExpired = useTypingStore((state) => state.pruneExpired);
  const typingUsers = useTypingStore((state) =>
    selectChannelTypers(state, channelId),
  );

  useEffect(() => {
    pruneExpired();
    const id = window.setInterval(pruneExpired, 1000);
    return () => window.clearInterval(id);
  }, [pruneExpired]);

  const activeTypers = typingUsers.filter(
    (entry) => entry.userId !== currentUserId,
  );

  if (activeTypers.length === 0) return null;

  const label =
    activeTypers.length === 1
      ? "Someone is typing..."
      : `${activeTypers.length} people are typing...`;

  return (
    <p className="px-4 py-1 text-xs text-muted-foreground italic">{label}</p>
  );
}
