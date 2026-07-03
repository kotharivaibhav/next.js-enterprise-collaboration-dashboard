"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Kanban, Plus } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createBoardSchema,
  type CreateBoardFormValues,
} from "@/features/boards/schemas/board.schema";
import { useCreateBoard } from "@/features/boards/hooks/use-boards";

interface CreateBoardDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
}

export function CreateBoardDialog({
  workspaceId,
  trigger,
}: CreateBoardDialogProps) {
  const [open, setOpen] = useState(false);
  const createBoard = useCreateBoard(workspaceId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateBoardFormValues>({
    resolver: zodResolver(createBoardSchema),
    defaultValues: { name: "", description: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createBoard.mutateAsync(values);
    reset();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            New board
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Kanban className="size-4" />
            Create board
          </DialogTitle>
          <DialogDescription>
            Kanban boards help your team track work across lists and cards.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="board-name">Name</Label>
            <Input
              id="board-name"
              placeholder="Product roadmap"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="board-description">Description</Label>
            <Textarea
              id="board-description"
              rows={2}
              placeholder="Optional description"
              {...register("description")}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createBoard.isPending}>
              {createBoard.isPending ? "Creating..." : "Create board"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
