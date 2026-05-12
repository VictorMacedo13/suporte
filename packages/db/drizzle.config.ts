import { config } from 'dotenv';
import { resolve } from 'node:path';
import { defineConfig } from 'drizzle-kit';

config({ path: resolve(__dirname, '../../apps/api/.env') });

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  verbose: true,
  strict: true,
});
