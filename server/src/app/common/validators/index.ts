import { z } from "zod";

export const idParamSchema = z.object({
  id: z.string().min(1, "ID is required"),
});

export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
});

export type IdParam = z.infer<typeof idParamSchema>;
export type PaginationQuery = z.infer<typeof paginationSchema>;
