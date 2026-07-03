"use client";

import { FileText } from "lucide-react";
import Link from "next/link";

import { Skeleton } from "@/components/ui/skeleton";
import { CreateDocumentDialog } from "@/features/documents/components/create-document-dialog";
import { useDocuments } from "@/features/documents/hooks/use-documents";
import { ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

interface DocumentSidebarProps {
  workspaceId: string;
  activeDocumentId?: string;
}

export function DocumentSidebar({
  workspaceId,
  activeDocumentId,
}: DocumentSidebarProps) {
  const { data: documents, isLoading } = useDocuments(workspaceId);

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground">
      <div className="flex items-center justify-between border-b px-3 py-3">
        <h2 className="text-sm font-semibold">Documents</h2>
        <CreateDocumentDialog
          workspaceId={workspaceId}
          trigger={
            <button
              type="button"
              className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-sidebar-accent"
            >
              +
            </button>
          }
        />
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {isLoading &&
          Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-full" />
          ))}
        {documents?.map((document) => (
          <Link
            key={document.id}
            href={ROUTES.workspaceDocument(workspaceId, document.id)}
            className={cn(
              "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-sidebar-accent",
              document.id === activeDocumentId &&
                "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
            )}
          >
            <FileText className="size-4 shrink-0 opacity-70" />
            <span className="truncate">{document.title}</span>
          </Link>
        ))}
        {!isLoading && documents?.length === 0 && (
          <p className="px-2 py-4 text-xs text-muted-foreground">
            No documents yet.
          </p>
        )}
      </nav>
    </aside>
  );
}
