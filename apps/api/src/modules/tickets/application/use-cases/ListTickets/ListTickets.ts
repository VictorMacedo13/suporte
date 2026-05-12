import { type Either, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import type { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import type { ListTicketsInput, ListTicketsOutput } from './ListTicketsDTO';

export class ListTickets implements UseCase<
  ListTicketsInput,
  Promise<Either<never, ListTicketsOutput>>
> {
  constructor(private readonly repo: ITicketRepository) {}

  async execute(input: ListTicketsInput): Promise<Either<never, ListTicketsOutput>> {
    const { tickets, total } = await this.repo.list({
      status: input.status,
      requesterId: input.requesterId,
      assigneeId: input.assigneeId,
      search: input.search,
      limit: Math.min(input.limit ?? 50, 100),
      offset: input.offset ?? 0,
    });

    return right({
      total,
      tickets: tickets.map((t) => ({
        id: t.id,
        code: t.code.value,
        subject: t.subject,
        status: t.status.value,
        priority: t.priority.value,
        requesterName: t.requesterName,
        requesterEmail: t.requesterEmail,
        assigneeId: t.assigneeId,
        categorySlug: t.categorySlug,
        categoryName: t.categoryName,
        createdAt: t.createdAt.toISOString(),
        updatedAt: t.updatedAt.toISOString(),
      })),
    });
  }
}
