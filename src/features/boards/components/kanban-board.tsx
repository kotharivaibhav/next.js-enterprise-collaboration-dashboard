"use client";

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";

import { LoadingSpinner } from "@/components/common/loading-spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CardDetailSheet } from "@/features/boards/components/card-detail-sheet";
import {
  KanbanColumn,
  parseListDroppableId,
} from "@/features/boards/components/kanban-column";
import { KanbanCardOverlay } from "@/features/boards/components/kanban-card";
import {
  createBoardListSchema,
  type CreateBoardListFormValues,
} from "@/features/boards/schemas/board.schema";
import {
  useBoardCards,
  useBoardLists,
  useCreateBoardList,
  useMoveCard,
} from "@/features/boards/hooks/use-boards";
import { useRealtimeBoard } from "@/features/boards/hooks/use-realtime-board";
import { calculateDropPosition } from "@/features/boards/utils/position";
import type { Card } from "@/types/board";

interface KanbanBoardProps {
  workspaceId: string;
  boardId: string;
}

function findCard(
  cardsByList: Record<string, Card[]>,
  cardId: string,
): { card: Card; listId: string } | null {
  for (const [listId, cards] of Object.entries(cardsByList)) {
    const card = cards.find((item) => item.id === cardId);
    if (card) return { card, listId };
  }
  return null;
}

export function KanbanBoard({ workspaceId, boardId }: KanbanBoardProps) {
  const { data: lists, isLoading: listsLoading } = useBoardLists(
    workspaceId,
    boardId,
  );
  const listIds = useMemo(() => lists?.map((list) => list.id) ?? [], [lists]);
  const { cardsByList, isLoading: cardsLoading } = useBoardCards(
    workspaceId,
    boardId,
    listIds,
  );
  const moveCard = useMoveCard(workspaceId, boardId);
  const createList = useCreateBoardList(workspaceId, boardId);
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [addingList, setAddingList] = useState(false);

  useRealtimeBoard(workspaceId, boardId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardListFormValues>({
    resolver: zodResolver(createBoardListSchema),
    defaultValues: { name: "" },
  });

  const onAddList = handleSubmit(async (values) => {
    await createList.mutateAsync(values);
    reset();
    setAddingList(false);
  });

  const handleDragStart = (event: DragStartEvent) => {
    const found = findCard(cardsByList, String(event.active.id));
    setActiveCard(found?.card ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveCard(null);
    const { active, over } = event;
    if (!over) return;

    const source = findCard(cardsByList, String(active.id));
    if (!source) return;

    let targetListId = source.listId;
    let targetIndex = cardsByList[targetListId].findIndex(
      (card) => card.id === source.card.id,
    );

    const listFromDroppable = parseListDroppableId(String(over.id));
    if (listFromDroppable) {
      targetListId = listFromDroppable;
      targetIndex = cardsByList[targetListId]?.length ?? 0;
    } else {
      const overCard = findCard(cardsByList, String(over.id));
      if (overCard) {
        targetListId = overCard.listId;
        targetIndex = cardsByList[targetListId].findIndex(
          (card) => card.id === overCard.card.id,
        );
      }
    }

    const targetCards = cardsByList[targetListId] ?? [];
    const position = calculateDropPosition(
      targetCards,
      targetIndex,
      source.card.id,
    );

    if (source.listId === targetListId && source.card.position === position) {
      return;
    }

    moveCard.mutate({
      card: source.card,
      listId: targetListId,
      position,
    });
  };

  if (listsLoading || cardsLoading) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <LoadingSpinner label="Loading board" />
      </div>
    );
  }

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex h-full gap-4 overflow-x-auto p-4">
          {lists?.map((list) => (
            <KanbanColumn
              key={list.id}
              workspaceId={workspaceId}
              boardId={boardId}
              list={list}
              cards={cardsByList[list.id] ?? []}
              onCardClick={(card) => {
                setSelectedCard(card);
                setSheetOpen(true);
              }}
            />
          ))}

          <div className="w-72 shrink-0">
            {addingList ? (
              <form
                onSubmit={onAddList}
                className="space-y-2 rounded-xl bg-muted/40 p-3"
              >
                <Input
                  placeholder="List name"
                  autoFocus
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">
                    {errors.name.message}
                  </p>
                )}
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    disabled={createList.isPending}
                  >
                    Add list
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => setAddingList(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => setAddingList(true)}
              >
                <Plus className="size-4" />
                Add list
              </Button>
            )}
          </div>
        </div>

        <DragOverlay>
          {activeCard ? <KanbanCardOverlay card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      <CardDetailSheet
        workspaceId={workspaceId}
        boardId={boardId}
        card={selectedCard}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
      />
    </>
  );
}
