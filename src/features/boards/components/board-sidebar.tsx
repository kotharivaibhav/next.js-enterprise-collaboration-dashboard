"use client";

import { Kanban } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { CreateBoardDialog } from "@/features/boards/components/create-board-dialog";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface BoardSidebarProps {
  workspaceId: string;
  activeBoardId?: string;
}

export function BoardSidebar({
  workspaceId,
  activeBoardId,
}: BoardSidebarProps) {
  const { data: boards, isLoading } = useBoards(workspaceId);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between border-b px-3 py-3">
        <h2 className="text-sm font-semibold">Boards</h2>
        <CreateBoardDialog
          workspaceId={workspaceId}
          trigger={
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent"
            >
              +
            </button>
          }
        />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        {boards?.map((board) => (
          <Link
            key={board.id}
            href={ROUTES.workspaceBoard(workspaceId, board.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent",
              board.id === activeBoardId &&
                "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
            )}
          >
            <Kanban className="size-4 shrink-0 opacity-70" />
            <span className="truncate">{board.name}</span>
          </Link>
        ))}
        {!isLoading && boards?.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted-foreground">
            No boards yet. Create one to get started.
          </p>
        )}
      </nav>
    </aside>
  );
}
