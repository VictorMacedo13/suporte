import { Resend } from 'resend';

export interface EmailService {
  send(input: { to: string; subject: string; html: string; text?: string }): Promise<void>;
}

export class ResendEmailService implements EmailService {
  private readonly client: Resend | null;
  private readonly from: string;
  private readonly testTo: string | null;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.RESEND_FROM ?? 'Suporte DGcom <suporte@dgcom.local>';
    this.testTo = process.env.RESEND_TEST_TO ?? null;
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  async send(input: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    if (!this.client) {
      console.warn('[email] RESEND_API_KEY ausente; conteudo do email:', input);
      return;
    }
    const to = this.testTo ?? input.to;
    if (this.testTo) {
      console.info(`[email] modo teste — redirecionando para ${to} (original: ${input.to})`);
    }
    const { error } = await this.client.emails.send({
      from: this.from,
      to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });
    if (error) {
      console.error('[email] erro Resend:', error);
      throw new Error(`Falha ao enviar email: ${error.message}`);
    }
  }
}
