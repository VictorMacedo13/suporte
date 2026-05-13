import { Router } from 'express';
import { requireAuth, requireRole } from '@/shared/http/middlewares/requireAuth';
import type { InviteUserController } from './controllers/InviteUserController';
import type { ListUsersController } from './controllers/ListUsersController';
import type { DeleteUserController } from './controllers/DeleteUserController';

export function buildUserRouter(c: {
  invite: InviteUserController;
  list: ListUsersController;
  delete: DeleteUserController;
}): Router {
  const router = Router();

  router.use(requireAuth, requireRole('admin'));
  router.get('/', c.list.handle);
  router.post('/invite', c.invite.handle);
  router.delete('/:id', c.delete.handle);

  return router;
}
