import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { toast } from "sonner";
import { isAxiosError } from "axios";

import { ROUTES } from "@/constants/routes";
import { BOARD_QUERY_KEYS } from "@/features/boards/constants/query-keys";
import type {
  CreateBoardFormValues,
  CreateBoardListFormValues,
  CreateCardFormValues,
  UpdateCardFormValues,
} from "@/features/boards/schemas/board.schema";
import { boardService } from "@/features/boards/services/board.service";
import { sortCardsByPosition } from "@/features/boards/utils/position";
import { parseApiError } from "@/services/api/errors";
import type { Card } from "@/types/board";

function invalidateBoardList(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
) {
  queryClient.invalidateQueries({
    queryKey: BOARD_QUERY_KEYS.list(workspaceId),
  });
}

function invalidateBoardData(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  boardId: string,
) {
  queryClient.invalidateQueries({
    queryKey: BOARD_QUERY_KEYS.lists(workspaceId, boardId),
  });
  queryClient.invalidateQueries({
    queryKey: [...BOARD_QUERY_KEYS.all, "cards", workspaceId, boardId],
  });
}

export function useBoards(workspaceId: string) {
  return useQuery({
    queryKey: BOARD_QUERY_KEYS.list(workspaceId),
    queryFn: () => boardService.list(workspaceId),
    enabled: Boolean(workspaceId),
  });
}

export function useBoard(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: BOARD_QUERY_KEYS.detail(workspaceId, boardId),
    queryFn: () => boardService.getById(workspaceId, boardId),
    enabled: Boolean(workspaceId && boardId),
  });
}

export function useBoardLists(workspaceId: string, boardId: string) {
  return useQuery({
    queryKey: BOARD_QUERY_KEYS.lists(workspaceId, boardId),
    queryFn: () => boardService.listLists(workspaceId, boardId),
    enabled: Boolean(workspaceId && boardId),
  });
}

export function useBoardCards(
  workspaceId: string,
  boardId: string,
  listIds: string[],
) {
  const queries = useQueries({
    queries: listIds.map((listId) => ({
      queryKey: BOARD_QUERY_KEYS.cards(workspaceId, boardId, listId),
      queryFn: () => boardService.listCards(workspaceId, boardId, listId),
      enabled: Boolean(workspaceId && boardId && listId),
    })),
  });

  const cardsByList = useMemo(() => {
    const map: Record<string, Card[]> = {};
    listIds.forEach((listId, index) => {
      map[listId] = sortCardsByPosition(queries[index]?.data ?? []);
    });
    return map;
  }, [listIds, queries]);

  const isLoading = queries.some((query) => query.isLoading);
  const isError = queries.some((query) => query.isError);

  return { cardsByList, isLoading, isError, queries };
}

export function useCreateBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (payload: CreateBoardFormValues) =>
      boardService.create(workspaceId, {
        name: payload.name.trim(),
        description: payload.description?.trim() || null,
      }),
    onSuccess: (board) => {
      invalidateBoardList(queryClient, workspaceId);
      toast.success(`Board "${board.name}" created`);
      router.push(ROUTES.workspaceBoard(workspaceId, board.id));
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
}

export function useDeleteBoard(workspaceId: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (boardId: string) => boardService.remove(workspaceId, boardId),
    onSuccess: () => {
      invalidateBoardList(queryClient, workspaceId);
      toast.success("Board deleted");
      router.push(ROUTES.workspaceBoards(workspaceId));
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
}

export function useCreateBoardList(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateBoardListFormValues) =>
      boardService.createList(workspaceId, boardId, {
        name: payload.name.trim(),
      }),
    onSuccess: () => {
      invalidateBoardData(queryClient, workspaceId, boardId);
      toast.success("List created");
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
}

export function useCreateCard(
  workspaceId: string,
  boardId: string,
  listId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateCardFormValues) =>
      boardService.createCard(workspaceId, boardId, listId, {
        title: payload.title.trim(),
        description: payload.description?.trim() || null,
      }),
    onSuccess: (card) => {
      queryClient.setQueryData<Card[]>(
        BOARD_QUERY_KEYS.cards(workspaceId, boardId, listId),
        (old = []) => sortCardsByPosition([...old, card]),
      );
      toast.success("Card created");
    },
    onError: (error) => toast.error(parseApiError(error)),
  });
}

export function useMoveCard(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      card,
      listId,
      position,
    }: {
      card: Card;
      listId: string;
      position: number;
    }) =>
      boardService.updateCard(workspaceId, boardId, card.id, {
        version: card.version,
        list_id: listId,
        position,
      }),
    onSuccess: (updatedCard, { card }) => {
      const sourceKey = BOARD_QUERY_KEYS.cards(
        workspaceId,
        boardId,
        card.list_id,
      );
      const targetKey = BOARD_QUERY_KEYS.cards(
        workspaceId,
        boardId,
        updatedCard.list_id,
      );

      queryClient.setQueryData<Card[]>(sourceKey, (old = []) =>
        sortCardsByPosition(old.filter((item) => item.id !== card.id)),
      );

      queryClient.setQueryData<Card[]>(targetKey, (old = []) =>
        sortCardsByPosition([
          ...old.filter((item) => item.id !== updatedCard.id),
          updatedCard,
        ]),
      );
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        invalidateBoardData(queryClient, workspaceId, boardId);
        toast.error("Card was updated by someone else. Board refreshed.");
        return;
      }
      toast.error(parseApiError(error));
    },
  });
}

export function useUpdateCard(workspaceId: string, boardId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      card,
      values,
    }: {
      card: Card;
      values: UpdateCardFormValues;
    }) => {
      const labels = values.labels
        ? values.labels
            .split(",")
            .map((label) => label.trim())
            .filter(Boolean)
        : undefined;

      return boardService.updateCard(workspaceId, boardId, card.id, {
        version: card.version,
        title: values.title.trim(),
        description: values.description?.trim() || null,
        due_date: values.due_date || null,
        labels,
      });
    },
    onSuccess: (updatedCard) => {
      queryClient.setQueryData<Card[]>(
        BOARD_QUERY_KEYS.cards(workspaceId, boardId, updatedCard.list_id),
        (old = []) =>
          sortCardsByPosition(
            old.map((item) =>
              item.id === updatedCard.id ? updatedCard : item,
            ),
          ),
      );
      toast.success("Card updated");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 409) {
        invalidateBoardData(queryClient, workspaceId, boardId);
        toast.error("Card was modified by another user. Board refreshed.");
        return;
      }
      toast.error(parseApiError(error));
    },
  });
}

export function applyCardMovedToCache(
  queryClient: ReturnType<typeof useQueryClient>,
  workspaceId: string,
  boardId: string,
  data: {
    card_id: string;
    list_id: string;
    previous_list_id: string;
    position: number;
    version: number;
    updated_at: string;
  },
) {
  const sourceKey = BOARD_QUERY_KEYS.cards(
    workspaceId,
    boardId,
    data.previous_list_id,
  );
  const targetKey = BOARD_QUERY_KEYS.cards(workspaceId, boardId, data.list_id);

  let movedCard: Card | undefined;

  queryClient.setQueryData<Card[]>(sourceKey, (old = []) => {
    const card = old.find((item) => item.id === data.card_id);
    if (card) {
      movedCard = {
        ...card,
        list_id: data.list_id,
        position: data.position,
        version: data.version,
        updated_at: data.updated_at,
      };
    }
    return sortCardsByPosition(old.filter((item) => item.id !== data.card_id));
  });

  if (!movedCard) return;

  queryClient.setQueryData<Card[]>(targetKey, (old = []) =>
    sortCardsByPosition([
      ...old.filter((item) => item.id !== data.card_id),
      movedCard!,
    ]),
  );
}
