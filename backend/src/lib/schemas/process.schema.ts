import * as z from "zod";

export const processCreateSchema = z.object({
  type: z.string().trim().max(24).refine((arg) => {
    return !arg.includes(" ");
  }),
  connectionId: z.string().trim().min(12).refine((arg) => {
    return !arg.includes(" ");
  }),
});

export type ProcessCreateSchemaType = z.infer<typeof processCreateSchema>;

export const processCompleteSchema = z.object({
  processId: z.string().trim().min(12).refine((arg) => {
    return !arg.includes(" ");
  }),
});

export type ProcessCompleteSchemaType = z.infer<typeof processCompleteSchema>;
