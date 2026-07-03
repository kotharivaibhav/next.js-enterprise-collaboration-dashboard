export const CHANNEL_QUERY_KEYS = {
  all: ["channels"] as const,
  list: (workspaceId: string) =>
    [...CHANNEL_QUERY_KEYS.all, "list", workspaceId] as const,
  detail: (workspaceId: string, channelId: string) =>
    [...CHANNEL_QUERY_KEYS.all, "detail", workspaceId, channelId] as const,
  messages: (
    workspaceId: string,
    channelId: string,
    parentId?: string | null,
  ) =>
    [
      ...CHANNEL_QUERY_KEYS.all,
      "messages",
      workspaceId,
      channelId,
      parentId ?? "root",
    ] as const,
} as const;
