import type { RequestHandler } from 'express';
import { createProductSchema } from '@dgcom/contracts';
import type { CreateProduct } from '../../../application/use-cases/CreateProduct/CreateProduct';
import { ProductAlreadyExistsError } from '../../../domain/errors/ProductErrors';

export class CreateProductController {
  constructor(private readonly useCase: CreateProduct) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const input = createProductSchema.parse(req.body);
      const result = await this.useCase.execute({ name: input.name });
      if (result.isLeft()) {
        if (result.value instanceof ProductAlreadyExistsError) {
          res.status(409).json({ message: result.value.message });
          return;
        }
        return next(result.value);
      }
      res.status(201).json(result.value);
    } catch (err) {
      next(err);
    }
  };
}
