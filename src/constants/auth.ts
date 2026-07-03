export const AUTH_COOKIE_NAMES = {
  accessToken: "cf_access_token",
  refreshToken: "cf_refresh_token",
} as const;

export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
} as const;

export const AUTH_BROADCAST_CHANNEL = "collabforge-auth";
