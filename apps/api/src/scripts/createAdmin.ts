import 'dotenv/config';
import { eq } from 'drizzle-orm';
import { auth } from '@dgcom/auth/server';
import { getDb, schema } from '@dgcom/db';

const NAME = process.argv[2] ?? 'Admin';
const EMAIL = process.argv[3] ?? '';
const PASSWORD = process.argv[4] ?? '';

if (!EMAIL || !PASSWORD) {
  console.error('Uso: tsx createAdmin.ts <nome> <email> <senha>');
  process.exit(1);
}

const db = getDb();

const existing = await db.query.users.findFirst({ where: eq(schema.users.email, EMAIL) });

if (existing) {
  console.log(`[admin] usuario ja existia (id=${existing.id}). Promovendo para admin...`);
  await db.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, existing.id));
  console.log(`[admin] role atualizado para 'admin' para ${EMAIL}`);
  process.exit(0);
}

console.log(`[admin] criando usuario ${EMAIL} via BetterAuth...`);
const result = await auth.api.signUpEmail({
  body: { name: NAME, email: EMAIL, password: PASSWORD },
  asResponse: false,
});

const userId = result?.user?.id;
if (!userId) {
  console.error('[admin] falha ao criar usuario:', result);
  process.exit(1);
}

console.log(`[admin] usuario criado (id=${userId}). Promovendo para admin...`);
await db.update(schema.users).set({ role: 'admin' }).where(eq(schema.users.id, userId));
console.log(`[admin] pronto! ${EMAIL} agora e admin.`);
process.exit(0);
