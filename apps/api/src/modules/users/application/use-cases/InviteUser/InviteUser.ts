import { eq } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { auth } from '@dgcom/auth/server';
import { getDb, schema } from '@dgcom/db';
import { type Either, left, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import { UserAlreadyExistsError } from '../../../domain/errors/UserErrors';
import type { InviteUserInput, InviteUserOutput } from './InviteUserDTO';

export class InviteUser implements UseCase<
  InviteUserInput,
  Promise<Either<UserAlreadyExistsError, InviteUserOutput>>
> {
  constructor(private readonly webOrigin: string) {}

  async execute(input: InviteUserInput): Promise<Either<UserAlreadyExistsError, InviteUserOutput>> {
    const db = getDb();

    const existing = await db.query.users.findFirst({
      where: eq(schema.users.email, input.email.trim().toLowerCase()),
    });
    if (existing) return left(new UserAlreadyExistsError(input.email));

    // Cria o usuario com senha aleatoria (sera substituida pelo reset de senha)
    const randomPassword = randomBytes(24).toString('hex');
    const created = await auth.api.signUpEmail({
      body: {
        name: input.name.trim(),
        email: input.email.trim().toLowerCase(),
        password: randomPassword,
      },
      asResponse: false,
    });

    if (!created?.user) throw new Error('Falha ao criar usuário');

    // Atualiza o role se necessario
    const role = input.role ?? 'customer';
    if (role !== 'customer') {
      await db.update(schema.users).set({ role }).where(eq(schema.users.id, created.user.id));
    }

    // Dispara o fluxo de reset de senha — BetterAuth chama sendResetPassword
    await auth.api.requestPasswordReset({
      body: {
        email: input.email.trim().toLowerCase(),
        redirectTo: `${this.webOrigin}/definir-senha`,
      },
      asResponse: false,
    });

    return right({
      id: created.user.id,
      name: created.user.name,
      email: created.user.email,
    });
  }
}
