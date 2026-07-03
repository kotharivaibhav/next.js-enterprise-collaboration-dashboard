export const ANALYTICS_QUERY_KEYS = {
  all: ["analytics"] as const,
  global: (activeWorkspaceId?: string | null) =>
    [
      ...ANALYTICS_QUERY_KEYS.all,
      "global",
      activeWorkspaceId ?? "none",
    ] as const,
};
