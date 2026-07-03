export type WorkspaceRole = "admin" | "member" | "guest";

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  owner_id: string;
  is_active: boolean;
  created_at: string;
}

export interface WorkspaceMember {
  id: string;
  workspace_id: string;
  user_id: string;
  role: WorkspaceRole;
  joined_at: string;
}

export interface CreateWorkspaceRequest {
  name: string;
  description?: string | null;
}

export interface UpdateWorkspaceRequest {
  name?: string | null;
  description?: string | null;
}

export interface AddMemberRequest {
  email: string;
  role?: WorkspaceRole;
}

export interface UpdateMemberRoleRequest {
  role: WorkspaceRole;
}
