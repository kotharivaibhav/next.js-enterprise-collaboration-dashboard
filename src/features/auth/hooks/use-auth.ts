import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { AUTH_BROADCAST_CHANNEL, AUTH_QUERY_KEYS } from "@/constants/auth";
import { ROUTES } from "@/constants/routes";
import { authService } from "@/features/auth/services/auth.service";
import type {
  LoginFormValues,
  RegisterFormValues,
} from "@/features/auth/schemas/auth.schema";
import { parseApiError } from "@/services/api/errors";
import { useAuthStore } from "@/store/auth-store";

function broadcastAuthEvent(type: "login" | "logout") {
  if (typeof window === "undefined") return;
  const channel = new BroadcastChannel(AUTH_BROADCAST_CHANNEL);
  channel.postMessage({ type });
  channel.close();
}

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);

  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: async () => {
      const user = await authService.getMe();
      setUser(user);
      return user;
    },
    retry: false,
    staleTime: 60_000,
  });
}

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: LoginFormValues) => authService.login(payload),
    onSuccess: async () => {
      const user = await authService.getMe();
      setUser(user);
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, user);
      broadcastAuthEvent("login");
      toast.success("Welcome back!");
      router.replace(ROUTES.dashboard);
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useRegister() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: (payload: RegisterFormValues) => authService.register(payload),
    onSuccess: (data) => {
      setUser(data.user);
      queryClient.setQueryData(AUTH_QUERY_KEYS.me, data.user);
      broadcastAuthEvent("login");
      toast.success("Account created successfully");
      router.replace(ROUTES.dashboard);
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearUser = useAuthStore((state) => state.clearUser);

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      clearUser();
      queryClient.removeQueries({ queryKey: AUTH_QUERY_KEYS.me });
      broadcastAuthEvent("logout");
      toast.success("Signed out");
      router.replace(ROUTES.login);
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}
