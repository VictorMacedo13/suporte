import { type Either, left, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import { TicketNotFoundError } from '../../../domain/errors/TicketErrors';
import type { ITicketRepository } from '../../../domain/repositories/ITicketRepository';
import type { GetTicketByCodeInput, GetTicketByCodeOutput } from './GetTicketByCodeDTO';

export class GetTicketByCode implements UseCase<
  GetTicketByCodeInput,
  Promise<Either<TicketNotFoundError, GetTicketByCodeOutput>>
> {
  constructor(private readonly repo: ITicketRepository) {}

  async execute(
    input: GetTicketByCodeInput,
  ): Promise<Either<TicketNotFoundError, GetTicketByCodeOutput>> {
    const ticket = await this.repo.findByCode(input.code);
    if (!ticket) {
      return left(new TicketNotFoundError(`Ticket ${input.code} nao encontrado`));
    }

    const includeInternal = input.viewerRole === 'admin' || input.viewerRole === 'agent';
    const messages = await this.repo.listMessages(ticket.id, { includeInternal });

    return right({
      id: ticket.id,
      code: ticket.code.value,
      subject: ticket.subject,
      description: ticket.description,
      status: ticket.status.value,
      priority: ticket.priority.value,
      categoryId: ticket.categoryId,
      categorySlug: ticket.categorySlug,
      categoryName: ticket.categoryName,
      requesterId: ticket.requesterId,
      requesterName: ticket.requesterName,
      requesterEmail: ticket.requesterEmail,
      clientType: ticket.clientType,
      documentType: ticket.documentType,
      assigneeId: ticket.assigneeId,
      createdAt: ticket.createdAt.toISOString(),
      updatedAt: ticket.updatedAt.toISOString(),
      closedAt: ticket.closedAt?.toISOString() ?? null,
      messages: messages.map((m) => ({
        id: m.id,
        authorId: m.authorId,
        authorName: m.authorName,
        content: m.content,
        isInternal: m.isInternal,
        createdAt: m.createdAt.toISOString(),
      })),
    });
  }
}
