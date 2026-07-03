export const WORKSPACE_QUERY_KEYS = {
  all: ["workspaces"] as const,
  list: () => [...WORKSPACE_QUERY_KEYS.all, "list"] as const,
  detail: (workspaceId: string) =>
    [...WORKSPACE_QUERY_KEYS.all, "detail", workspaceId] as const,
  members: (workspaceId: string) =>
    [...WORKSPACE_QUERY_KEYS.all, "members", workspaceId] as const,
} as const;
