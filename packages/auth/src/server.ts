import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { magicLink } from 'better-auth/plugins';
import { getDb, schema } from '@dgcom/db';

/**
 * Cria a instância do BetterAuth (apenas server-side).
 *
 * Os métodos habilitados:
 * - email + senha
 * - magic link (envio implementado pelo módulo de notificações da API)
 *
 * O envio do magic link é injetado externamente via setMagicLinkSender.
 */

let _sendMagicLink: ((email: string, url: string) => Promise<void>) | null = null;

export function setMagicLinkSender(fn: (email: string, url: string) => Promise<void>) {
  _sendMagicLink = fn;
}

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: 'pg',
    schema: {
      user: schema.users,
      session: schema.sessions,
      account: schema.accounts,
      verification: schema.verifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  user: {
    additionalFields: {
      role: { type: 'string', defaultValue: 'customer', input: false },
    },
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        if (!_sendMagicLink) {
          console.warn('[auth] magic link sender not configured');
          return;
        }
        await _sendMagicLink(email, url);
      },
    }),
  ],
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: (process.env.TRUSTED_ORIGINS ?? process.env.WEB_ORIGIN ?? 'http://localhost:3000')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean),
});

export type Auth = typeof auth;
