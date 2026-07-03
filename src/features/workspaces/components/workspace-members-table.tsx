"use client";

import { MoreHorizontal, Trash2 } from "lucide-react";
import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  useRemoveWorkspaceMember,
  useUpdateWorkspaceMemberRole,
  useWorkspacePermissions,
} from "@/features/workspaces/hooks/use-workspaces";
import { formatWorkspaceRole } from "@/features/workspaces/utils/permissions";
import type {
  Workspace,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/workspace";
import { useAuthStore } from "@/store/auth-store";

interface WorkspaceMembersTableProps {
  workspace: Workspace;
  members: WorkspaceMember[];
}

function formatUserLabel(
  member: WorkspaceMember,
  currentUserId: string | undefined,
  ownerId: string,
): string {
  if (member.user_id === currentUserId) {
    return "You";
  }
  if (member.user_id === ownerId) {
    return `${member.user_id.slice(0, 8)}… (owner)`;
  }
  return `${member.user_id.slice(0, 8)}…`;
}

export function WorkspaceMembersTable({
  workspace,
  members,
}: WorkspaceMembersTableProps) {
  const currentUser = useAuthStore((state) => state.user);
  const permissions = useWorkspacePermissions(workspace.id);
  const updateRole = useUpdateWorkspaceMemberRole(workspace.id);
  const removeMember = useRemoveWorkspaceMember(workspace.id);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const handleRoleChange = async (
    memberUserId: string,
    role: WorkspaceRole,
  ) => {
    setUpdatingUserId(memberUserId);
    try {
      await updateRole.mutateAsync({ memberUserId, role });
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Joined</TableHead>
            {permissions.canManageMembers && (
              <TableHead className="w-12 text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => {
            const isOwner = member.user_id === workspace.owner_id;
            const canEditRole = permissions.canManageMembers && !isOwner;
            const canRemove = permissions.canRemoveMember(member.user_id);

            return (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatUserLabel(
                        member,
                        currentUser?.id,
                        workspace.owner_id,
                      )}
                    </span>
                    {isOwner && <Badge variant="secondary">Owner</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {member.user_id}
                  </p>
                </TableCell>
                <TableCell>
                  {canEditRole ? (
                    <Select
                      value={member.role}
                      onValueChange={(value) =>
                        handleRoleChange(member.user_id, value as WorkspaceRole)
                      }
                      disabled={updatingUserId === member.user_id}
                    >
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="member">Member</SelectItem>
                        <SelectItem value="guest">Guest</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <Badge variant="outline">
                      {formatWorkspaceRole(member.role)}
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(member.joined_at).toLocaleDateString()}
                </TableCell>
                {permissions.canManageMembers && (
                  <TableCell className="text-right">
                    {canRemove ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          className={buttonVariants({
                            variant: "ghost",
                            size: "icon-sm",
                          })}
                        >
                          <MoreHorizontal className="size-4" />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() => removeMember.mutate(member.user_id)}
                            disabled={removeMember.isPending}
                          >
                            <Trash2 className="size-4" />
                            Remove member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : null}
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
