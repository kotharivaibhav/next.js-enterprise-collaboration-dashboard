import axios from "axios";

import { apiClient } from "@/services/api/client";
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  TokenResponse,
  User,
} from "@/types/auth";

const authClient = axios.create({
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

export const authService = {
  async login(payload: LoginRequest): Promise<TokenResponse> {
    const { data } = await authClient.post<TokenResponse>(
      "/api/auth/login",
      payload,
    );
    return data;
  },

  async register(payload: RegisterRequest): Promise<AuthResponse> {
    const { data } = await authClient.post<AuthResponse>(
      "/api/auth/register",
      payload,
    );
    return data;
  },

  async logout(): Promise<void> {
    await authClient.post("/api/auth/logout");
  },

  async getMe(): Promise<User> {
    const { data } = await apiClient.get<User>("/auth/me");
    return data;
  },
};
