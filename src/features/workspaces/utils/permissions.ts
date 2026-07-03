import type { User } from "@/types/auth";
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/workspace";

export interface WorkspacePermissions {
  role: WorkspaceRole | null;
  isOwner: boolean;
  isAdmin: boolean;
  canView: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canRemoveMember: (memberUserId: string) => boolean;
}

export function getWorkspacePermissions(
  workspace: Workspace | undefined,
  members: WorkspaceMember[] | undefined,
  currentUser: User | undefined,
): WorkspacePermissions {
  const empty: WorkspacePermissions = {
    role: null,
    isOwner: false,
    isAdmin: false,
    canView: false,
    canUpdate: false,
    canDelete: false,
    canManageMembers: false,
    canRemoveMember: () => false,
  };

  if (!workspace || !currentUser) {
    return empty;
  }

  const membership = members?.find(
    (member) => member.user_id === currentUser.id,
  );
  const role = membership?.role ?? null;
  const isOwner = workspace.owner_id === currentUser.id;
  const isAdmin = role === "admin";

  return {
    role,
    isOwner,
    isAdmin,
    canView: Boolean(membership),
    canUpdate: isAdmin,
    canDelete: isOwner || isAdmin,
    canManageMembers: isAdmin,
    canRemoveMember: (memberUserId: string) =>
      isAdmin && memberUserId !== workspace.owner_id,
  };
}

export function formatWorkspaceRole(role: WorkspaceRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}
