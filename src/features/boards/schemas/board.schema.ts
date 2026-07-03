import { z } from "zod";

export const createBoardSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z.string().max(2000).optional().or(z.literal("")),
});

export const createBoardListSchema = z.object({
  name: z.string().min(1, "List name is required").max(255),
});

export const createCardSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
  description: z.string().max(5000).optional().or(z.literal("")),
});

export const updateCardSchema = z.object({
  title: z.string().min(1).max(500),
  description: z.string().max(5000).optional().or(z.literal("")),
  due_date: z.string().optional().or(z.literal("")),
  labels: z.string().optional().or(z.literal("")),
});

export type CreateBoardFormValues = z.infer<typeof createBoardSchema>;
export type CreateBoardListFormValues = z.infer<typeof createBoardListSchema>;
export type CreateCardFormValues = z.infer<typeof createCardSchema>;
export type UpdateCardFormValues = z.infer<typeof updateCardSchema>;
