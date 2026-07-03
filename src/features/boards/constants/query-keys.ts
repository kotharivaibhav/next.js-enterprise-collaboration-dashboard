export const BOARD_QUERY_KEYS = {
  all: ["boards"] as const,
  list: (workspaceId: string) =>
    [...BOARD_QUERY_KEYS.all, "list", workspaceId] as const,
  detail: (workspaceId: string, boardId: string) =>
    [...BOARD_QUERY_KEYS.all, "detail", workspaceId, boardId] as const,
  lists: (workspaceId: string, boardId: string) =>
    [...BOARD_QUERY_KEYS.all, "lists", workspaceId, boardId] as const,
  cards: (workspaceId: string, boardId: string, listId: string) =>
    [...BOARD_QUERY_KEYS.all, "cards", workspaceId, boardId, listId] as const,
} as const;
