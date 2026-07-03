"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

import { DocumentSidebar } from "@/features/documents/components/document-sidebar";
import { DocumentsEmptyState } from "@/features/documents/components/documents-empty-state";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { ROUTES } from "@/constants/routes";
import { useWorkspaceStore } from "@/store/workspace-store";

export function DocumentsLayoutShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams<{ workspaceId: string; documentId?: string }>();
  const workspaceId = params.workspaceId;
  const documentId = params.documentId;
  const router = useRouter();
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const { data: documents, isLoading } = useDocuments(workspaceId);

  useEffect(() => {
    setActiveWorkspaceId(workspaceId);
  }, [workspaceId, setActiveWorkspaceId]);

  useEffect(() => {
    if (isLoading || documentId || !documents?.length) return;
    router.replace(ROUTES.workspaceDocument(workspaceId, documents[0].id));
  }, [isLoading, documentId, documents, workspaceId, router]);

  return (
    <div className="-m-4 flex h-[calc(100dvh-3.5rem)] min-h-0 overflow-hidden md:-m-6">
      <DocumentSidebar
        workspaceId={workspaceId}
        activeDocumentId={documentId}
      />
      <div className="flex min-w-0 flex-1 flex-col bg-background">
        {children ?? <DocumentsEmptyState workspaceId={workspaceId} />}
      </div>
    </div>
  );
}
