import type { TicketStatusValue } from '../../../domain/value-objects/TicketStatus';
import type { TicketPriorityValue } from '../../../domain/value-objects/TicketPriority';

export interface GetTicketByCodeInput {
  code: string;
  /** Quem esta consultando (define se ve mensagens internas). */
  viewerRole?: 'admin' | 'agent' | 'customer' | 'public';
}

export interface TicketMessageDTO {
  id: string;
  authorId: string | null;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

export interface GetTicketByCodeOutput {
  id: string;
  code: string;
  subject: string;
  description: string;
  status: TicketStatusValue;
  priority: TicketPriorityValue;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  requesterId: string | null;
  requesterName: string;
  requesterEmail: string;
  clientType: string | null;
  documentType: string | null;
  productId: string | null;
  productName: string | null;
  assigneeId: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  messages: TicketMessageDTO[];
}
