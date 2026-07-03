export type ChannelType = "public" | "private";

export interface Channel {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  channel_type: ChannelType;
  created_by: string;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  channel_id: string;
  workspace_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  metadata: Record<string, unknown>;
  is_edited: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface MessageListResponse {
  items: Message[];
  next_cursor: string | null;
  has_more: boolean;
}

export interface CreateChannelRequest {
  name: string;
  description?: string | null;
  channel_type?: ChannelType;
}

export interface CreateMessageRequest {
  content: string;
  parent_id?: string | null;
  metadata?: Record<string, unknown>;
}
