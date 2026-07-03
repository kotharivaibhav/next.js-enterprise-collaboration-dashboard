import { apiClient } from "@/services/api/client";
import type {
  Channel,
  CreateChannelRequest,
  CreateMessageRequest,
  Message,
  MessageListResponse,
} from "@/types/channel";

export interface ListMessagesParams {
  limit?: number;
  cursor?: string | null;
  parent_id?: string | null;
}

export const channelService = {
  async list(workspaceId: string): Promise<Channel[]> {
    const { data } = await apiClient.get<Channel[]>(
      `/workspaces/${workspaceId}/channels`,
    );
    return data;
  },

  async getById(workspaceId: string, channelId: string): Promise<Channel> {
    const { data } = await apiClient.get<Channel>(
      `/workspaces/${workspaceId}/channels/${channelId}`,
    );
    return data;
  },

  async create(
    workspaceId: string,
    payload: CreateChannelRequest,
  ): Promise<Channel> {
    const { data } = await apiClient.post<Channel>(
      `/workspaces/${workspaceId}/channels`,
      payload,
    );
    return data;
  },

  async remove(workspaceId: string, channelId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/channels/${channelId}`);
  },

  async listMessages(
    workspaceId: string,
    channelId: string,
    params: ListMessagesParams = {},
  ): Promise<MessageListResponse> {
    const { data } = await apiClient.get<MessageListResponse>(
      `/workspaces/${workspaceId}/channels/${channelId}/messages`,
      { params },
    );
    return data;
  },

  async sendMessage(
    workspaceId: string,
    channelId: string,
    payload: CreateMessageRequest,
  ): Promise<Message> {
    const { data } = await apiClient.post<Message>(
      `/workspaces/${workspaceId}/channels/${channelId}/messages`,
      payload,
    );
    return data;
  },
};
