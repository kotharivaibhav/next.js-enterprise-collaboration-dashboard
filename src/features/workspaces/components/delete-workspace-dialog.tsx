"use client";

import { Trash2 } from "lucide-react";
import { useState } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  useDeleteWorkspace,
  useWorkspacePermissions,
} from "@/features/workspaces/hooks/use-workspaces";

interface DeleteWorkspaceDialogProps {
  workspaceId: string;
  workspaceName: string;
}

export function DeleteWorkspaceDialog({
  workspaceId,
  workspaceName,
}: DeleteWorkspaceDialogProps) {
  const [open, setOpen] = useState(false);
  const permissions = useWorkspacePermissions(workspaceId);
  const deleteWorkspace = useDeleteWorkspace();

  if (!permissions.canDelete) {
    return null;
  }

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger>
        <Button variant="destructive">
          <Trash2 className="size-4" />
          Delete workspace
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete workspace?</AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently deactivate &quot;{workspaceName}&quot;. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleteWorkspace.isPending}
            onClick={async () => {
              await deleteWorkspace.mutateAsync(workspaceId);
              setOpen(false);
            }}
          >
            {deleteWorkspace.isPending ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
