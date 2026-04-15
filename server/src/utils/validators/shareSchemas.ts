import { z } from "zod";

export const shareDocSchema = z.object({
  email: z.string().email(),
  permission: z.enum(["read", "write"]),
});

export type ShareDocInput = z.infer<typeof shareDocSchema>;

