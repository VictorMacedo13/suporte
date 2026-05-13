import type { RequestHandler } from 'express';
import { z } from 'zod';
import type { DeleteUser } from '../../../application/use-cases/DeleteUser/DeleteUser';
import { UserNotFoundError } from '../../../domain/errors/UserErrors';

const paramsSchema = z.object({ id: z.string().min(1) });

export class DeleteUserController {
  constructor(private readonly useCase: DeleteUser) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const { id } = paramsSchema.parse(req.params);
      const result = await this.useCase.execute({ id });

      if (result.isLeft()) {
        if (result.value instanceof UserNotFoundError) {
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
