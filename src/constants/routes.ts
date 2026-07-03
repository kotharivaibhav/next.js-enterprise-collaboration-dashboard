export const ROUTES = {
  home: "/",
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  dashboard: "/dashboard",
  workspaces: "/workspaces",
  settings: "/settings",
  profile: "/profile",
  workspaceDetail: (workspaceId: string) => `/workspaces/${workspaceId}`,
  workspaceMembers: (workspaceId: string) =>
    `/workspaces/${workspaceId}/members`,
  workspaceChannels: (workspaceId: string) =>
    `/workspaces/${workspaceId}/channels`,
  workspaceChannel: (workspaceId: string, channelId: string) =>
    `/workspaces/${workspaceId}/channels/${channelId}`,
  workspaceBoards: (workspaceId: string) => `/workspaces/${workspaceId}/boards`,
  workspaceBoard: (workspaceId: string, boardId: string) =>
    `/workspaces/${workspaceId}/boards/${boardId}`,
  workspaceDocuments: (workspaceId: string) =>
    `/workspaces/${workspaceId}/documents`,
  workspaceDocument: (workspaceId: string, documentId: string) =>
    `/workspaces/${workspaceId}/documents/${documentId}`,
} as const;

export const PUBLIC_ROUTES = [
  ROUTES.login,
  ROUTES.register,
  ROUTES.forgotPassword,
] as const;

export const PROTECTED_ROUTE_PREFIXES = [
  ROUTES.dashboard,
  ROUTES.workspaces,
  ROUTES.settings,
  ROUTES.profile,
] as const;
