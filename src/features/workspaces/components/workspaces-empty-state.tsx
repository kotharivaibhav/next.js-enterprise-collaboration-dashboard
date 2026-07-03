import { Building2 } from "lucide-react";

import { CreateWorkspaceDialog } from "@/features/workspaces/components/create-workspace-dialog";

export function WorkspacesEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed px-6 py-16 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <Building2 className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium">No workspaces yet</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Create your first workspace to start organizing channels, boards, and
        documents with your team.
      </p>
      <div className="mt-6">
        <CreateWorkspaceDialog />
      </div>
    </div>
  );
}
