import { z } from "zod";

const tipTapDocSchema: z.ZodTypeAny = z
  .object({
    type: z.literal("doc"),
    content: z.array(z.any()).min(1),
  })
  .passthrough();

export const createDocSchema = z.object({
  title: z.string().trim().min(1),
  content: tipTapDocSchema,
});

export const updateDocSchema = z
  .object({
    title: z.string().trim().min(1).optional(),
    content: tipTapDocSchema.optional(),
  })
  .refine((v) => v.title !== undefined || v.content !== undefined, {
    message: "At least one of title or content is required",
  });

export type CreateDocInput = z.infer<typeof createDocSchema>;
export type UpdateDocInput = z.infer<typeof updateDocSchema>;

