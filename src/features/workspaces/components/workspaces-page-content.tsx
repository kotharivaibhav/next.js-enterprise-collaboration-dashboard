"use client";

import { PageHeader } from "@/components/common/page-header";
import { LoadingSpinner } from "@/components/common/loading-spinner";
import { CreateWorkspaceDialog } from "@/features/workspaces/components/create-workspace-dialog";
import { WorkspaceCard } from "@/features/workspaces/components/workspace-card";
import { WorkspacesEmptyState } from "@/features/workspaces/components/workspaces-empty-state";
import { useWorkspaces } from "@/features/workspaces/hooks/use-workspaces";
import { ROUTES } from "@/constants/routes";

export function WorkspacesPageContent() {
  const { data: workspaces, isLoading, isError } = useWorkspaces();

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <LoadingSpinner label="Loading workspaces" />
      </div>
    );
  }

  if (isError) {
    return (
      <p className="text-destructive">
        Unable to load workspaces. Please try again.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Workspaces"
        description="Manage your teams and collaboration spaces."
        breadcrumbs={[
          { label: "Dashboard", href: ROUTES.dashboard },
          { label: "Workspaces" },
        ]}
        actions={<CreateWorkspaceDialog />}
      />

      {!workspaces?.length ? (
        <WorkspacesEmptyState />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {workspaces.map((workspace) => (
            <WorkspaceCard key={workspace.id} workspace={workspace} />
          ))}
        </div>
      )}
    </div>
  );
}
