import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { ROUTES } from "@/constants/routes";
import { CHANNEL_QUERY_KEYS } from "@/features/channels/constants/query-keys";
import type {
  CreateChannelFormValues,
  CreateMessageFormValues,
} from "@/features/channels/schemas/channel.schema";
import { channelService } from "@/features/channels/services/channel.service";
import { buildMessageMetadata } from "@/features/channels/utils/mentions";
import { useWorkspacePermissions } from "@/features/workspaces/hooks/use-workspaces";
import { parseApiError } from "@/services/api/errors";
import { useAuthStore } from "@/store/auth-store";
import type { Message } from "@/types/channel";

const MESSAGE_PAGE_SIZE = 50;

function invalidateChannelQueries(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  channelId?: string,
) {
  queryClient.invalidateQueries({
    queryKey: CHANNEL_QUERY_KEYS.list(workspaceId),
  });
  if (channelId) {
    queryClient.invalidateQueries({
      queryKey: CHANNEL_QUERY_KEYS.detail(workspaceId, channelId),
    });
  }
}

export function useChannels(workspaceId: string) {
  return useQuery({
    queryKey: CHANNEL_QUERY_KEYS.list(workspaceId),
    queryFn: () => channelService.list(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useChannel(workspaceId: string, channelId: string) {
  return useQuery({
    queryKey: CHANNEL_QUERY_KEYS.detail(workspaceId, channelId),
    queryFn: () => channelService.getById(workspaceId, channelId),
    enabled: Boolean(workspaceId && channelId),
  });
}

export function useChannelMessages(
  workspaceId: string,
  channelId: string,
  parentId?: string | null,
) {
  return useInfiniteQuery({
    queryKey: CHANNEL_QUERY_KEYS.messages(workspaceId, channelId, parentId),
    queryFn: ({ pageParam }) =>
      channelService.listMessages(workspaceId, channelId, {
        limit: MESSAGE_PAGE_SIZE,
        cursor: pageParam ?? undefined,
        parent_id: parentId ?? undefined,
      }),
    initialPageParam: null as string | null,
    getNextPageParam: (lastPage) =>
      lastPage.has_more ? lastPage.next_cursor : undefined,
    enabled: Boolean(workspaceId && channelId),
  });
}

export function useCreateChannel(workspaceId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateChannelFormValues) =>
      channelService.create(workspaceId, {
        name: payload.name.trim().toLowerCase(),
        description: payload.description?.trim() || null,
        channel_type: payload.channel_type,
      }),
    onSuccess: (channel) => {
      invalidateChannelQueries(queryClient, workspaceId);
      toast.success(`Channel #${channel.name} created`);
      router.push(ROUTES.workspaceChannel(workspaceId, channel.id));
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useDeleteChannel(workspaceId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (channelId: string) =>
      channelService.remove(workspaceId, channelId),
    onSuccess: () => {
      invalidateChannelQueries(queryClient, workspaceId);
      toast.success("Channel deleted");
      router.push(ROUTES.workspaceChannels(workspaceId));
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useSendMessage(
  workspaceId: string,
  channelId: string,
  parentId?: string | null,
) {
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((state) => state.user);

  return useMutation({
    mutationFn: (payload: CreateMessageFormValues) => {
      const metadata = buildMessageMetadata(
        payload.content,
        currentUser?.email,
      );

      return channelService.sendMessage(workspaceId, channelId, {
        content: payload.content.trim(),
        parent_id: parentId ?? null,
        metadata,
      });
    },
    onSuccess: (message) => {
      const queryKey = CHANNEL_QUERY_KEYS.messages(
        workspaceId,
        channelId,
        parentId,
      );

      queryClient.setQueryData(
        queryKey,
        (
          oldData:
            | { pages: { items: Message[] }[]; pageParams: unknown[] }
            | undefined,
        ) => {
          if (!oldData) return oldData;

          const exists = oldData.pages.some((page) =>
            page.items.some((item) => item.id === message.id),
          );
          if (exists) return oldData;

          const [firstPage, ...rest] = oldData.pages;
          return {
            ...oldData,
            pages: [
              { ...firstPage, items: [message, ...firstPage.items] },
              ...rest,
            ],
          };
        },
      );
    },
    onError: (error) => {
      toast.error(parseApiError(error));
    },
  });
}

export function useChannelPermissions(workspaceId: string, channelId: string) {
  const currentUser = useAuthStore((state) => state.user);
  const workspacePermissions = useWorkspacePermissions(workspaceId);
  const { data: channel } = useChannel(workspaceId, channelId);

  const isCreator = channel?.created_by === currentUser?.id;
  const canDelete = isCreator || workspacePermissions.isAdmin;

  return {
    canPost: workspacePermissions.canView,
    canDelete,
    isCreator,
  };
}

export function flattenMessages(
  pages: { items: Message[] }[] | undefined,
): Message[] {
  if (!pages) return [];

  return pages
    .flatMap((page) => page.items)
    .sort(
      (a, b) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
}
