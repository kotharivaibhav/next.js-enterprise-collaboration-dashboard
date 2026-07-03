import { describe, expect, it } from "vitest";

import { getWorkspacePermissions } from "@/features/workspaces/utils/permissions";
import type { User } from "@/types/auth";
import type { Workspace, WorkspaceMember } from "@/types/workspace";

const workspace: Workspace = {
  id: "ws-1",
  name: "Engineering",
  slug: "engineering",
  description: null,
  owner_id: "user-owner",
  is_active: true,
  created_at: "2026-01-01T00:00:00Z",
};

const members: WorkspaceMember[] = [
  {
    id: "m-1",
    workspace_id: "ws-1",
    user_id: "user-owner",
    role: "member",
    joined_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "m-2",
    workspace_id: "ws-1",
    user_id: "user-admin",
    role: "admin",
    joined_at: "2026-01-02T00:00:00Z",
  },
];

const owner: User = {
  id: "user-owner",
  email: "owner@example.com",
  full_name: "Owner User",
  is_active: true,
  is_verified: true,
  role: "member",
  created_at: "2026-01-01T00:00:00Z",
};

const admin: User = {
  ...owner,
  id: "user-admin",
  email: "admin@example.com",
  full_name: "Admin User",
};

const guestMember: User = {
  ...owner,
  id: "user-guest",
  email: "guest@example.com",
};

describe("getWorkspacePermissions", () => {
  it("allows owner to delete even when demoted to member role", () => {
    const permissions = getWorkspacePermissions(workspace, members, owner);
    expect(permissions.canDelete).toBe(true);
    expect(permissions.canUpdate).toBe(false);
  });

  it("allows admin to manage members and update workspace", () => {
    const permissions = getWorkspacePermissions(workspace, members, admin);
    expect(permissions.canUpdate).toBe(true);
    expect(permissions.canManageMembers).toBe(true);
    expect(permissions.canDelete).toBe(true);
  });

  it("prevents removing the workspace owner", () => {
    const permissions = getWorkspacePermissions(workspace, members, admin);
    expect(permissions.canRemoveMember("user-owner")).toBe(false);
    expect(permissions.canRemoveMember("user-guest")).toBe(true);
  });

  it("denies access for non-members", () => {
    const permissions = getWorkspacePermissions(
      workspace,
      members,
      guestMember,
    );
    expect(permissions.canView).toBe(false);
    expect(permissions.canManageMembers).toBe(false);
  });
});
