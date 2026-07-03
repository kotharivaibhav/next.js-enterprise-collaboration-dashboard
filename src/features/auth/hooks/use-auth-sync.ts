"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { AUTH_BROADCAST_CHANNEL, AUTH_QUERY_KEYS } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { useAuthStore } from "@/store/auth-store";

export function useAuthSync() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  useEffect(() => {
    const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);

    channel.onmessage = (event: MessageEvent<{ type: string }>) => {
      if (event.data.type === "logout") {
        clearUser();
        queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me });
        router.replace(ROUTES.login);
      }

      if (event.data.type === "login") {
        queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      }
    };

    const handleSessionExpired = () => {
      clearUser();
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me });
      router.replace(ROUTES.login);
    };

    window.addEventListener("auth:session-expired", handleSessionExpired);

    return () => {
      channel.close();
      window.removeEventListener("auth:session-expired", handleSessionExpired);
    };
  }, [clearUser, queryClient, router]);
}
