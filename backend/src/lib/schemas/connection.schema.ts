import * as z from "zod";

export const connectionSchema = z.object({
  connectionId: z.string().trim().min(12).refine((arg) => {
    return !arg.includes(" ");
  }),
  ip: z.string(),
});

export type ConnectiomSchemaType = z.infer<typeof connectionSchema>;
