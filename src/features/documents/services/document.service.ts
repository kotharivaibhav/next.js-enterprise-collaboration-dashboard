import { apiClient } from "@/services/api/client";
import type {
  CreateBlockRequest,
  CreateDocumentRequest,
  Document,
  DocumentBlock,
  DocumentDetail,
  UpdateBlockRequest,
  UpdateDocumentRequest,
} from "@/types/document";

export const documentService = {
  async list(workspaceId: string): Promise<Document[]> {
    const { data } = await apiClient.get<Document[]>(
      `/workspaces/${workspaceId}/documents`,
    );
    return data;
  },

  async getDetail(
    workspaceId: string,
    documentId: string,
  ): Promise<DocumentDetail> {
    const { data } = await apiClient.get<DocumentDetail>(
      `/workspaces/${workspaceId}/documents/${documentId}`,
    );
    return data;
  },

  async create(
    workspaceId: string,
    payload: CreateDocumentRequest,
  ): Promise<DocumentDetail> {
    const { data } = await apiClient.post<Document>(
      `/workspaces/${workspaceId}/documents`,
      payload,
    );
    return { document: data, blocks: [] };
  },

  async update(
    workspaceId: string,
    documentId: string,
    payload: UpdateDocumentRequest,
  ): Promise<Document> {
    const { data } = await apiClient.patch<Document>(
      `/workspaces/${workspaceId}/documents/${documentId}`,
      payload,
    );
    return data;
  },

  async remove(workspaceId: string, documentId: string): Promise<void> {
    await apiClient.delete(
      `/workspaces/${workspaceId}/documents/${documentId}`,
    );
  },

  async createBlock(
    workspaceId: string,
    documentId: string,
    payload: CreateBlockRequest,
  ): Promise<DocumentBlock> {
    const { data } = await apiClient.post<DocumentBlock>(
      `/workspaces/${workspaceId}/documents/${documentId}/blocks`,
      payload,
    );
    return data;
  },

  async updateBlock(
    workspaceId: string,
    documentId: string,
    blockId: string,
    payload: UpdateBlockRequest,
  ): Promise<DocumentBlock> {
    const { data } = await apiClient.patch<DocumentBlock>(
      `/workspaces/${workspaceId}/documents/${documentId}/blocks/${blockId}`,
      payload,
    );
    return data;
  },

  async removeBlock(
    workspaceId: string,
    documentId: string,
    blockId: string,
  ): Promise<void> {
    await apiClient.delete(
      `/workspaces/${workspaceId}/documents/${documentId}/blocks/${blockId}`,
    );
  },
};
