import { apiClient } from "@/services/api/client";
import type {
  Board,
  BoardList,
  Card,
  CreateBoardListRequest,
  CreateBoardRequest,
  CreateCardRequest,
  UpdateCardRequest,
} from "@/types/board";

export const boardService = {
  async list(workspaceId: string): Promise<Board[]> {
    const { data } = await apiClient.get<Board[]>(
      `/workspaces/${workspaceId}/boards`,
    );
    return data;
  },

  async getById(workspaceId: string, boardId: string): Promise<Board> {
    const { data } = await apiClient.get<Board>(
      `/workspaces/${workspaceId}/boards/${boardId}`,
    );
    return data;
  },

  async create(
    workspaceId: string,
    payload: CreateBoardRequest,
  ): Promise<Board> {
    const { data } = await apiClient.post<Board>(
      `/workspaces/${workspaceId}/boards`,
      payload,
    );
    return data;
  },

  async remove(workspaceId: string, boardId: string): Promise<void> {
    await apiClient.delete(`/workspaces/${workspaceId}/boards/${boardId}`);
  },

  async listLists(workspaceId: string, boardId: string): Promise<BoardList[]> {
    const { data } = await apiClient.get<BoardList[]>(
      `/workspaces/${workspaceId}/boards/${boardId}/lists`,
    );
    return data;
  },

  async createList(
    workspaceId: string,
    boardId: string,
    payload: CreateBoardListRequest,
  ): Promise<BoardList> {
    const { data } = await apiClient.post<BoardList>(
      `/workspaces/${workspaceId}/boards/${boardId}/lists`,
      payload,
    );
    return data;
  },

  async listCards(
    workspaceId: string,
    boardId: string,
    listId: string,
  ): Promise<Card[]> {
    const { data } = await apiClient.get<Card[]>(
      `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards`,
    );
    return data;
  },

  async createCard(
    workspaceId: string,
    boardId: string,
    listId: string,
    payload: CreateCardRequest,
  ): Promise<Card> {
    const { data } = await apiClient.post<Card>(
      `/workspaces/${workspaceId}/boards/${boardId}/lists/${listId}/cards`,
      payload,
    );
    return data;
  },

  async updateCard(
    workspaceId: string,
    boardId: string,
    cardId: string,
    payload: UpdateCardRequest,
  ): Promise<Card> {
    const { data } = await apiClient.patch<Card>(
      `/workspaces/${workspaceId}/boards/${boardId}/cards/${cardId}`,
      payload,
    );
    return data;
  },
};
