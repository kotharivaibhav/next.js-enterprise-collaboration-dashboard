import { describe, expect, it } from "vitest";

import {
  POSITION_GAP,
  calculateDropPosition,
  sortCardsByPosition,
} from "@/features/boards/utils/position";
import type { Card } from "@/types/board";

function makeCard(overrides: Partial<Card>): Card {
  return {
    id: "card-1",
    board_id: "board-1",
    list_id: "list-1",
    workspace_id: "ws-1",
    title: "Task",
    description: null,
    position: POSITION_GAP,
    due_date: null,
    labels: [],
    assignee_ids: [],
    created_by: "user-1",
    version: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("calculateDropPosition", () => {
  it("returns 1024 for empty list", () => {
    expect(calculateDropPosition([], 0)).toBe(POSITION_GAP);
  });

  it("returns midpoint when inserting at start", () => {
    const cards = [makeCard({ id: "a", position: 1024 })];
    expect(calculateDropPosition(cards, 0)).toBe(512);
  });

  it("returns last position + gap when appending", () => {
    const cards = [
      makeCard({ id: "a", position: 1024 }),
      makeCard({ id: "b", position: 2048 }),
    ];
    expect(calculateDropPosition(cards, 2)).toBe(3072);
  });

  it("returns midpoint between neighbors", () => {
    const cards = [
      makeCard({ id: "a", position: 1024 }),
      makeCard({ id: "b", position: 2048 }),
    ];
    expect(calculateDropPosition(cards, 1)).toBe(1536);
  });
});

describe("sortCardsByPosition", () => {
  it("sorts cards ascending by position", () => {
    const sorted = sortCardsByPosition([
      makeCard({ id: "b", position: 2048 }),
      makeCard({ id: "a", position: 1024 }),
    ]);
    expect(sorted.map((card) => card.id)).toEqual(["a", "b"]);
  });
});
