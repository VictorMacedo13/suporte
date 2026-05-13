import type { RequestHandler } from 'express';
import type { ListUsers } from '../../../application/use-cases/ListUsers/ListUsers';

export class ListUsersController {
  constructor(private readonly useCase: ListUsers) {}

  handle: RequestHandler = async (_req, res, next) => {
    try {
      const result = await this.useCase.execute();
      res.json(result);
    } catch (err) {
      next(err);
    }
  };
}
