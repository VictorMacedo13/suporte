import type { Ticket } from '../entities/Ticket';
import type { TicketMessage } from '../entities/TicketMessage';
import type { TicketStatusValue } from '../value-objects/TicketStatus';

export interface ListTicketsFilter {
  status?: TicketStatusValue;
  requesterId?: string;
  assigneeId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface ListTicketsResult {
  tickets: Ticket[];
  total: number;
}

export interface RecordStatusChangeInput {
  ticketId: string;
  fromStatus: TicketStatusValue | null;
  toStatus: TicketStatusValue;
  changedById: string | null;
  note?: string;
}

export interface ITicketRepository {
  /** Cria o ticket e devolve a entidade ja com sequencial gerado pelo banco. */
  create(input: {
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    categoryId?: string | null;
    categorySlug?: string | null;
    requesterId?: string | null;
    requesterName: string;
    requesterEmail: string;
    clientType?: string | null;
    documentType?: string | null;
  }): Promise<Ticket>;

  save(ticket: Ticket): Promise<void>;

  findById(id: string): Promise<Ticket | null>;

  findByCode(code: string): Promise<Ticket | null>;

  list(filter: ListTicketsFilter): Promise<ListTicketsResult>;

  appendMessage(message: TicketMessage): Promise<void>;

  listMessages(ticketId: string, opts?: { includeInternal: boolean }): Promise<TicketMessage[]>;

  recordStatusChange(input: RecordStatusChangeInput): Promise<void>;
}
