import { getDb } from '@dgcom/db';
import { CreateTicket } from './application/use-cases/CreateTicket/CreateTicket';
import { GetTicketByCode } from './application/use-cases/GetTicketByCode/GetTicketByCode';
import { ListTickets } from './application/use-cases/ListTickets/ListTickets';
import { ReplyToTicket } from './application/use-cases/ReplyToTicket/ReplyToTicket';
import { ChangeTicketStatus } from './application/use-cases/ChangeTicketStatus/ChangeTicketStatus';
import { DrizzleTicketRepository } from './infrastructure/repositories/DrizzleTicketRepository';
import { ResendEmailService } from '@/shared/infrastructure/email/ResendEmailService';
import { CreateTicketController } from './infrastructure/http/controllers/CreateTicketController';
import { ListTicketsController } from './infrastructure/http/controllers/ListTicketsController';
import { GetTicketController } from './infrastructure/http/controllers/GetTicketController';
import { ReplyTicketController } from './infrastructure/http/controllers/ReplyTicketController';
import { ChangeTicketStatusController } from './infrastructure/http/controllers/ChangeTicketStatusController';
import { buildTicketRouter } from './infrastructure/http/routes';

export function buildTicketsModule() {
  const repo = new DrizzleTicketRepository(getDb());
  const emailService = new ResendEmailService();
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

  const createTicket = new CreateTicket(repo);
  const getTicketByCode = new GetTicketByCode(repo);
  const listTickets = new ListTickets(repo);
  const replyToTicket = new ReplyToTicket(repo, emailService, webOrigin);
  const changeTicketStatus = new ChangeTicketStatus(repo);

  const routes = buildTicketRouter({
    create: new CreateTicketController(createTicket),
    list: new ListTicketsController(listTickets),
    get: new GetTicketController(getTicketByCode),
    reply: new ReplyTicketController(replyToTicket),
    changeStatus: new ChangeTicketStatusController(changeTicketStatus),
  });

  return { routes, useCases: { createTicket, replyToTicket, changeTicketStatus } };
}
