import { type Either, left, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import { InvalidTicketDataError } from '../../../domain/errors/TicketErrors';
import type { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import type { CreateTicketInput, CreateTicketOutput } from './CreateTicketDTO';

export class CreateTicket implements UseCase<
  CreateTicketInput,
  Promise<Either<InvalidTicketDataError, CreateTicketOutput>>
> {
  constructor(private readonly repo: ITicketRepository) {}

  async execute(
    input: CreateTicketInput,
  ): Promise<Either<InvalidTicketDataError, CreateTicketOutput>> {
    try {
      const ticket = await this.repo.create({
        subject: input.subject,
        description: input.description,
        priority: input.priority ?? 'medium',
        categoryId: input.categoryId ?? null,
        categorySlug: input.categorySlug ?? null,
        requesterId: input.requesterId ?? null,
        requesterName: input.requesterName,
        requesterEmail: input.requesterEmail,
        clientType: input.clientType ?? null,
        documentType: input.documentType ?? null,
      });

      await this.repo.recordStatusChange({
        ticketId: ticket.id,
        fromStatus: null,
        toStatus: ticket.status.value,
        changedById: input.requesterId ?? null,
      });

      return right({
        id: ticket.id,
        code: ticket.code.value,
        subject: ticket.subject,
        status: ticket.status.value,
        priority: ticket.priority.value,
        createdAt: ticket.createdAt.toISOString(),
      });
    } catch (err) {
      if (err instanceof InvalidTicketDataError) return left(err);
      throw err;
    }
  }
}
