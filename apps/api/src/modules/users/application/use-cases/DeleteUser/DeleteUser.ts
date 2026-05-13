import { eq } from 'drizzle-orm';
import { getDb, schema } from '@dgcom/db';
import { type Either, left, right } from '@/shared/domain/Either';
import { UserNotFoundError } from '../../../domain/errors/UserErrors';
import type { DeleteUserInput } from './DeleteUserDTO';

export class DeleteUser {
  async execute(input: DeleteUserInput): Promise<Either<UserNotFoundError, void>> {
    const db = getDb();

    const existing = await db.query.users.findFirst({
      where: eq(schema.users.id, input.id),
    });
    if (!existing) return left(new UserNotFoundError(input.id));

    await db.delete(schema.users).where(eq(schema.users.id, input.id));

    return right(undefined);
  }
}
