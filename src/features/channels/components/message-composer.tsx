"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  createMessageSchema,
  type CreateMessageFormValues,
} from "@/features/channels/schemas/channel.schema";
import { useSendMessage } from "@/features/channels/hooks/use-channels";
import { useTypingEmitter } from "@/features/channels/hooks/use-realtime-channel";

interface MessageComposerProps {
  workspaceId: string;
  channelId: string;
  parentId?: string | null;
  placeholder?: string;
}

export function MessageComposer({
  workspaceId,
  channelId,
  parentId,
  placeholder = "Message #channel",
}: MessageComposerProps) {
  const [isTyping, setIsTyping] = useState(false);
  const sendMessage = useSendMessage(workspaceId, channelId, parentId);
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<CreateMessageFormValues>({
    resolver: zodResolver(createMessageSchema),
    defaultValues: { content: "" },
  });

  const content = watch("content");

  useEffect(() => {
    setIsTyping(Boolean(content.trim()));
  }, [content]);

  useTypingEmitter(workspaceId, channelId, isTyping);

  const onSubmit = handleSubmit(async (values) => {
    await sendMessage.mutateAsync(values);
    reset();
    setIsTyping(false);
  });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void onSubmit();
    }
  };

  return (
    <form onSubmit={onSubmit} className="border-t bg-background p-4">
      <div className="flex gap-2">
        <Textarea
          rows={2}
          placeholder={placeholder}
          className="min-h-[44px] resize-none"
          onKeyDown={handleKeyDown}
          {...register("content")}
        />
        <Button
          type="submit"
          size="icon"
          disabled={sendMessage.isPending}
          aria-label="Send message"
        >
          <Send className="size-4" />
        </Button>
      </div>
      {errors.content && (
        <p className="mt-1 text-sm text-destructive">
          {errors.content.message}
        </p>
      )}
      <p className="mt-1 text-xs text-muted-foreground">
        Enter to send · Shift+Enter for new line · @email to mention
      </p>
    </form>
  );
}
