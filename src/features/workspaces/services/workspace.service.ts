import { apiClient } from "@/services/api/client";
import type {
  AddMemberRequest,
  CreateWorkspaceRequest,
  UpdateMemberRoleRequest,
  UpdateWorkspaceRequest,
  Workspace,
  WorkspaceMember,
} from "@/types/workspace";

export const workspaceService = {
  async list(): Promise<Workspace[]> {
    const { data } = await apiClient.get<Workspace[]>("/workspaces");
    return data;
  },

  async getById(workspaceId: string): Promise<Workspace> {
    const { data } = await apiClient.get<Workspace>(
      `/workspaces/${workspaceId}`,
    );
    return data;
  },

  async create(payload: CreateWorkspaceRequest): Promise<Workspace> {
    const { data } = await apiClient.post<Workspace>("/workspaces", payload);
    return data;
  },

  async update(
    workspaceId: string,
    payload: UpdateWorkspaceRequest,
  ): Promise<Workspace> {
    const { data } = await apiClient.patch<Workspace>(
      `/workspaces/${workspaceId}`,
      payload,
    );
    return data;
  },

  async remove(workspaceId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}`);
  },

  async listMembers(workspaceId: string): Promise<WorkspaceMember[]> {
    const { data } = await apiClient.get<WorkspaceMember[]>(
      `/workspaces/${workspaceId}/members`,
    );
    return data;
  },

  async addMember(
    workspaceId: string,
    payload: AddMemberRequest,
  ): Promise<WorkspaceMember> {
    const { data } = await apiClient.post<WorkspaceMember>(
      `/workspaces/${workspaceId}/members`,
      payload,
    );
    return data;
  },

  async updateMemberRole(
    workspaceId: string,
    memberUserId: string,
    payload: UpdateMemberRoleRequest,
  ): Promise<WorkspaceMember> {
    const { data } = await apiClient.patch<WorkspaceMember>(
      `/workspaces/${workspaceId}/members/${memberUserId}`,
      payload,
    );
    return data;
  },

  async removeMember(workspaceId: string, memberUserId: string): Promise<void> {
    await apiClient.delete(
      `/workspaces/${workspaceId}/members/${memberUserId}`,
    );
  },
};
