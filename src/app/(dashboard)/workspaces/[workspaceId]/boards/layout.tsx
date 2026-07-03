import { BoardsLayoutShell } from "@/features/boards/components/boards-layout-shell";

export default function WorkspaceBoardsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <BoardsLayoutShell>{children}</BoardsLayoutShell>;
}
