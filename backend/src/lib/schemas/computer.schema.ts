import * as z from "zod";

export const computerIdSchema = z.object({
  computerId: z.string().trim().min(12),
});

export type ComputerIdSchema = z.infer<typeof computerIdSchema>;
