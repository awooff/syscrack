import * as z from "zod";

export const paginationSchema = z.object({
  page: z.number(),
});

export type PaginationSchemaType = z.infer<typeof paginationSchema>;
