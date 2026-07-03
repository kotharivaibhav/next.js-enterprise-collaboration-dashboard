export type RealtimeRoomType = "channel" | "board" | "document";

export type RealtimeEventType =
  | "message.created"
  | "typing"
  | "subscribed"
  | "error"
  | "card.moved"
  | "document.updated";

export interface RealtimeEvent<TData = Record<string, unknown>> {
  event: RealtimeEventType;
  room_type: RealtimeRoomType;
  room_id: string;
  data: TData;
  timestamp: string;
}

export interface MessageCreatedEventData {
  id: string;
  channel_id: string;
  workspace_id: string;
  author_id: string;
  content: string;
  parent_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface TypingEventData {
  user_id: string;
  is_typing: boolean;
}

export interface CardMovedEventData {
  card_id: string;
  board_id: string;
  workspace_id: string;
  list_id: string;
  previous_list_id: string;
  position: number;
  version: number;
  moved_by: string;
  updated_at: string;
}

export type DocumentChangeType =
  "title_updated" | "block_created" | "block_updated" | "block_deleted";

export interface DocumentUpdatedBlockSnapshot {
  id: string;
  parent_id: string | null;
  block_type: string;
  content: Record<string, unknown>;
  position: number;
  version: number;
}

export interface DocumentUpdatedEventData {
  document_id: string;
  workspace_id: string;
  title: string;
  version: number;
  change_type: DocumentChangeType;
  updated_by: string;
  updated_at: string;
  block?: DocumentUpdatedBlockSnapshot;
}

export interface RealtimeClientMessage {
  action: "subscribe" | "unsubscribe" | "typing";
  room_type: RealtimeRoomType;
  room_id: string;
  workspace_id?: string;
  is_typing?: boolean;
}

export interface RealtimeSubscription {
  roomType: RealtimeRoomType;
  roomId: string;
  workspaceId: string;
}
