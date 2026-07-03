"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  updateWorkspaceSchema,
  type UpdateWorkspaceFormValues,
} from "@/features/workspaces/schemas/workspace.schema";
import {
  useUpdateWorkspace,
  useWorkspacePermissions,
} from "@/features/workspaces/hooks/use-workspaces";
import type { Workspace } from "@/types/workspace";

interface WorkspaceSettingsFormProps {
  workspace: Workspace;
}

export function WorkspaceSettingsForm({
  workspace,
}: WorkspaceSettingsFormProps) {
  const permissions = useWorkspacePermissions(workspace.id);
  const updateWorkspace = useUpdateWorkspace(workspace.id);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateWorkspaceFormValues>({
    resolver: zodResolver(updateWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description ?? "",
    },
  });

  useEffect(() => {
    reset({
      name: workspace.name,
      description: workspace.description ?? "",
    });
  }, [workspace, reset]);

  if (!permissions.canUpdate) {
    return (
      <p className="text-sm text-muted-foreground">
        You need admin permissions to edit this workspace.
      </p>
    );
  }

  return (
    <form
      onSubmit={handleSubmit((values) => updateWorkspace.mutate(values))}
      className="max-w-xl space-y-4"
    >
      <div className="space-y-2">
        <Label htmlFor="edit-workspace-name">Name</Label>
        <Input id="edit-workspace-name" {...register("name")} />
        {errors.name && (
          <p className="text-sm text-destructive">{errors.name.message}</p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="edit-workspace-description">Description</Label>
        <Textarea
          id="edit-workspace-description"
          rows={4}
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>
      <Button type="submit" disabled={!isDirty || updateWorkspace.isPending}>
        {updateWorkspace.isPending ? "Saving..." : "Save changes"}
      </Button>
    </form>
  );
}
