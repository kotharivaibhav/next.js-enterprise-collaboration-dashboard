import { create } from "zustand";

interface TypingUser {
  userId: string;
  expiresAt: number;
}

interface TypingState {
  typingByChannel: Record<string, TypingUser[]>;
  setTyping: (channelId: string, userId: string, isTyping: boolean) => void;
  clearChannel: (channelId: string) => void;
  pruneExpired: () => void;
}

const TYPING_TTL_MS = 4_000;
const EMPTY_TYPERS: TypingUser[] = [];

function removeExpired(entries: TypingUser[], now = Date.now()): TypingUser[] {
  return entries.filter((entry) => entry.expiresAt > now);
}

export const useTypingStore = create<TypingState>((set) => ({
  typingByChannel: {},
  setTyping: (channelId, userId, isTyping) =>
    set((state) => {
      const now = Date.now();
      const current = removeExpired(
        state.typingByChannel[channelId] ?? [],
        now,
      ).filter((entry) => entry.userId !== userId);

      if (!isTyping) {
        return {
          typingByChannel: {
            ...state.typingByChannel,
            [channelId]: current,
          },
        };
      }

      return {
        typingByChannel: {
          ...state.typingByChannel,
          [channelId]: [...current, { userId, expiresAt: now + TYPING_TTL_MS }],
        },
      };
    }),
  clearChannel: (channelId) =>
    set((state) => {
      const next = { ...state.typingByChannel };
      delete next[channelId];
      return { typingByChannel: next };
    }),
  pruneExpired: () =>
    set((state) => {
      const now = Date.now();
      let changed = false;
      const typingByChannel: Record<string, TypingUser[]> = {};

      for (const [channelId, entries] of Object.entries(
        state.typingByChannel,
      )) {
        const active = removeExpired(entries, now);
        if (active.length !== entries.length) {
          changed = true;
        }
        if (active.length > 0) {
          typingByChannel[channelId] = active;
        }
      }

      return changed ? { typingByChannel } : state;
    }),
}));

export function selectChannelTypers(
  state: TypingState,
  channelId: string,
): TypingUser[] {
  return state.typingByChannel[channelId] ?? EMPTY_TYPERS;
}

export function getActiveTypers(
  channelId: string,
  currentUserId?: string,
): string[] {
  const entries = selectChannelTypers(useTypingStore.getState(), channelId);
  const now = Date.now();

  return removeExpired(entries, now)
    .filter((entry) => entry.userId !== currentUserId)
    .map((entry) => entry.userId);
}
