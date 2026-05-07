import 'dotenv/config';
import { setMagicLinkSender } from '@dgcom/auth/server';
import { createApp } from '@/shared/http/app';
import { ResendEmailService } from '@/shared/infrastructure/email/ResendEmailService';
import { magicLinkTemplate } from '@/shared/infrastructure/email/templates';

const PORT = Number(process.env.PORT ?? 3333);

const email = new ResendEmailService();
setMagicLinkSender(async (to, url) => {
  const tpl = magicLinkTemplate(url);
  await email.send({ to, ...tpl });
});

const app = createApp();

app.listen(PORT, () => {
  console.log(`[api] listening on http://localhost:${PORT}`);
});
