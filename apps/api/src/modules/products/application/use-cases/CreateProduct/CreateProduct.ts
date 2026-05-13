import { type Either, left, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import { ProductAlreadyExistsError } from '../../../domain/errors/ProductErrors';
import type { IProductRepository } from '../../../domain/repositories/IProductRepository';
import type { CreateProductInput, CreateProductOutput } from './CreateProductDTO';

export class CreateProduct implements UseCase<
  CreateProductInput,
  Promise<Either<ProductAlreadyExistsError, CreateProductOutput>>
> {
  constructor(private readonly repo: IProductRepository) {}

  async execute(
    input: CreateProductInput,
  ): Promise<Either<ProductAlreadyExistsError, CreateProductOutput>> {
    const existing = await this.repo.findByName(input.name);
    if (existing) return left(new ProductAlreadyExistsError(input.name));

    const product = await this.repo.create(input.name);
    return right({
      id: product.id,
      name: product.name,
      createdAt: product.createdAt.toISOString(),
    });
  }
}
