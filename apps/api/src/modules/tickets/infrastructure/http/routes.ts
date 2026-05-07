import { Router } from 'express';
import { requireAuth, requireRole } from '@/shared/http/middlewares/requireAuth';
import type { CreateTicketController } from './controllers/CreateTicketController';
import type { ListTicketsController } from './controllers/ListTicketsController';
import type { GetTicketController } from './controllers/GetTicketController';
import type { ReplyTicketController } from './controllers/ReplyTicketController';
import type { ChangeTicketStatusController } from './controllers/ChangeTicketStatusController';

export interface TicketRouteControllers {
  create: CreateTicketController;
  list: ListTicketsController;
  get: GetTicketController;
  reply: ReplyTicketController;
  changeStatus: ChangeTicketStatusController;
}

export function buildTicketRouter(c: TicketRouteControllers): Router {
  const router = Router();

  // Publico: criar ticket sem login (form do site).
  router.post('/public', c.create.handle);

  // Autenticado.
  router.use(requireAuth);
  router.get('/', c.list.handle);
  router.post('/', c.create.handle);
  router.get('/:code', c.get.handle);
  router.post('/:code/reply', c.reply.handle);
  router.patch('/:code/status', requireRole('agent', 'admin'), c.changeStatus.handle);

  return router;
}
