import { z } from "zod";

export const channelTypeSchema = z.enum(["public", "private"]);

export const createChannelSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100)
    .regex(
      /^[a-zA-Z0-9\-_]+$/,
      "Only letters, numbers, hyphens, and underscores",
    ),
  description: z.string().max(2000).optional().or(z.literal("")),
  channel_type: channelTypeSchema,
});

export const createMessageSchema = z.object({
  content: z
    .string()
    .min(1, "Message cannot be empty")
    .max(10000, "Message is too long"),
});

export type CreateChannelFormValues = z.infer<typeof createChannelSchema>;
export type CreateMessageFormValues = z.infer<typeof createMessageSchema>;
