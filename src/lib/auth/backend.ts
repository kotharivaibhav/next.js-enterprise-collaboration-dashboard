import { getBackendApiUrl } from "@/config/env";
import type { ApiErrorBody } from "@/types/api";

export class BackendRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly body: ApiErrorBody,
  ) {
    super(typeof body.detail === "string" ? body.detail : "Request failed");
    this.name = "BackendRequestError";
  }
}

interface BackendFetchOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  accessToken?: string;
}

export async function backendFetch<T>(
  path: string,
  options: BackendFetchOptions = {},
): Promise<T> {
  const { body, accessToken, headers, ...rest } = options;

  const response = await fetch(getBackendApiUrl(path), {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const payload = (await response.json().catch(() => ({
    detail: "Unexpected response from server",
  }))) as T | ApiErrorBody;

  if (!response.ok) {
    throw new BackendRequestError(response.status, payload as ApiErrorBody);
  }

  return payload as T;
}
