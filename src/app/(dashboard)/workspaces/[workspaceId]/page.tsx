import { WorkspaceDetailContent } from "@/features/workspaces/components/workspace-detail-content";

interface WorkspaceDetailPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceDetailPage({
  params,
}: WorkspaceDetailPageProps) {
  const { workspaceId } = await params;
  return <WorkspaceDetailContent workspaceId={workspaceId} />;
}
