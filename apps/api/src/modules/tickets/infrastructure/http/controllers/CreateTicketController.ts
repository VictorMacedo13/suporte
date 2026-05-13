import type { RequestHandler } from 'express';
import { createPublicTicketSchema } from '@dgcom/contracts';
import type { CreateTicket } from '../../../application/use-cases/CreateTicket/CreateTicket';

export class CreateTicketController {
  constructor(private readonly useCase: CreateTicket) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const input = createPublicTicketSchema.parse(req.body);
      const requesterId = res.locals.session?.user?.id ?? null;

      const result = await this.useCase.execute({
        subject: input.subject,
        description: input.description,
        requesterName: input.name,
        requesterEmail: input.email,
        clientType: input.clientType ?? null,
        documentType: input.documentType ?? null,
        categorySlug: input.categorySlug ?? null,
        productId: input.productId ?? null,
        requesterId,
      });

      if (result.isLeft()) return next(result.value);
      res.status(201).json(result.value);
    } catch (err) {
      next(err);
    }
  };
}
