import type { RequestHandler } from 'express';
import { inviteUserSchema } from '@dgcom/contracts';
import type { InviteUser } from '../../../application/use-cases/InviteUser/InviteUser';
import { UserAlreadyExistsError } from '../../../domain/errors/UserErrors';

export class InviteUserController {
  constructor(private readonly useCase: InviteUser) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const input = inviteUserSchema.parse(req.body);
      const result = await this.useCase.execute(input);

      if (result.isLeft()) {
        if (result.value instanceof UserAlreadyExistsError) {
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
