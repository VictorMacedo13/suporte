import { Resend } from 'resend';

export interface EmailService {
  send(input: { to: string; subject: string; html: string; text?: string }): Promise<void>;
}

export class ResendEmailService implements EmailService {
  private readonly client: Resend | null;
  private readonly from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    this.from = process.env.RESEND_FROM ?? 'Suporte DGcom <suporte@dgcom.local>';
    this.client = apiKey ? new Resend(apiKey) : null;
  }

  async send(input: { to: string; subject: string; html: string; text?: string }): Promise<void> {
    if (!this.client) {
      console.warn('[email] RESEND_API_KEY ausente; conteudo do email:', input);
      return;
    }
    const { error } = await this.client.emails.send({
      from: this.from,
      to: input.to,
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
