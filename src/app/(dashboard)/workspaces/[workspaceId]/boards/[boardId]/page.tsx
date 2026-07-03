import { BoardView } from "@/features/boards/components/board-view";

interface BoardPageProps {
  params: Promise<{ workspaceId: string; boardId: string }>;
}

export default async function BoardPage({ params }: BoardPageProps) {
  const { workspaceId, boardId } = await params;
  return <BoardView workspaceId={workspaceId} boardId={boardId} />;
}
