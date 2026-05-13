import { type Either, left, right } from '@/shared/domain/Either';
import { ProductNotFoundError } from '../../../domain/errors/ProductErrors';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import type { DeleteProductInput } from './DeleteProductDTO';

export class DeleteProduct {
  constructor(private readonly repo: IProductRepository) {}

  async execute(input: DeleteProductInput): Promise<Either<ProductNotFoundError, void>> {
    const existing = await this.repo.findById(input.id);
    if (!existing) return left(new ProductNotFoundError());

    await this.repo.delete(input.id);
    return right(undefined);
  }
}
