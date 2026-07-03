import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { ROUTES } from "@/constants/routes";
import { DOCUMENT_QUERY_KEYS } from "@/features/documents/constants/query-keys";
import type { CreateDocumentFormValues } from "@/features/documents/schemas/document.schema";
import { documentService } from "@/features/documents/services/document.service";
import {
  defaultBlockContent,
  getNextBlockPosition,
} from "@/features/documents/utils/blocks";
import { parseApiError } from "@/services/api/errors";
import type {
  BlockType,
  Document,
  DocumentBlock,
  DocumentDetail,
} from "@/types/document";
import type { DocumentUpdatedEventData } from "@/types/realtime";

function invalidateDocumentList(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
) {
  queryClient.invalidateQueries({
    queryKey: DOCUMENT_QUERY_KEYS.list(workspaceId),
  });
}

function invalidateDocumentDetail(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  documentId: string,
) {
  queryClient.invalidateQueries({
    queryKey: DOCUMENT_QUERY_KEYS.detail(workspaceId, documentId),
  });
}

function handleConflict(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  documentId: string,
  message: string,
) {
  invalidateDocumentDetail(queryClient, workspaceId, documentId);
  toast.error(message);
}

export function useDocuments(workspaceId: string) {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.list(workspaceId),
    queryFn: () => documentService.list(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useDocumentDetail(workspaceId: string, documentId: string) {
  return useQuery({
    queryKey: DOCUMENT_QUERY_KEYS.detail(workspaceId, documentId),
    queryFn: () => documentService.getDetail(workspaceId, documentId),
    enabled: Boolean(workspaceId && documentId),
  });
}

export function useCreateDocument(workspaceId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateDocumentFormValues) =>
      documentService.create(workspaceId, { title: payload.title.trim() }),
    onSuccess: (detail) => {
      invalidateDocumentList(queryClient, workspaceId);
      queryClient.setQueryData(
        DOCUMENT_QUERY_KEYS.detail(workspaceId, detail.document.id),
        detail,
      );
      toast.success("Document created");
      router.push(ROUTES.workspaceDocument(workspaceId, detail.document.id));
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
}

export function useDeleteDocument(workspaceId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (documentId: string) =>
      documentService.remove(workspaceId, documentId),
    onSuccess: () => {
      invalidateDocumentList(queryClient, workspaceId);
      toast.success("Document deleted");
      router.push(ROUTES.workspaceDocuments(workspaceId));
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
}

export function useUpdateDocumentTitle(
  workspaceId: string,
  documentId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ document, title }: { document: Document; title: string }) =>
      documentService.update(workspaceId, documentId, {
        version: document.version,
        title: title.trim(),
      }),
    onSuccess: (updatedDocument) => {
      queryClient.setQueryData<DocumentDetail>(
        DOCUMENT_QUERY_KEYS.detail(workspaceId, documentId),
        (old) =>
          old
            ? { ...old, document: updatedDocument }
            : { document: updatedDocument, blocks: [] },
      );
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        handleConflict(
          queryClient,
          workspaceId,
          documentId,
          "Document was modified by another user. Refreshed.",
        );
        return;
      }
      toast.error(parseApiError(error));
    },
  });
}

export function useCreateBlock(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      blockType,
    }: {
      blockType: BlockType;
      blocks: DocumentBlock[];
    }) =>
      documentService.createBlock(workspaceId, documentId, {
        block_type: blockType,
        content: defaultBlockContent(blockType),
        parent_id: null,
      }),
    onSuccess: (block) => {
      queryClient.setQueryData<DocumentDetail>(
        DOCUMENT_QUERY_KEYS.detail(workspaceId, documentId),
        (old) =>
          old
            ? { ...old, blocks: [...old.blocks, block] }
            : { document: {} as Document, blocks: [block] },
      );
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        handleConflict(
          queryClient,
          workspaceId,
          documentId,
          "Could not add block. Document refreshed.",
        );
        return;
      }
      toast.error(parseApiError(error));
    },
  });
}

export function useUpdateBlock(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      block,
      content,
      blockType,
    }: {
      block: DocumentBlock;
      content?: Record<string, unknown>;
      blockType?: BlockType;
    }) =>
      documentService.updateBlock(workspaceId, documentId, block.id, {
        version: block.version,
        content,
        block_type: blockType,
      }),
    onSuccess: (updatedBlock) => {
      queryClient.setQueryData<DocumentDetail>(
        DOCUMENT_QUERY_KEYS.detail(workspaceId, documentId),
        (old) =>
          old
            ? {
                ...old,
                blocks: old.blocks.map((item) =>
                  item.id === updatedBlock.id ? updatedBlock : item,
                ),
              }
            : old,
      );
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        handleConflict(
          queryClient,
          workspaceId,
          documentId,
          "Block was modified by another user. Refreshed.",
        );
        return;
      }
      toast.error(parseApiError(error));
    },
  });
}

export function useDeleteBlock(workspaceId: string, documentId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (blockId: string) =>
      documentService.removeBlock(workspaceId, documentId, blockId),
    onSuccess: (_, blockId) => {
      queryClient.setQueryData<DocumentDetail>(
        DOCUMENT_QUERY_KEYS.detail(workspaceId, documentId),
        (old) =>
          old
            ? {
                ...old,
                blocks: old.blocks.filter((block) => block.id !== blockId),
              }
            : old,
      );
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
}

export function applyDocumentUpdatedToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  documentId: string,
  data: DocumentUpdatedEventData,
) {
  queryClient.setQueryData<DocumentDetail>(
    DOCUMENT_QUERY_KEYS.detail(workspaceId, documentId),
    (old) => {
      if (!old) return old;

      const nextDocument: Document = {
        ...old.document,
        title: data.title,
        version: data.version,
        updated_at: data.updated_at,
      };

      let nextBlocks = [...old.blocks];

      if (data.change_type === "block_created" && data.block) {
        const exists = nextBlocks.some((block) => block.id === data.block!.id);
        if (!exists) {
          nextBlocks.push(snapshotToBlock(data.block, documentId, workspaceId));
        }
      }

      if (data.change_type === "block_updated" && data.block) {
        nextBlocks = nextBlocks.map((block) =>
          block.id === data.block!.id
            ? {
                ...block,
                block_type: data.block!
                  .block_type as DocumentBlock["block_type"],
                content: data.block!.content,
                position: data.block!.position,
                version: data.block!.version,
                parent_id: data.block!.parent_id,
              }
            : block,
        );
      }

      if (data.change_type === "block_deleted" && data.block) {
        nextBlocks = nextBlocks.filter((block) => block.id !== data.block!.id);
      }

      return { document: nextDocument, blocks: nextBlocks };
    },
  );
}

function snapshotToBlock(
  snapshot: NonNullable<DocumentUpdatedEventData["block"]>,
  documentId: string,
  workspaceId: string,
): DocumentBlock {
  return {
    id: snapshot.id,
    document_id: documentId,
    workspace_id: workspaceId,
    parent_id: snapshot.parent_id,
    block_type: snapshot.block_type as DocumentBlock["block_type"],
    content: snapshot.content,
    position: snapshot.position,
    created_by: "",
    version: snapshot.version,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

export { getNextBlockPosition };
