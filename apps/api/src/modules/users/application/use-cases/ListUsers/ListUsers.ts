import { asc } from 'drizzle-orm';
import { getDb, schema } from '@dgcom/db';
import type { ListUsersOutput } from './ListUsersDTO';

export class ListUsers {
  async execute(): Promise<ListUsersOutput> {
    const db = getDb();
    const rows = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        role: schema.users.role,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .orderBy(asc(schema.users.name));

    return {
      users: rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        role: r.role,
        createdAt: r.createdAt.toISOString(),
      })),
    };
  }
}
