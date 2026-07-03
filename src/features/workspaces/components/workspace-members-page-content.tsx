"use client";

import { useEffect } from "react";

import { PageHeader } from "@/components/common/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { AddMemberDialog } from "@/features/workspaces/components/add-member-dialog";
import { WorkspaceMembersTable } from "@/features/workspaces/components/workspace-members-table";
import {
  useWorkspace,
  useWorkspaceMembers,
  useWorkspacePermissions,
} from "@/features/workspaces/hooks/use-workspaces";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/store/workspace-store";

interface WorkspaceMembersPageContentProps {
  workspaceId: string;
}

export function WorkspaceMembersPageContent({
  workspaceId,
}: WorkspaceMembersPageContentProps) {
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const { data: workspace, isLoading: workspaceLoading } =
    useWorkspace(workspaceId);
  const {
    data: members,
    isLoading: membersLoading,
    isError,
  } = useWorkspaceMembers(workspaceId);
  const permissions = useWorkspacePermissions(workspaceId);

  useEffect(() => {
    setActiveWorkspaceId(workspaceId);
  }, [workspaceId, setActiveWorkspaceId]);

  if (workspaceLoading || membersLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading members" />
      </div>
    );
  }

  if (isError || !workspace || !members) {
    return (
      <p className="text-destructive">Unable to load workspace members.</p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        description={`Manage who has access to ${workspace.name}.`}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.dashboard },
          { label: "Workspaces", href: ROUTES.workspaces },
          {
            label: workspace.name,
            href: ROUTES.workspaceDetail(workspace.id),
          },
          { label: "Members" },
        ]}
        actions={
          permissions.canManageMembers ? (
            <AddMemberDialog workspaceId={workspace.id} />
          ) : undefined
        }
      />

      <WorkspaceMembersTable workspace={workspace} members={members} />
    </div>
  );
}
