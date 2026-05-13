import { InviteUser } from './application/use-cases/InviteUser/InviteUser';
import { ListUsers } from './application/use-cases/ListUsers/ListUsers';
import { DeleteUser } from './application/use-cases/DeleteUser/DeleteUser';
import { InviteUserController } from './infrastructure/http/controllers/InviteUserController';
import { ListUsersController } from './infrastructure/http/controllers/ListUsersController';
import { DeleteUserController } from './infrastructure/http/controllers/DeleteUserController';
import { buildUserRouter } from './infrastructure/http/routes';

export function buildUsersModule() {
  const webOrigin = process.env.WEB_ORIGIN ?? 'http://localhost:3000';

  const routes = buildUserRouter({
    invite: new InviteUserController(new InviteUser(webOrigin)),
    list: new ListUsersController(new ListUsers()),
    delete: new DeleteUserController(new DeleteUser()),
  });

  return { routes };
}
