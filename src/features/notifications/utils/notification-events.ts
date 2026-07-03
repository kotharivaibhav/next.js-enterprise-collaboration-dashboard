import { ROUTES } from "@/constants/routes";
import type {
  CardMovedEventData,
  DocumentUpdatedEventData,
  MessageCreatedEventData,
  RealtimeEvent,
} from "@/types/realtime";
import type { AppNotification, NotificationType } from "@/types/notification";

function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function documentChangeLabel(
  changeType: DocumentUpdatedEventData["change_type"],
): string {
  switch (changeType) {
    case "title_updated":
      return "Title updated";
    case "block_created":
      return "Block added";
    case "block_updated":
      return "Block edited";
    case "block_deleted":
      return "Block removed";
    default:
      return "Document updated";
  }
}

export function isUserMentioned(
  content: string,
  metadata: Record<string, unknown>,
  userEmail?: string,
): boolean {
  if (!userEmail) return false;

  const normalizedEmail = userEmail.toLowerCase();
  const mentions = metadata.mentions;

  if (Array.isArray(mentions)) {
    return mentions.some(
      (email) =>
        typeof email === "string" && email.toLowerCase() === normalizedEmail,
    );
  }

  return content.toLowerCase().includes(`@${normalizedEmail}`);
}

export function shouldSkipNotification(params: {
  pathname: string;
  event: RealtimeEvent;
  currentUserId?: string;
  authorId?: string;
}): boolean {
  const { pathname, event, currentUserId, authorId } = params;

  if (authorId && currentUserId && authorId === currentUserId) {
    return true;
  }

  if (
    event.event === "typing" ||
    event.event === "subscribed" ||
    event.event === "error"
  ) {
    return true;
  }

  if (event.event === "message.created") {
    const data = event.data as unknown as MessageCreatedEventData;
    return pathname.includes(`/channels/${data.channel_id}`);
  }

  if (event.event === "card.moved") {
    const data = event.data as unknown as CardMovedEventData;
    return pathname.includes(`/boards/${data.board_id}`);
  }

  if (event.event === "document.updated") {
    const data = event.data as unknown as DocumentUpdatedEventData;
    return pathname.includes(`/documents/${data.document_id}`);
  }

  return false;
}

export function realtimeEventToNotification(
  event: RealtimeEvent,
  userEmail?: string,
): Omit<AppNotification, "read"> | null {
  if (event.event === "message.created") {
    const data = event.data as unknown as MessageCreatedEventData;
    const mentioned = isUserMentioned(
      data.content,
      data.metadata ?? {},
      userEmail,
    );
    const type: NotificationType = mentioned ? "mention" : "message";

    return {
      id: `message:${data.id}`,
      type,
      title: mentioned ? "You were mentioned" : "New message",
      body: truncate(data.content, 120),
      href: ROUTES.workspaceChannel(data.workspace_id, data.channel_id),
      workspaceId: data.workspace_id,
      createdAt: data.created_at,
    };
  }

  if (event.event === "card.moved") {
    const data = event.data as unknown as CardMovedEventData;

    return {
      id: `card:${data.card_id}:${data.updated_at}`,
      type: "card_moved",
      title: "Card moved",
      body: "A card was moved on the board.",
      href: ROUTES.workspaceBoard(data.workspace_id, data.board_id),
      workspaceId: data.workspace_id,
      createdAt: data.updated_at,
    };
  }

  if (event.event === "document.updated") {
    const data = event.data as unknown as DocumentUpdatedEventData;

    return {
      id: `document:${data.document_id}:${data.updated_at}:${data.change_type}`,
      type: "document_updated",
      title: documentChangeLabel(data.change_type),
      body: truncate(data.title || "Untitled document", 80),
      href: ROUTES.workspaceDocument(data.workspace_id, data.document_id),
      workspaceId: data.workspace_id,
      createdAt: data.updated_at,
    };
  }

  return null;
}
