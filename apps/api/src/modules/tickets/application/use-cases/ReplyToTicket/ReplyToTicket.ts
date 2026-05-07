import { type Either, left, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import { TicketMessage } from '../../../domain/entities/TicketMessage';
import {
  TicketClosedError,
  TicketNotFoundError,
} from '../../../domain/errors/TicketErrors';
import type { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import type { ReplyToTicketInput, ReplyToTicketOutput } from './ReplyToTicketDTO';

type ReplyError = TicketNotFoundError | TicketClosedError;

export class ReplyToTicket
  implements UseCase<ReplyToTicketInput, Promise<Either<ReplyError, ReplyToTicketOutput>>>
{
  constructor(private readonly repo: ITicketRepository) {}

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

    return right({
      messageId: message.id,
      ticketCode: ticket.code.value,
      createdAt: message.createdAt.toISOString(),
    });
  }
}
