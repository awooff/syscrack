import * as z from "zod";

export const loginSchema = z.object({
  username: z.string().trim().min(3).max(24).refine((arg) => {
    return !arg.includes(" ") && (arg.match(/[^a-zA-Z0-9]/gm) == null);
  }),
  password: z.string().trim().min(4),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;
