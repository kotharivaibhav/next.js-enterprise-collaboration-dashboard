export type NotificationType =
  "message" | "mention" | "card_moved" | "document_updated";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  href: string;
  workspaceId: string;
  read: boolean;
  createdAt: string;
}
