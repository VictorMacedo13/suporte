import type { RequestHandler } from 'express';
import { replyTicketSchema } from '@dgcom/contracts';
import type { ReplyToTicket } from '../../../application/use-cases/ReplyToTicket/ReplyToTicket';

export class ReplyTicketController {
  constructor(private readonly useCase: ReplyToTicket) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const code = String(req.params.code ?? '');
      if (!code) return res.status(400).json({ code: 'INVALID_CODE', message: 'Codigo ausente' });

      const input = replyTicketSchema.parse(req.body);
      const session = res.locals.session;
      const user = session?.user;
      if (!user) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Login obrigatorio' });

      // Customers nao podem postar mensagem interna.
      const isInternal = user.role === 'customer' ? false : input.isInternal;

      const result = await this.useCase.execute({
        ticketCode: code,
        authorId: user.id,
        authorName: user.name,
        content: input.content,
        isInternal,
      });

      if (result.isLeft()) return next(result.value);
      res.status(201).json(result.value);
    } catch (err) {
      next(err);
    }
  };
}
