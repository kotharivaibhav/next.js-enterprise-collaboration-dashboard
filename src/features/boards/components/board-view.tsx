"use client";

import { Kanban, MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { KanbanBoard } from "@/features/boards/components/kanban-board";
import { useBoard, useDeleteBoard } from "@/features/boards/hooks/use-boards";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import type { Board } from "@/types/board";

interface BoardHeaderProps {
  workspaceId: string;
  board: Board;
}

function BoardHeader({ workspaceId, board }: BoardHeaderProps) {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const deleteBoard = useDeleteBoard(workspaceId);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
      <div className="flex items-center gap-2">
        <Kanban className="size-4 text-muted-foreground" />
        <h1 className="font-semibold">{board.name}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
        >
          <MoreHorizontal className="size-4" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            variant="destructive"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="size-4" />
            Delete board
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete board?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate &quot;{board.name}&quot; and its lists/cards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteBoard.isPending}
              onClick={async () => {
                await deleteBoard.mutateAsync(board.id);
                setDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </header>
  );
}

interface BoardViewProps {
  workspaceId: string;
  boardId: string;
}

export function BoardView({ workspaceId, boardId }: BoardViewProps) {
  const { data: board, isLoading, isError } = useBoard(workspaceId, boardId);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner label="Loading board" />
      </div>
    );
  }

  if (isError || !board) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-destructive">
        Board not found or you do not have access.
      </div>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <BoardHeader workspaceId={workspaceId} board={board} />
      <KanbanBoard workspaceId={workspaceId} boardId={boardId} />
    </div>
  );
}
