import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { auth } from '@dgcom/auth/server';
import { getDb, schema } from '@dgcom/db';

export async function ensureAdminExists(opts?: {
  name?: string;
  email?: string;
  password?: string;
}) {
  const name = opts?.name ?? 'Admin';
  const email = opts?.email ?? 'admin@gmail.com';
  const password = opts?.password ?? 'teste@123';

  const db = getDb();

  const existing = await db.query.users.findFirst({ where: eq(schema.users.email, email) });

  if (existing) {
    if (existing.role !== 'admin') {
      await db.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, existing.id));
      console.log(`[admin] role atualizado para 'admin' para ${email}`);
    }
    return;
  }

  console.log(`[admin] criando usuario ${email} via BetterAuth...`);
  const result = await auth.api.signUpEmail({
    body: { name, email, password },
    asResponse: false,
  });

  const userId = result?.user?.id;
  if (!userId) {
    console.error('[admin] falha ao criar usuario:', result);
    return;
  }

  await db.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, userId));
  console.log(`[admin] pronto! ${email} agora e admin.`);
}

// Execucao direta via CLI: tsx createAdmin.ts <nome> <email> <senha>
if (process.argv[1]?.endsWith('createAdmin.ts')) {
  const [, , name, email, password] = process.argv;
  await ensureAdminExists({ name, email, password });
  process.exit(0);
}
