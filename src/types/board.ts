export interface Board {
  id: string;
  workspace_id: string;
  name: string;
  description: string | null;
  created_by: string;
  is_active: boolean;
  created_at: string;
}

export interface BoardList {
  id: string;
  board_id: string;
  workspace_id: string;
  name: string;
  position: number;
  is_active: boolean;
  created_at: string;
}

export interface Card {
  id: string;
  board_id: string;
  list_id: string;
  workspace_id: string;
  title: string;
  description: string | null;
  position: number;
  due_date: string | null;
  labels: string[];
  assignee_ids: string[];
  created_by: string;
  version: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateBoardRequest {
  name: string;
  description?: string | null;
}

export interface CreateBoardListRequest {
  name: string;
}

export interface CreateCardRequest {
  title: string;
  description?: string | null;
  due_date?: string | null;
  labels?: string[];
  assignee_ids?: string[];
}

export interface UpdateCardRequest {
  version: number;
  list_id?: string;
  position?: number;
  title?: string;
  description?: string | null;
  due_date?: string | null;
  labels?: string[];
  assignee_ids?: string[];
}
