"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { BoardSidebar } from "@/features/boards/components/board-sidebar";
import { BoardsEmptyState } from "@/features/boards/components/boards-empty-state";
import { useBoards } from "@/features/boards/hooks/use-boards";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/store/workspace-store";

export function BoardsLayoutShell({ children }: { children: React.ReactNode }) {
  const params = useParams<{ workspaceId: string; boardId?: string }>();
  const workspaceId = params.workspaceId;
  const boardId = params.boardId;
  const router = useRouter();
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const { data: boards, isLoading } = useBoards(workspaceId);

  useEffect(() => {
    setActiveWorkspaceId(workspaceId);
  }, [workspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    if (isLoading || boardId || !boards?.length) return;
    router.replace(ROUTES.workspaceBoard(workspaceId, boards[0].id));
  }, [isLoading, boardId, boards, workspaceId, router]);

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden md:-m-6">
      <BoardSidebar workspaceId={workspaceId} activeBoardId={boardId} />
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        {children ?? <BoardsEmptyState workspaceId={workspaceId} />}
      </div>
    </div>
  );
}
