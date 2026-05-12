import type { TicketStatusValue } from '../../../domain/value-objects/TicketStatus';
import type { TicketPriorityValue } from '../../../domain/value-objects/TicketPriority';

export interface ListTicketsInput {
  status?: TicketStatusValue;
  requesterId?: string;
  assigneeId?: string;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TicketSummaryDTO {
  id: string;
  code: string;
  subject: string;
  status: TicketStatusValue;
  priority: TicketPriorityValue;
  requesterName: string;
  requesterEmail: string;
  assigneeId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListTicketsOutput {
  tickets: TicketSummaryDTO[];
  total: number;
}
