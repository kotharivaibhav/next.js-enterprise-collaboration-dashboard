import { describe, expect, it } from "vitest";

import {
  isUserMentioned,
  realtimeEventToNotification,
  shouldSkipNotification,
} from "@/features/notifications/utils/notification-events";
import type { RealtimeEvent } from "@/types/realtime";

describe("notification events", () => {
  it("detects mentions from metadata", () => {
    expect(
      isUserMentioned(
        "hello",
        { mentions: ["user@company.com"] },
        "user@company.com",
      ),
    ).toBe(true);
  });

  it("detects mentions from content fallback", () => {
    expect(
      isUserMentioned("ping @user@company.com", {}, "user@company.com"),
    ).toBe(true);
  });

  it("skips notifications on the active channel page", () => {
    const event: RealtimeEvent = {
      event: "message.created",
      room_type: "channel",
      room_id: "ch-1",
      timestamp: "2026-01-01T00:00:00Z",
      data: {
        id: "msg-1",
        channel_id: "ch-1",
        workspace_id: "ws-1",
        author_id: "user-2",
        content: "hello",
        parent_id: null,
        metadata: {},
        created_at: "2026-01-01T00:00:00Z",
      },
    };

    expect(
      shouldSkipNotification({
        pathname: "/workspaces/ws-1/channels/ch-1",
        event,
        currentUserId: "user-1",
        authorId: "user-2",
      }),
    ).toBe(true);
  });

  it("skips own messages", () => {
    const event: RealtimeEvent = {
      event: "message.created",
      room_type: "channel",
      room_id: "ch-1",
      timestamp: "2026-01-01T00:00:00Z",
      data: {
        id: "msg-1",
        channel_id: "ch-1",
        workspace_id: "ws-1",
        author_id: "user-1",
        content: "hello",
        parent_id: null,
        metadata: {},
        created_at: "2026-01-01T00:00:00Z",
      },
    };

    expect(
      shouldSkipNotification({
        pathname: "/dashboard",
        event,
        currentUserId: "user-1",
        authorId: "user-1",
      }),
    ).toBe(true);
  });

  it("maps message events to notifications", () => {
    const event: RealtimeEvent = {
      event: "message.created",
      room_type: "channel",
      room_id: "ch-1",
      timestamp: "2026-01-01T00:00:00Z",
      data: {
        id: "msg-1",
        channel_id: "ch-1",
        workspace_id: "ws-1",
        author_id: "user-2",
        content: "hey @user@company.com",
        parent_id: null,
        metadata: { mentions: ["user@company.com"] },
        created_at: "2026-01-01T00:00:00Z",
      },
    };

    const notification = realtimeEventToNotification(event, "user@company.com");

    expect(notification?.type).toBe("mention");
    expect(notification?.title).toBe("You were mentioned");
    expect(notification?.href).toBe("/workspaces/ws-1/channels/ch-1");
  });
});
