export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "todo"
  | "code"
  | "bullet_list";

export interface Document {
  id: string;
  workspace_id: string;
  title: string;
  created_by: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentBlock {
  id: string;
  document_id: string;
  workspace_id: string;
  parent_id: string | null;
  block_type: BlockType;
  content: Record<string, unknown>;
  position: number;
  created_by: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentDetail {
  document: Document;
  blocks: DocumentBlock[];
}

export interface CreateDocumentRequest {
  title: string;
}

export interface UpdateDocumentRequest {
  version: number;
  title: string;
}

export interface CreateBlockRequest {
  block_type: BlockType;
  content?: Record<string, unknown>;
  parent_id?: string | null;
}

export interface UpdateBlockRequest {
  version: number;
  block_type?: BlockType;
  content?: Record<string, unknown>;
  position?: number;
  parent_id?: string | null;
}
