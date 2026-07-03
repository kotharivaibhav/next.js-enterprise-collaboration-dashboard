import { create } from "zustand";

interface TypingUser {
  userId: string;
  expiresAt: number;
}

interface TypingState {
  typingByChannel: Record<string, TypingUser[]>;
  setTyping: (channelId: string, userId: string, isTyping: boolean) => void;
  clearChannel: (channelId: string) => void;
}

const TYPING_TTL_MS = 4_000;

export const useTypingStore = create<TypingState>((set) => ({
  typingByChannel: {},
  setTyping: (channelId, userId, isTyping) =>
    set((state) => {
      const current = state.typingByChannel[channelId] ?? [];
      const filtered = current.filter((entry) => entry.userId !== userId);

      if (!isTyping) {
        return {
          typingByChannel: {
            ...state.typingByChannel,
            [channelId]: filtered,
          },
        };
      }

      return {
        typingByChannel: {
          ...state.typingByChannel,
          [channelId]: [
            ...filtered,
            { userId, expiresAt: Date.now() + TYPING_TTL_MS },
          ],
        },
      };
    }),
  clearChannel: (channelId) =>
    set((state) => {
      const next = { ...state.typingByChannel };
      delete next[channelId];
      return { typingByChannel: next };
    }),
}));

export function getActiveTypers(
  channelId: string,
  currentUserId?: string,
): string[] {
  const entries = useTypingStore.getState().typingByChannel[channelId] ?? [];
  const now = Date.now();

  return entries
    .filter((entry) => entry.expiresAt > now && entry.userId !== currentUserId)
    .map((entry) => entry.userId);
}
