import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { DeleteProduct } from '../../../application/use-cases/DeleteProduct/DeleteProduct';
import { ProductNotFoundError } from '../../../domain/errors/ProductErrors';

const paramsSchema = z.object({ id: z.string().uuid() });

export class DeleteProductController {
  constructor(private readonly useCase: DeleteProduct) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const { id } = paramsSchema.parse(req.params);
      const result = await this.useCase.execute({ id });

      if (result.isLeft()) {
        if (result.value instanceof ProductNotFoundError) {
          res.status(404).json({ message: result.value.message });
          return;
        }
        return next(result.value);
      }

      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
