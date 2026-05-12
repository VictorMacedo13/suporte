import { type Either, left, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import { TicketMessage } from '../../../domain/entities/TicketMessage';
import { TicketClosedError, TicketNotFoundError } from '../../../domain/errors/TicketErrors';
import type { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import type { EmailService } from '@/shared/infrastructure/email/ResendEmailService';
import { ticketReplyTemplate } from '@/shared/infrastructure/email/templates';
import type { ReplyToTicketInput, ReplyToTicketOutput } from './ReplyToTicketDTO';

type ReplyError = TicketNotFoundError | TicketClosedError;

export class ReplyToTicket implements UseCase<
  ReplyToTicketInput,
  Promise<Either<ReplyError, ReplyToTicketOutput>>
> {
  constructor(
    private readonly repo: ITicketRepository,
    private readonly emailService?: EmailService,
    private readonly webOrigin?: string,
  ) {}

  async execute(input: ReplyToTicketInput): Promise<Either<ReplyError, ReplyToTicketOutput>> {
    const ticket = await this.repo.findByCode(input.ticketCode);
    if (!ticket) {
      return left(new TicketNotFoundError(`Ticket ${input.ticketCode} nao encontrado`));
    }

    try {
      ticket.registerReply();
    } catch (err) {
      if (err instanceof TicketClosedError) return left(err);
      throw err;
    }

    const message = TicketMessage.create({
      ticketId: ticket.id,
      authorId: input.authorId,
      authorName: input.authorName,
      content: input.content.trim(),
      isInternal: input.isInternal ?? false,
    });

    await this.repo.appendMessage(message);
    await this.repo.save(ticket);

    if (!message.isInternal && this.emailService) {
      const url = this.webOrigin ? `${this.webOrigin}/tickets/${ticket.code.value}` : undefined;
      const tpl = ticketReplyTemplate({
        code: ticket.code.value,
        subject: ticket.subject,
        authorName: input.authorName,
        content: message.content,
        url,
      });
      this.emailService
        .send({ to: ticket.requesterEmail, subject: tpl.subject, html: tpl.html })
        .catch((err: unknown) => console.error('[email] falha ao enviar reply:', err));
    }

    return right({
      messageId: message.id,
      ticketCode: ticket.code.value,
      createdAt: message.createdAt.toISOString(),
    });
  }
}
