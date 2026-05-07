import { type Either, left, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import {
  InvalidTicketStatusTransitionError,
  TicketNotFoundError,
} from '../../../domain/errors/TicketErrors';
import type { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import type {
  ChangeTicketStatusInput,
  ChangeTicketStatusOutput,
} from './ChangeTicketStatusDTO';

type StatusError = TicketNotFoundError | InvalidTicketStatusTransitionError;

export class ChangeTicketStatus
  implements
    UseCase<ChangeTicketStatusInput, Promise<Either<StatusError, ChangeTicketStatusOutput>>>
{
  constructor(private readonly repo: ITicketRepository) {}

  async execute(
    input: ChangeTicketStatusInput,
  ): Promise<Either<StatusError, ChangeTicketStatusOutput>> {
    const ticket = await this.repo.findByCode(input.ticketCode);
    if (!ticket) {
      return left(new TicketNotFoundError(`Ticket ${input.ticketCode} nao encontrado`));
    }

    const previous = ticket.status.value;
    try {
      ticket.changeStatusTo(input.toStatus);
    } catch (err) {
      if (err instanceof InvalidTicketStatusTransitionError) return left(err);
      throw err;
    }

    await this.repo.save(ticket);
    await this.repo.recordStatusChange({
      ticketId: ticket.id,
      fromStatus: previous,
      toStatus: input.toStatus,
      changedById: input.changedById,
      note: input.note,
    });

    return right({
      ticketCode: ticket.code.value,
      fromStatus: previous,
      toStatus: input.toStatus,
    });
  }
}
