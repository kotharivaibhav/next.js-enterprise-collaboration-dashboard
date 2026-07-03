export const DOCUMENT_QUERY_KEYS = {
  all: ["documents"] as const,
  list: (workspaceId: string) =>
    [...DOCUMENT_QUERY_KEYS.all, "list", workspaceId] as const,
  detail: (workspaceId: string, documentId: string) =>
    [...DOCUMENT_QUERY_KEYS.all, "detail", workspaceId, documentId] as const,
} as const;
