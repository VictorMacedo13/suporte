import { z } from 'zod';

export const createProductSchema = z.object({
  name: z.string().trim().min(1, 'Nome obrigatório').max(100),
});
export type CreateProductInput = z.infer<typeof createProductSchema>;

export const productSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  createdAt: z.string(),
});
export type Product = z.infer<typeof productSchema>;

export const listProductsSchema = z.object({
  products: z.array(productSchema),
});
export type ListProductsOutput = z.infer<typeof listProductsSchema>;
