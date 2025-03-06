import * as z from "zod";

export const registerSchema = z.object({
  username: z.string().trim().min(3).max(24).refine((arg) => {
    return !arg.includes(" ") && (arg.match(/[^a-z0-9]/gm) == null);
  }),
  email: z.string().trim().email(),
  password: z.string().trim().min(4),
});

export type RegisterSchemaType = z.infer<typeof registerSchema>;
