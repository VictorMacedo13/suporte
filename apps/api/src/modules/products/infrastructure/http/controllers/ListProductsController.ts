import type { RequestHandler } from 'express';
import type { ListProducts } from '../../../application/use-cases/ListProducts/ListProducts';

export class ListProductsController {
  constructor(private readonly useCase: ListProducts) {}

  handle: RequestHandler = async (_req, res, next) => {
    try {
      const result = await this.useCase.execute();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
