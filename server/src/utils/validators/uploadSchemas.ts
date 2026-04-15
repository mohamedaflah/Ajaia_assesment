import { z } from "zod";

export const uploadSchema = z.object({
  title: z.string().trim().min(1).optional(),
});

export type UploadInput = z.infer<typeof uploadSchema>;

