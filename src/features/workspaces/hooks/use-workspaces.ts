import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { WORKSPACE_QUERY_KEYS } from "@/features/workspaces/constants/query-keys";
import type {
  AddMemberFormValues,
  CreateWorkspaceFormValues,
  UpdateMemberRoleFormValues,
  UpdateWorkspaceFormValues,
} from "@/features/workspaces/schemas/workspace.schema";
import { workspaceService } from "@/features/workspaces/services/workspace.service";
import { getWorkspacePermissions } from "@/features/workspaces/utils/permissions";
import { parseApiError } from "@/services/api/errors";
import { useAuthStore } from "@/store/auth-store";
import { useWorkspaceStore } from "@/store/workspace-store";

function invalidateWorkspaceQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId?: string,
) {
  queryClient.invalidateQueries({ queryKey: WORKSPACE_QUERY_KEYS.list() });
  if (workspaceId) {
    queryClient.invalidateQueries({
      queryKey: WORKSPACE_QUERY_KEYS.detail(workspaceId),
    });
    queryClient.invalidateQueries({
      queryKey: WORKSPACE_QUERY_KEYS.members(workspaceId),
    });
  }
}

export function useWorkspaces() {
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );

  const query = useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.list(),
    queryFn: () => workspaceService.list(),
  });

  useEffect(() => {
    if (!query.data?.length) return;

    const hasActiveWorkspace = query.data.some(
      (workspace) => workspace.id === activeWorkspaceId,
    );

    if (!activeWorkspaceId || !hasActiveWorkspace) {
      setActiveWorkspaceId(query.data[0].id);
    }
  }, [query.data, activeWorkspaceId, setActiveWorkspaceId]);

  return query;
}

export function useWorkspace(workspaceId: string) {
  return useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.detail(workspaceId),
    queryFn: () => workspaceService.getById(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useWorkspaceMembers(workspaceId: string) {
  return useQuery({
    queryKey: WORKSPACE_QUERY_KEYS.members(workspaceId),
    queryFn: () => workspaceService.listMembers(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useWorkspacePermissions(workspaceId: string) {
  const currentUser = useAuthStore((state) => state.user);
  const { data: workspace } = useWorkspace(workspaceId);
  const { data: members } = useWorkspaceMembers(workspaceId);

  return useMemo(
    () => getWorkspacePermissions(workspace, members, currentUser ?? undefined),
    [workspace, members, currentUser],
  );
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateWorkspaceFormValues) =>
      workspaceService.create({
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
      }),
    onSuccess: (workspace) => {
      invalidateWorkspaceQueries(queryClient);
      setActiveWorkspaceId(workspace.id);
      toast.success(`Workspace "${workspace.name}" created`);
      router.push(ROUTES.workspaceDetail(workspace.id));
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useUpdateWorkspace(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UpdateWorkspaceFormValues) =>
      workspaceService.update(workspaceId, {
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
      }),
    onSuccess: (workspace) => {
      invalidateWorkspaceQueries(queryClient, workspaceId);
      toast.success("Workspace updated");
      return workspace;
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useDeleteWorkspace() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const activeWorkspaceId = useWorkspaceStore(
    (state) => state.activeWorkspaceId,
  );
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );

  return useMutation({
    mutationFn: (workspaceId: string) => workspaceService.remove(workspaceId),
    onSuccess: (_, workspaceId) => {
      invalidateWorkspaceQueries(queryClient);
      if (activeWorkspaceId === workspaceId) {
        setActiveWorkspaceId(null);
      }
      toast.success("Workspace deleted");
      router.push(ROUTES.workspaces);
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useAddWorkspaceMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddMemberFormValues) =>
      workspaceService.addMember(workspaceId, {
        email: payload.email.trim(),
        role: payload.role,
      }),
    onSuccess: () => {
      invalidateWorkspaceQueries(queryClient, workspaceId);
      toast.success("Member added");
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useUpdateWorkspaceMemberRole(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      memberUserId,
      ...payload
    }: UpdateMemberRoleFormValues & { memberUserId: string }) =>
      workspaceService.updateMemberRole(workspaceId, memberUserId, payload),
    onSuccess: () => {
      invalidateWorkspaceQueries(queryClient, workspaceId);
      toast.success("Member role updated");
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useRemoveWorkspaceMember(workspaceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberUserId: string) =>
      workspaceService.removeMember(workspaceId, memberUserId),
    onSuccess: () => {
      invalidateWorkspaceQueries(queryClient, workspaceId);
      toast.success("Member removed");
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useSetActiveWorkspace() {
  const setActiveWorkspaceId = useWorkspaceStore(
    (state) => state.setActiveWorkspaceId,
  );
  const router = useRouter();

  return (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);
    router.push(ROUTES.workspaceDetail(workspaceId));
  };
}
