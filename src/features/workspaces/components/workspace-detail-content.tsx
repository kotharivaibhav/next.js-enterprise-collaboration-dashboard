"use client";

import Link from "next/link";
import { useEffect } from "react";
import { FileText, Kanban, MessageSquare, Users } from "lucide-react";

import { PageHeader } from "@/components/common/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DeleteWorkspaceDialog } from "@/features/workspaces/components/delete-workspace-dialog";
import { WorkspaceSettingsForm } from "@/features/workspaces/components/workspace-settings-form";
import {
  useWorkspace,
  useWorkspacePermissions,
} from "@/features/workspaces/hooks/use-workspaces";
import { formatWorkspaceRole } from "@/features/workspaces/utils/permissions";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/store/workspace-store";

interface WorkspaceDetailContentProps {
  workspaceId: string;
}

export function WorkspaceDetailContent({
  workspaceId,
}: WorkspaceDetailContentProps) {
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const { data: workspace, isLoading, isError } = useWorkspace(workspaceId);
  const permissions = useWorkspacePermissions(workspaceId);

  useEffect(() => {
    setActiveWorkspaceId(workspaceId);
  }, [workspaceId, setActiveWorkspaceId]);

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading workspace" />
      </div>
    );
  }

  if (isError || !workspace) {
    return (
      <p className="text-destructive">
        Workspace not found or you do not have access.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title={workspace.name}
        description={workspace.description ?? "No description provided."}
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.dashboard },
          { label: "Workspaces", href: ROUTES.workspaces },
          { label: workspace.name },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href={ROUTES.workspaceChannels(workspace.id)}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
            >
              <MessageSquare className="size-4" />
              Channels
            </Link>
            <Link
              href={ROUTES.workspaceBoards(workspace.id)}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
            >
              <Kanban className="size-4" />
              Boards
            </Link>
            <Link
              href={ROUTES.workspaceDocuments(workspace.id)}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
            >
              <FileText className="size-4" />
              Documents
            </Link>
            <Link
              href={ROUTES.workspaceMembers(workspace.id)}
              className="inline-flex h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-2.5 text-sm font-medium hover:bg-muted"
            >
              <Users className="size-4" />
              Members
            </Link>
          </div>
        }
      />

      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{workspace.slug}</Badge>
        {permissions.role && (
          <Badge variant="outline">
            Your role: {formatWorkspaceRole(permissions.role)}
          </Badge>
        )}
        {permissions.isOwner && <Badge>Owner</Badge>}
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-medium">Settings</h2>
          <p className="text-sm text-muted-foreground">
            Update workspace name and description.
          </p>
        </div>
        <WorkspaceSettingsForm workspace={workspace} />
      </section>

      {permissions.canDelete && (
        <>
          <Separator />
          <section className="space-y-4">
            <div>
              <h2 className="text-lg font-medium text-destructive">
                Danger zone
              </h2>
              <p className="text-sm text-muted-foreground">
                Permanently delete this workspace. Only owners and admins can
                perform this action.
              </p>
            </div>
            <DeleteWorkspaceDialog
              workspaceId={workspace.id}
              workspaceName={workspace.name}
            />
          </section>
        </>
      )}
    </div>
  );
}
