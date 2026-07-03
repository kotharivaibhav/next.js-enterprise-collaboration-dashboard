"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateBlock,
  useDeleteBlock,
  useUpdateBlock,
} from "@/features/documents/hooks/use-documents";
import {
  blockTypeLabel,
  getBlockChecked,
  getBlockText,
} from "@/features/documents/utils/blocks";
import type { BlockType, DocumentBlock } from "@/types/document";
import { cn } from "@/lib/utils";

interface BlockEditorProps {
  workspaceId: string;
  documentId: string;
  block: DocumentBlock;
}

export function BlockEditor({
  workspaceId,
  documentId,
  block,
}: BlockEditorProps) {
  const updateBlock = useUpdateBlock(workspaceId, documentId);
  const deleteBlock = useDeleteBlock(workspaceId, documentId);
  const text = getBlockText(block.content);
  const checked = getBlockChecked(block.content);

  const saveText = (value: string) => {
    if (value === text) return;
    const content =
      block.block_type === "todo" ? { text: value, checked } : { text: value };
    updateBlock.mutate({ block, content });
  };

  const toggleTodo = () => {
    updateBlock.mutate({
      block,
      content: { text, checked: !checked },
    });
  };

  return (
    <div className="group flex gap-2 rounded-lg px-2 py-1 hover:bg-muted/40">
      <div className="mt-2 w-24 shrink-0 text-xs text-muted-foreground">
        {blockTypeLabel(block.block_type)}
      </div>
      <div className="min-w-0 flex-1">
        {block.block_type === "todo" ? (
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              checked={checked}
              onChange={toggleTodo}
              className="mt-1"
            />
            <Textarea
              key={`${block.id}-${text}-${checked}`}
              defaultValue={text}
              rows={1}
              className={cn(
                "min-h-0 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
                checked && "text-muted-foreground line-through",
              )}
              onBlur={(event) => saveText(event.target.value)}
            />
          </label>
        ) : block.block_type === "code" ? (
          <Textarea
            key={`${block.id}-${text}`}
            defaultValue={text}
            rows={3}
            className="font-mono text-sm"
            onBlur={(event) => saveText(event.target.value)}
          />
        ) : (
          <Textarea
            key={`${block.id}-${text}`}
            defaultValue={text}
            rows={block.block_type === "paragraph" ? 2 : 1}
            className={cn(
              "min-h-0 resize-none border-0 bg-transparent px-0 shadow-none focus-visible:ring-0",
              block.block_type === "heading_1" && "text-2xl font-bold",
              block.block_type === "heading_2" && "text-xl font-semibold",
              block.block_type === "heading_3" && "text-lg font-medium",
              block.block_type === "bullet_list" && "pl-4",
            )}
            onBlur={(event) => saveText(event.target.value)}
          />
        )}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        className="opacity-0 group-hover:opacity-100"
        onClick={() => deleteBlock.mutate(block.id)}
        disabled={deleteBlock.isPending}
      >
        <Trash2 className="size-4 text-destructive" />
      </Button>
    </div>
  );
}

const BLOCK_TYPES: BlockType[] = [
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "todo",
  "code",
  "bullet_list",
];

interface AddBlockMenuProps {
  workspaceId: string;
  documentId: string;
  blocks: DocumentBlock[];
}

export function AddBlockMenu({
  workspaceId,
  documentId,
  blocks,
}: AddBlockMenuProps) {
  const createBlock = useCreateBlock(workspaceId, documentId);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={buttonVariants({ variant: "outline", size: "sm" })}
      >
        <Plus className="size-4" />
        Add block
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {BLOCK_TYPES.map((blockType) => (
          <DropdownMenuItem
            key={blockType}
            onClick={() => createBlock.mutate({ blockType, blocks })}
            disabled={createBlock.isPending}
          >
            {blockTypeLabel(blockType)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
