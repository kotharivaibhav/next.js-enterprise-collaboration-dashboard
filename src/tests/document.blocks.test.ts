import { describe, expect, it } from "vitest";

import {
  getBlockText,
  getNextBlockPosition,
  getRootBlocks,
  sortBlocksByPosition,
} from "@/features/documents/utils/blocks";
import type { DocumentBlock } from "@/types/document";

function makeBlock(overrides: Partial<DocumentBlock>): DocumentBlock {
  return {
    id: "block-1",
    document_id: "doc-1",
    workspace_id: "ws-1",
    parent_id: null,
    block_type: "paragraph",
    content: { text: "Hello" },
    position: 1024,
    created_by: "user-1",
    version: 1,
    is_active: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

describe("getRootBlocks", () => {
  it("returns only root blocks sorted by position", () => {
    const blocks = [
      makeBlock({ id: "b2", parent_id: null, position: 2048 }),
      makeBlock({ id: "child", parent_id: "b2", position: 1024 }),
      makeBlock({ id: "b1", parent_id: null, position: 1024 }),
    ];
    expect(getRootBlocks(blocks).map((block) => block.id)).toEqual([
      "b1",
      "b2",
    ]);
  });
});

describe("getNextBlockPosition", () => {
  it("returns 1024 for first sibling", () => {
    expect(getNextBlockPosition([])).toBe(1024);
  });

  it("appends after last sibling", () => {
    const blocks = [
      makeBlock({ position: 1024 }),
      makeBlock({ id: "b2", position: 2048 }),
    ];
    expect(getNextBlockPosition(blocks)).toBe(3072);
  });
});

describe("getBlockText", () => {
  it("reads text from content", () => {
    expect(getBlockText({ text: "Hello world" })).toBe("Hello world");
  });
});

describe("sortBlocksByPosition", () => {
  it("sorts ascending", () => {
    const sorted = sortBlocksByPosition([
      makeBlock({ id: "b2", position: 2048 }),
      makeBlock({ id: "b1", position: 1024 }),
    ]);
    expect(sorted.map((block) => block.id)).toEqual(["b1", "b2"]);
  });
});
