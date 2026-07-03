"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, Plus } from "lucide-react";
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
import {
  createDocumentSchema,
  type CreateDocumentFormValues,
} from "@/features/documents/schemas/document.schema";
import { useCreateDocument } from "@/features/documents/hooks/use-documents";

interface CreateDocumentDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
}

export function CreateDocumentDialog({
  workspaceId,
  trigger,
}: CreateDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const createDocument = useCreateDocument(workspaceId);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateDocumentFormValues>({
    resolver: zodResolver(createDocumentSchema),
    defaultValues: { title: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    await createDocument.mutateAsync(values);
    reset();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger ?? (
          <Button>
            <Plus className="size-4" />
            New document
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="size-4" />
            Create document
          </DialogTitle>
          <DialogDescription>
            Documents are collaborative pages built from blocks.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="document-title">Title</Label>
            <Input
              id="document-title"
              placeholder="Untitled"
              autoFocus
              {...register("title")}
            />
            {errors.title && (
              <p className="text-sm text-destructive">{errors.title.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createDocument.isPending}>
              {createDocument.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
