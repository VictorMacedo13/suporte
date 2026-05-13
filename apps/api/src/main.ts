import 'dotenv/config';
import { setMagicLinkSender, setPasswordResetSender } from '@dgcom/auth/server';
import { createApp } from '@/shared/http/app';
import { ResendEmailService } from '@/shared/infrastructure/email/ResendEmailService';
import { magicLinkTemplate, inviteUserTemplate } from '@/shared/infrastructure/email/templates';
import { ensureAdminExists } from '@/scripts/createAdmin';

const PORT = Number(process.env.PORT ?? 3333);

const email = new ResendEmailService();
setMagicLinkSender(async (to, url) => {
  const tpl = magicLinkTemplate(url);
  await email.send({ to, ...tpl });
});

setPasswordResetSender(async (to, url, name) => {
  const tpl = inviteUserTemplate({ name, url });
  await email.send({ to, ...tpl });
});

const app = createApp();

app.listen(PORT, async () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
  await ensureAdminExists().catch((err) => console.error('[admin] erro ao garantir admin:', err));
});
