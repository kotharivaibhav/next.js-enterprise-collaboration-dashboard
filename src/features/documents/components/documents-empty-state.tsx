"use client";

import { FileText } from "lucide-react";

import { CreateDocumentDialog } from "@/features/documents/components/create-document-dialog";

interface DocumentsEmptyStateProps {
  workspaceId: string;
}

export function DocumentsEmptyState({ workspaceId }: DocumentsEmptyStateProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <FileText className="size-6 text-muted-foreground" />
      </div>
      <h2 className="text-lg font-medium">No document selected</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Pick a document from the sidebar or create a new page.
      </p>
      <div className="mt-6">
        <CreateDocumentDialog workspaceId={workspaceId} />
      </div>
    </div>
  );
}
