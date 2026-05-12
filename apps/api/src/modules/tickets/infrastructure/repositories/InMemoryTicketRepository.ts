import { Ticket } from '../../domain/entities/Ticket';
import type { TicketMessage } from '../../domain/entities/TicketMessage';
import type {
  ITicketRepository,
  ListTicketsFilter,
  ListTicketsResult,
  RecordStatusChangeInput,
} from '../../domain/repositories/ITicketRepository';

interface StatusHistoryEntry extends RecordStatusChangeInput {
  changedAt: Date;
}

/**
 * Implementacao em memoria — usada nos specs e como referencia.
 * Nao usar em producao.
 */
export class InMemoryTicketRepository implements ITicketRepository {
  public readonly tickets: Ticket[] = [];
  public readonly messages: TicketMessage[] = [];
  public readonly statusHistory: StatusHistoryEntry[] = [];
  private nextSequence = 1;

  async create(input: {
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    categoryId?: string | null;
    requesterId?: string | null;
    requesterName: string;
    requesterEmail: string;
  }): Promise<Ticket> {
    const ticket = Ticket.create({
      sequence: this.nextSequence++,
      subject: input.subject,
      description: input.description,
      priority: input.priority,
      categoryId: input.categoryId ?? null,
      requesterId: input.requesterId ?? null,
      requesterName: input.requesterName,
      requesterEmail: input.requesterEmail,
    });
    this.tickets.push(ticket);
    return ticket;
  }

  async save(ticket: Ticket): Promise<void> {
    const idx = this.tickets.findIndex((t) => t.id === ticket.id);
    if (idx >= 0) this.tickets[idx] = ticket;
  }

  async findById(id: string): Promise<Ticket | null> {
    return this.tickets.find((t) => t.id === id) ?? null;
  }

  async findByCode(code: string): Promise<Ticket | null> {
    return this.tickets.find((t) => t.code.value === code) ?? null;
  }

  async list(filter: ListTicketsFilter): Promise<ListTicketsResult> {
    let filtered = [...this.tickets];
    if (filter.status) {
      filtered = filtered.filter((t) => t.status.value === filter.status);
    } else {
      filtered = filtered.filter((t) => t.status.value !== 'closed');
    }
    if (filter.requesterId) {
      filtered = filtered.filter((t) => t.requesterId === filter.requesterId);
    }
    if (filter.assigneeId) {
      filtered = filtered.filter((t) => t.assigneeId === filter.assigneeId);
    }
    if (filter.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (t) =>
          t.subject.toLowerCase().includes(q) ||
          t.code.value.toLowerCase().includes(q) ||
          t.requesterEmail.toLowerCase().includes(q),
      );
    }
    const total = filtered.length;
    const offset = filter.offset ?? 0;
    const limit = filter.limit ?? 50;
    return {
      total,
      tickets: filtered
        .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
        .slice(offset, offset + limit),
    };
  }

  async appendMessage(message: TicketMessage): Promise<void> {
    this.messages.push(message);
  }

  async listMessages(
    ticketId: string,
    opts?: { includeInternal: boolean },
  ): Promise<TicketMessage[]> {
    return this.messages
      .filter((m) => m.ticketId === ticketId)
      .filter((m) => (opts?.includeInternal ? true : !m.isInternal))
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async recordStatusChange(input: RecordStatusChangeInput): Promise<void> {
    this.statusHistory.push({ ...input, changedAt: new Date() });
  }
}
