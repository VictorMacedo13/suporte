import type { UseCase } from '@/shared/domain/UseCase';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import type { ListProductsOutput } from './ListProductsDTO';

export class ListProducts implements UseCase<void, Promise<ListProductsOutput>> {
  constructor(private readonly repo: IProductRepository) {}

  async execute(): Promise<ListProductsOutput> {
    const list = await this.repo.list();
    return {
      products: list.map((p) => ({
        id: p.id,
        name: p.name,
        createdAt: p.createdAt.toISOString(),
      })),
    };
  }
}
