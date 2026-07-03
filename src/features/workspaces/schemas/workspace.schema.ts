import { z } from "zod";

export const workspaceRoleSchema = z.enum(["admin", "member", "guest"]);

export const createWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(255),
  description: z
    .string()
    .max(2000, "Description must be 2000 characters or less")
    .optional()
    .or(z.literal("")),
});

export const addMemberSchema = z.object({
  email: z.string().email("Enter a valid email address").min(3).max(320),
  role: workspaceRoleSchema,
});

export const updateMemberRoleSchema = z.object({
  role: workspaceRoleSchema,
});

export type CreateWorkspaceFormValues = z.infer<typeof createWorkspaceSchema>;
export type UpdateWorkspaceFormValues = z.infer<typeof updateWorkspaceSchema>;
export type AddMemberFormValues = z.infer<typeof addMemberSchema>;
export type UpdateMemberRoleFormValues = z.infer<typeof updateMemberRoleSchema>;
