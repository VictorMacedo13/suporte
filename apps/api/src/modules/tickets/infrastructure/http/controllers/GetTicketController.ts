import type { RequestHandler } from 'express';
import type { GetTicketByCode } from '../../../application/use-cases/GetTicketByCode/GetTicketByCode';

export class GetTicketController {
  constructor(private readonly useCase: GetTicketByCode) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const code = String(req.params.code ?? '');
      if (!code) return res.status(400).json({ code: 'INVALID_CODE', message: 'Codigo ausente' });

      const session = res.locals.session;
      const role = session?.user?.role ?? 'public';
      const result = await this.useCase.execute({ code, viewerRole: role });
      if (result.isLeft()) return next(result.value);

      // Restringe acesso: customer so pode ver os proprios tickets.
      const ticket = result.value;
      const userId = session?.user?.id;
      if (
        role === 'customer' &&
        ticket.requesterId !== userId
      ) {
        return res.status(403).json({ code: 'FORBIDDEN', message: 'Acesso negado' });
      }
      // Publico (sem login) so consegue ver via fluxo de magic link no front.
      // Aqui exige autenticacao pelo middleware.

      res.json(ticket);
    } catch (err) {
      next(err);
    }
  };
}
