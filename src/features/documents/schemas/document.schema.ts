import { z } from "zod";

export const blockTypeSchema = z.enum([
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "todo",
  "code",
  "bullet_list",
]);

export const createDocumentSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
});

export const updateDocumentTitleSchema = z.object({
  title: z.string().min(1, "Title is required").max(500),
});

export type CreateDocumentFormValues = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentTitleFormValues = z.infer<
  typeof updateDocumentTitleSchema
>;
