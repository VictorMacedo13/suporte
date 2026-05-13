import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { errorHandler } from './errorHandler';
import { authHandler } from './authHandler';
import { sessionContext } from './middlewares/sessionContext';
import { sseRoutes } from './routes/sseRoutes';
import { buildTicketsModule } from '@/modules/tickets';
import { buildProductsModule } from '@/modules/products';
import { buildUsersModule } from '@/modules/users';
import { sseHub } from '@/shared/infrastructure/sse/SSEHub';
import { ResendEmailService } from '@/shared/infrastructure/email/ResendEmailService';
import {
  ticketCreatedTemplate,
  ticketReplyTemplate,
} from '@/shared/infrastructure/email/templates';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.WEB_ORIGIN ?? 'http://localhost:3000',
      credentials: true,
    }),
  );

  // BetterAuth precisa do raw body antes do express.json.
  app.all('/api/auth/*', authHandler);

  app.use(express.json({ limit: '1mb' }));
  app.use(sessionContext);

  app.get('/health', (_req, res) => {
    res.json({ ok: true });
  });

  // Modulos
  const tickets = buildTicketsModule();
  app.use('/api/tickets', tickets.routes);

  const products = buildProductsModule();
  app.use('/api/products', products.routes);

  const usersModule = buildUsersModule();
  app.use('/api/users', usersModule.routes);

  // SSE
  app.use('/api/sse', sseRoutes);

  // Hooks de notificacao + realtime (acoplam Resend e SSE aos use cases).
  const email = new ResendEmailService();
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

  // Patch leve: envolve o use case CreateTicket para enviar email + emitir SSE.
  const originalCreate = tickets.useCases.createTicket.execute.bind(tickets.useCases.createTicket);
  tickets.useCases.createTicket.execute = async (input) => {
    const result = await originalCreate(input);
    if (result.isRight()) {
      const productName = input.productId
        ? ((await products.repo.findById(input.productId))?.name ?? null)
        : null;
      const tpl = ticketCreatedTemplate({
        code: result.value.code,
        subject: result.value.subject,
        description: input.description,
        requesterName: input.requesterName,
        productName,
        url: `${webOrigin}/tickets/${result.value.code}`,
      });
      email.send({ to: input.requesterEmail, ...tpl }).catch(() => {});
      sseHub.publish(`ticket:${result.value.code}`, 'created', result.value);
    }
    return result;
  };

  const originalReply = tickets.useCases.replyToTicket.execute.bind(tickets.useCases.replyToTicket);
  tickets.useCases.replyToTicket.execute = async (input) => {
    const result = await originalReply(input);
    if (result.isRight()) {
      sseHub.publish(`ticket:${result.value.ticketCode}`, 'reply', result.value);
    }
    return result;
  };

  const originalChange = tickets.useCases.changeTicketStatus.execute.bind(
    tickets.useCases.changeTicketStatus,
  );
  tickets.useCases.changeTicketStatus.execute = async (input) => {
    const result = await originalChange(input);
    if (result.isRight()) {
      sseHub.publish(`ticket:${result.value.ticketCode}`, 'status', result.value);
    }
    return result;
  };

  app.use(errorHandler);
  return app;
}

// Re-export para uso em main.ts
export { ticketReplyTemplate };
