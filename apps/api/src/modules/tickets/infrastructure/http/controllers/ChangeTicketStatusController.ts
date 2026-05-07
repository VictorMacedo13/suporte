import type { RequestHandler } from 'express';
import { changeTicketStatusSchema } from '@dgcom/contracts';
import type { ChangeTicketStatus } from '../../../application/use-cases/ChangeTicketStatus/ChangeTicketStatus';

export class ChangeTicketStatusController {
  constructor(private readonly useCase: ChangeTicketStatus) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const code = String(req.params.code ?? '');
      if (!code) return res.status(400).json({ code: 'INVALID_CODE', message: 'Codigo ausente' });

      const input = changeTicketStatusSchema.parse(req.body);
      const session = res.locals.session;
      const user = session?.user;
      if (!user) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Login obrigatorio' });

      const result = await this.useCase.execute({
        ticketCode: code,
        toStatus: input.toStatus,
        changedById: user.id,
        note: input.note,
      });

      if (result.isLeft()) return next(result.value);
      res.json(result.value);
    } catch (err) {
      next(err);
    }
  };
}
