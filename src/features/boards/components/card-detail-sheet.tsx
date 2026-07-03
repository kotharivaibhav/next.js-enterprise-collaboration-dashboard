"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import {
  updateCardSchema,
  type UpdateCardFormValues,
} from "@/features/boards/schemas/board.schema";
import { useUpdateCard } from "@/features/boards/hooks/use-boards";
import type { Card } from "@/types/board";

interface CardDetailSheetProps {
  workspaceId: string;
  boardId: string;
  card: Card | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardDetailSheet({
  workspaceId,
  boardId,
  card,
  open,
  onOpenChange,
}: CardDetailSheetProps) {
  const updateCard = useUpdateCard(workspaceId, boardId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<UpdateCardFormValues>({
    resolver: zodResolver(updateCardSchema),
    defaultValues: {
      title: "",
      description: "",
      due_date: "",
      labels: "",
    },
  });

  useEffect(() => {
    if (!card) return;
    reset({
      title: card.title,
      description: card.description ?? "",
      due_date: card.due_date ?? "",
      labels: card.labels.join(", "),
    });
  }, [card, reset]);

  if (!card) return null;

  const onSubmit = handleSubmit(async (values) => {
    await updateCard.mutateAsync({ card, values });
    onOpenChange(false);
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit card</SheetTitle>
        </SheetHeader>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="card-title">Title</Label>
            <Input id="card-title" {...register("title")} />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-description">Description</Label>
            <Textarea
              id="card-description"
              rows={4}
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-due-date">Due date</Label>
            <Input id="card-due-date" type="date" {...register("due_date")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="card-labels">Labels (comma-separated)</Label>
            <Input
              id="card-labels"
              placeholder="bug, urgent"
              {...register("labels")}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Version: {card.version}
          </p>
          <Button type="submit" disabled={!isDirty || updateCard.isPending}>
            {updateCard.isPending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
