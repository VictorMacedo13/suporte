import type { Product } from '../entities/Product';

export interface IProductRepository {
  create(name: string): Promise<Product>;
  findByName(name: string): Promise<Product | null>;
  findById(id: string): Promise<Product | null>;
  list(): Promise<Product[]>;
  delete(id: string): Promise<void>;
}
