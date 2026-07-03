"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { CreateWorkspaceDialog } from "@/features/workspaces/components/create-workspace-dialog";
import {
  useSetActiveWorkspace,
  useWorkspaces,
} from "@/features/workspaces/hooks/use-workspaces";
import { cn } from "@/lib/utils";
import { useWorkspaceStore } from "@/store/workspace-store";

interface WorkspaceSwitcherProps {
  collapsed?: boolean;
}

export function WorkspaceSwitcher({ collapsed }: WorkspaceSwitcherProps) {
  const { data: workspaces, isLoading } = useWorkspaces();
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const setActiveWorkspace = useSetActiveWorkspace();

  const activeWorkspace = workspaces?.find(
    (workspace) => workspace.id === activeWorkspaceId,
  );

  if (isLoading) {
    return <Skeleton className={cn("h-9", collapsed ? "w-10" : "w-full")} />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Button
          variant="outline"
          className={cn(
            "justify-between gap-2",
            collapsed ? "size-9 px-0" : "w-full",
          )}
        >
          <span className={cn("truncate", collapsed && "sr-only")}>
            {activeWorkspace?.name ?? "Select workspace"}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-60" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {workspaces?.map((workspace) => (
          <DropdownMenuItem
            key={workspace.id}
            onClick={() => setActiveWorkspace(workspace.id)}
          >
            <span className="flex-1 truncate">{workspace.name}</span>
            {workspace.id === activeWorkspaceId && (
              <Check className="size-4 text-primary" />
            )}
          </DropdownMenuItem>
        ))}
        {workspaces?.length === 0 && (
          <DropdownMenuItem disabled>No workspaces yet</DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <CreateWorkspaceDialog
          trigger={
            <DropdownMenuItem onSelect={(event) => event.preventDefault()}>
              <Plus className="size-4" />
              Create workspace
            </DropdownMenuItem>
          }
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
