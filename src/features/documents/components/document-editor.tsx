"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  AddBlockMenu,
  BlockEditor,
} from "@/features/documents/components/block-editor";
import {
  useDeleteDocument,
  useDocumentDetail,
  useUpdateDocumentTitle,
} from "@/features/documents/hooks/use-documents";
import { useRealtimeDocument } from "@/features/documents/hooks/use-realtime-document";
import { getRootBlocks } from "@/features/documents/utils/blocks";
import type { Document } from "@/types/document";
import { useWorkspaceStore } from "@/store/workspace-store";

interface DocumentTitleFieldProps {
  document: Document;
  onSave: (title: string) => void;
}

function DocumentTitleField({ document, onSave }: DocumentTitleFieldProps) {
  const [title, setTitle] = useState(document.title);

  const saveTitle = () => {
    const trimmed = title.trim();
    if (!trimmed || trimmed === document.title) return;
    onSave(trimmed);
  };

  return (
    <Input
      value={title}
      onChange={(event) => setTitle(event.target.value)}
      onBlur={saveTitle}
      className="mb-8 border-0 px-0 text-3xl font-bold shadow-none focus-visible:ring-0"
      placeholder="Untitled"
    />
  );
}

interface DocumentEditorProps {
  workspaceId: string;
  documentId: string;
}

export function DocumentEditor({
  workspaceId,
  documentId,
}: DocumentEditorProps) {
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const { data, isLoading, isError } = useDocumentDetail(
    workspaceId,
    documentId,
  );
  const updateTitle = useUpdateDocumentTitle(workspaceId, documentId);
  const deleteDocument = useDeleteDocument(workspaceId);
  const [deleteOpen, setDeleteOpen] = useState(false);

  useRealtimeDocument(workspaceId, documentId);

  useEffect(() => {
    setActiveWorkspaceId(workspaceId);
  }, [workspaceId, setActiveWorkspaceId]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner label="Loading document" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-1 items-center justify-center text-sm text-destructive">
        Document not found or you do not have access.
      </div>
    );
  }

  const rootBlocks = getRootBlocks(data.blocks);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center justify-between border-b px-4">
        <p className="text-xs text-muted-foreground">
          v{data.document.version} · collaborative page
        </p>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              variant="destructive"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 className="size-4" />
              Delete document
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-3xl px-6 py-8">
          <DocumentTitleField
            key={`${data.document.id}-${data.document.version}`}
            document={data.document}
            onSave={(title) =>
              updateTitle.mutate({ document: data.document, title })
            }
          />

          <div className="space-y-1">
            {rootBlocks.map((block) => (
              <BlockEditor
                key={block.id}
                workspaceId={workspaceId}
                documentId={documentId}
                block={block}
              />
            ))}
          </div>

          {rootBlocks.length === 0 && (
            <p className="py-8 text-center text-sm text-muted-foreground">
              This page is empty. Add your first block below.
            </p>
          )}

          <div className="mt-6">
            <AddBlockMenu
              workspaceId={workspaceId}
              documentId={documentId}
              blocks={data.blocks}
            />
          </div>
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate &quot;{data.document.title}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={deleteDocument.isPending}
              onClick={async () => {
                await deleteDocument.mutateAsync(documentId);
                setDeleteOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
