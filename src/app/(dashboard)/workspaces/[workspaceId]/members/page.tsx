import { WorkspaceMembersPageContent } from "@/features/workspaces/components/workspace-members-page-content";

interface WorkspaceMembersPageProps {
  params: Promise<{ workspaceId: string }>;
}

export default async function WorkspaceMembersPage({
  params,
}: WorkspaceMembersPageProps) {
  const { workspaceId } = await params;
  return <WorkspaceMembersPageContent workspaceId={workspaceId} />;
}
