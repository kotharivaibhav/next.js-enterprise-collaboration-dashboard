"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Hash, Plus } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createChannelSchema,
  type CreateChannelFormValues,
} from "@/features/channels/schemas/channel.schema";
import { useCreateChannel } from "@/features/channels/hooks/use-channels";
import type { ChannelType } from "@/types/channel";

interface CreateChannelDialogProps {
  workspaceId: string;
  trigger?: React.ReactNode;
}

export function CreateChannelDialog({
  workspaceId,
  trigger,
}: CreateChannelDialogProps) {
  const [open, setOpen] = useState(false);
  const createChannel = useCreateChannel(workspaceId);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateChannelFormValues>({
    resolver: zodResolver(createChannelSchema),
    defaultValues: {
      name: "",
      description: "",
      channel_type: "public",
    },
  });

  const channelType = watch("channel_type");

  const onSubmit = handleSubmit(async (values) => {
    await createChannel.mutateAsync(values);
    reset();
    setOpen(false);
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        {trigger ?? (
          <Button size="sm" variant="outline" className="w-full justify-start">
            <Plus className="size-4" />
            New channel
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create channel</DialogTitle>
          <DialogDescription>
            Channels are where your team communicates. Names use lowercase
            letters, numbers, hyphens, and underscores.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="channel-name">Name</Label>
            <div className="relative">
              <Hash className="absolute top-2.5 left-2.5 size-4 text-muted-foreground" />
              <Input
                id="channel-name"
                className="pl-8"
                placeholder="general"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="channel-description">Description</Label>
            <Textarea
              id="channel-description"
              rows={2}
              placeholder="What is this channel about?"
              {...register("description")}
            />
          </div>
          <div className="space-y-2">
            <Label>Visibility</Label>
            <Select
              value={channelType}
              onValueChange={(value) =>
                setValue("channel_type", value as ChannelType, {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">
                  Public — all workspace members
                </SelectItem>
                <SelectItem value="private">
                  Private — invited members only
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createChannel.isPending}>
              {createChannel.isPending ? "Creating..." : "Create channel"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
