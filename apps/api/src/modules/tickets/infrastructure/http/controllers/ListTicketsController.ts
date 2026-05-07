import type { RequestHandler } from 'express';
import { z } from 'zod';
import { ticketStatusSchema } from '@dgcom/contracts';
import type { ListTickets } from '../../../application/use-cases/ListTickets/ListTickets';

const querySchema = z.object({
  status: ticketStatusSchema.optional(),
  search: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  offset: z.coerce.number().int().min(0).optional(),
  scope: z.enum(['mine', 'all', 'assigned']).optional(),
});

export class ListTicketsController {
  constructor(private readonly useCase: ListTickets) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const query = querySchema.parse(req.query);
      const session = res.locals.session;
      const user = session?.user;
      if (!user) return res.status(401).json({ code: 'UNAUTHORIZED', message: 'Login obrigatorio' });

      const filter: Parameters<ListTickets['execute']>[0] = {
        status: query.status,
        search: query.search,
        limit: query.limit,
        offset: query.offset,
      };

      // Customers so veem os proprios tickets; agents/admin podem ver todos.
      if (user.role === 'customer' || query.scope === 'mine') {
        filter.requesterId = user.id;
      } else if (query.scope === 'assigned') {
        filter.assigneeId = user.id;
      }

      const result = await this.useCase.execute(filter);
      if (result.isLeft()) return next(result.value);
      res.json(result.value);
    } catch (err) {
      next(err);
    }
  };
}
