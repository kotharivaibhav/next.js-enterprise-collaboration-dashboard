import { boardService } from "@/features/boards/services/board.service";
import { channelService } from "@/features/channels/services/channel.service";
import { documentService } from "@/features/documents/services/document.service";
import { workspaceService } from "@/features/workspaces/services/workspace.service";

export interface WorkspaceContentStats {
  workspaceId: string;
  channels: number;
  boards: number;
  documents: number;
  cards: number;
  members: number;
}

export interface GlobalAnalytics {
  workspaceCount: number;
  workspaces: Array<{
    id: string;
    name: string;
    channels: number;
    boards: number;
    documents: number;
  }>;
  activeWorkspace: WorkspaceContentStats | null;
}

async function countCardsForBoard(
  workspaceId: string,
  boardId: string,
): Promise<number> {
  const lists = await boardService.listLists(workspaceId, boardId);
  const cardCounts = await Promise.all(
    lists.map((list) => boardService.listCards(workspaceId, boardId, list.id)),
  );
  return cardCounts.reduce((total, cards) => total + cards.length, 0);
}

export async function getWorkspaceContentStats(
  workspaceId: string,
): Promise<WorkspaceContentStats> {
  const [channels, boards, documents, members] = await Promise.all([
    channelService.list(workspaceId),
    boardService.list(workspaceId),
    documentService.list(workspaceId),
    workspaceService.listMembers(workspaceId),
  ]);

  const cardCounts = await Promise.all(
    boards.map((board) => countCardsForBoard(workspaceId, board.id)),
  );

  return {
    workspaceId,
    channels: channels.length,
    boards: boards.length,
    documents: documents.length,
    cards: cardCounts.reduce((total, count) => total + count, 0),
    members: members.length,
  };
}

export async function getGlobalAnalytics(
  activeWorkspaceId?: string | null,
): Promise<GlobalAnalytics> {
  const workspaces = await workspaceService.list();

  const workspaceSummaries = await Promise.all(
    workspaces.map(async (workspace) => {
      const [channels, boards, documents] = await Promise.all([
        channelService.list(workspace.id),
        boardService.list(workspace.id),
        documentService.list(workspace.id),
      ]);

      return {
        id: workspace.id,
        name: workspace.name,
        channels: channels.length,
        boards: boards.length,
        documents: documents.length,
      };
    }),
  );

  const activeWorkspace = activeWorkspaceId
    ? await getWorkspaceContentStats(activeWorkspaceId)
    : null;

  return {
    workspaceCount: workspaces.length,
    workspaces: workspaceSummaries,
    activeWorkspace,
  };
}
