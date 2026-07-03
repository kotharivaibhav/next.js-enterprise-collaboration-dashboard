"use client";

import { useDroppable } from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KanbanCard } from "@/features/boards/components/kanban-card";
import {
  createCardSchema,
  type CreateCardFormValues,
} from "@/features/boards/schemas/board.schema";
import { useCreateCard } from "@/features/boards/hooks/use-boards";
import { cn } from "@/lib/utils";
import type { BoardList, Card } from "@/types/board";

interface KanbanColumnProps {
  workspaceId: string;
  boardId: string;
  list: BoardList;
  cards: Card[];
  onCardClick: (card: Card) => void;
}

function listDroppableId(listId: string): string {
  return `list:${listId}`;
}

export function KanbanColumn({
  workspaceId,
  boardId,
  list,
  cards,
  onCardClick,
}: KanbanColumnProps) {
  const [addingCard, setAddingCard] = useState(false);
  const createCard = useCreateCard(workspaceId, boardId, list.id);
  const { setNodeRef, isOver } = useDroppable({
    id: listDroppableId(list.id),
    data: { type: "list", listId: list.id },
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateCardFormValues>({
    resolver: zodResolver(createCardSchema),
    defaultValues: { title: "", description: "" },
  });

  const onAddCard = handleSubmit(async (values) => {
    await createCard.mutateAsync(values);
    reset();
    setAddingCard(false);
  });

  return (
    <div
      className={cn(
        "flex w-72 shrink-0 flex-col rounded-xl bg-muted/40",
        isOver && "ring-2 ring-primary/30",
      )}
    >
      <div className="flex items-center justify-between px-3 py-3">
        <h3 className="text-sm font-semibold">{list.name}</h3>
        <span className="text-xs text-muted-foreground">{cards.length}</span>
      </div>

      <div
        ref={setNodeRef}
        className="flex min-h-[120px] flex-1 flex-col gap-2 overflow-y-auto px-2 pb-2"
      >
        <SortableContext
          items={cards.map((card) => card.id)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onClick={() => onCardClick(card)}
            />
          ))}
        </SortableContext>

        {addingCard ? (
          <form
            onSubmit={onAddCard}
            className="space-y-2 rounded-lg border bg-card p-2"
          >
            <Input placeholder="Card title" autoFocus {...register("title")} />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={createCard.isPending}>
                Add
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setAddingCard(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="justify-start text-muted-foreground"
            onClick={() => setAddingCard(true)}
          >
            <Plus className="size-4" />
            Add card
          </Button>
        )}
      </div>
    </div>
  );
}

export function parseListDroppableId(id: string): string | null {
  return id.startsWith("list:") ? id.replace("list:", "") : null;
}
