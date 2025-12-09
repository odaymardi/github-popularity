
import { z } from 'zod';

export const getPopularReposQuerySchema = z.object({
  language: z.string().min(1).optional(),
  created_after: z
    .string()
    .datetime()
    .optional(),
  page: z
    .coerce
    .number()
    .int()
    .min(1)
    .default(1),
  per_page: z
    .coerce
    .number()
    .int()
    .min(1)
    .max(100)
    .default(20)
});

export type GetPopularReposQuery = z.infer<typeof getPopularReposQuerySchema>;
