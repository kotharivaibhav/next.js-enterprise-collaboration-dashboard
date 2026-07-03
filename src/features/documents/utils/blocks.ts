import { POSITION_GAP } from "@/features/boards/utils/position";
import type { BlockType, DocumentBlock } from "@/types/document";

export function getBlockText(content: Record<string, unknown>): string {
  const text = content.text;
  return typeof text === "string" ? text : "";
}

export function getBlockChecked(content: Record<string, unknown>): boolean {
  return content.checked === true;
}

export function defaultBlockContent(
  blockType: BlockType,
): Record<string, unknown> {
  if (blockType === "todo") {
    return { text: "", checked: false };
  }
  return { text: "" };
}

export function sortBlocksByPosition(blocks: DocumentBlock[]): DocumentBlock[] {
  return [...blocks].sort((a, b) => a.position - b.position);
}

export function getRootBlocks(blocks: DocumentBlock[]): DocumentBlock[] {
  return sortBlocksByPosition(
    blocks.filter((block) => block.parent_id === null),
  );
}

export function getSiblingBlocks(
  blocks: DocumentBlock[],
  parentId: string | null,
): DocumentBlock[] {
  return sortBlocksByPosition(
    blocks.filter((block) => block.parent_id === parentId),
  );
}

export function getNextBlockPosition(
  blocks: DocumentBlock[],
  parentId: string | null = null,
): number {
  const siblings = getSiblingBlocks(blocks, parentId);
  if (siblings.length === 0) return POSITION_GAP;
  return siblings[siblings.length - 1].position + POSITION_GAP;
}

export function blockTypeLabel(blockType: BlockType): string {
  const labels: Record<BlockType, string> = {
    paragraph: "Text",
    heading_1: "Heading 1",
    heading_2: "Heading 2",
    heading_3: "Heading 3",
    todo: "To-do",
    code: "Code",
    bullet_list: "Bullet list",
  };
  return labels[blockType];
}
