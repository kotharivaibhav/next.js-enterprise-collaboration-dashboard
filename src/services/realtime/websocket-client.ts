import { clientEnv } from "@/config/env";
import type {
  RealtimeClientMessage,
  RealtimeEvent,
  RealtimeSubscription,
} from "@/types/realtime";

type EventHandler = (event: RealtimeEvent) => void;
type ConnectionHandler = () => void;

const MAX_RECONNECT_DELAY_MS = 30_000;

class RealtimeClient {
  private socket: WebSocket | null = null;
  private subscriptions = new Map<string, RealtimeSubscription>();
  private eventHandlers = new Set<EventHandler>();
  private connectHandlers = new Set<ConnectionHandler>();
  private disconnectHandlers = new Set<ConnectionHandler>();
  private reconnectAttempt = 0;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private isConnecting = false;
  private shouldReconnect = true;

  private getSubscriptionKey(sub: RealtimeSubscription): string {
    return `${sub.roomType}:${sub.roomId}`;
  }

  addEventListener(handler: EventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  onConnect(handler: ConnectionHandler): () => void {
    this.connectHandlers.add(handler);
    return () => this.connectHandlers.delete(handler);
  }

  onDisconnect(handler: ConnectionHandler): () => void {
    this.disconnectHandlers.add(handler);
    return () => this.disconnectHandlers.delete(handler);
  }

  async connect(): Promise<void> {
    if (
      this.socket?.readyState === WebSocket.OPEN ||
      this.socket?.readyState === WebSocket.CONNECTING ||
      this.isConnecting
    ) {
      return;
    }

    this.isConnecting = true;
    this.shouldReconnect = true;

    try {
      const response = await fetch("/api/auth/ws-token", {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Unable to obtain WebSocket token");
      }

      const { token } = (await response.json()) as { token: string };
      const url = `${clientEnv.NEXT_PUBLIC_WS_URL}?token=${encodeURIComponent(token)}`;

      this.socket = new WebSocket(url);

      this.socket.onopen = () => {
        this.isConnecting = false;
        this.reconnectAttempt = 0;
        this.resubscribeAll();
        this.connectHandlers.forEach((handler) => handler());
      };

      this.socket.onmessage = (messageEvent) => {
        try {
          const event = JSON.parse(
            messageEvent.data as string,
          ) as RealtimeEvent;
          this.eventHandlers.forEach((handler) => handler(event));
        } catch {
          // Ignore malformed frames
        }
      };

      this.socket.onclose = () => {
        this.isConnecting = false;
        this.socket = null;
        this.disconnectHandlers.forEach((handler) => handler());
        this.scheduleReconnect();
      };

      this.socket.onerror = () => {
        this.socket?.close();
      };
    } catch {
      this.isConnecting = false;
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    this.shouldReconnect = false;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.socket?.close();
    this.socket = null;
    this.subscriptions.clear();
  }

  subscribe(subscription: RealtimeSubscription): void {
    const key = this.getSubscriptionKey(subscription);
    this.subscriptions.set(key, subscription);
    this.send({
      action: "subscribe",
      room_type: subscription.roomType,
      room_id: subscription.roomId,
      workspace_id: subscription.workspaceId,
    });
  }

  unsubscribe(
    subscription: Pick<RealtimeSubscription, "roomType" | "roomId">,
  ): void {
    const key = this.getSubscriptionKey({
      ...subscription,
      workspaceId: "",
    });
    this.subscriptions.delete(key);
    this.send({
      action: "unsubscribe",
      room_type: subscription.roomType,
      room_id: subscription.roomId,
    });
  }

  sendTyping(subscription: RealtimeSubscription, isTyping: boolean): void {
    this.send({
      action: "typing",
      room_type: subscription.roomType,
      room_id: subscription.roomId,
      workspace_id: subscription.workspaceId,
      is_typing: isTyping,
    });
  }

  private send(message: RealtimeClientMessage): void {
    if (this.socket?.readyState !== WebSocket.OPEN) {
      void this.connect();
      return;
    }
    this.socket.send(JSON.stringify(message));
  }

  private resubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      this.send({
        action: "subscribe",
        room_type: subscription.roomType,
        room_id: subscription.roomId,
        workspace_id: subscription.workspaceId,
      });
    });
  }

  private scheduleReconnect(): void {
    if (!this.shouldReconnect || this.reconnectTimer) return;

    const delay = Math.min(
      1000 * 2 ** this.reconnectAttempt,
      MAX_RECONNECT_DELAY_MS,
    );
    this.reconnectAttempt += 1;

    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.connect();
    }, delay);
  }
}

export const realtimeClient = new RealtimeClient();
