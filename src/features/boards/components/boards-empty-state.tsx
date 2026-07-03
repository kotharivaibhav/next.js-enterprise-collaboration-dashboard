"use client";

import { Kanban } from "lucide-react";

import { CreateBoardDialog } from "@/features/boards/components/create-board-dialog";

interface BoardsEmptyStateProps {
  workspaceId: string;
}

export function BoardsEmptyState({ workspaceId }: BoardsEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Kanban className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium">No board selected</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Select a board from the sidebar or create a new Kanban board.
      </p>
      <div className="mt-6">
        <CreateBoardDialog workspaceId={workspaceId} />
      </div>
    </div>
  );
}
