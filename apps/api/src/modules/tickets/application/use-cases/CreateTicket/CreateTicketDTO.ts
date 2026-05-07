import type { TicketPriorityValue } from '../../../domain/value-objects/TicketPriority';

export interface CreateTicketInput {
  subject: string;
  description: string;
  priority?: TicketPriorityValue;
  categoryId?: string | null;
  requesterId?: string | null;
  requesterName: string;
  requesterEmail: string;
}

export interface CreateTicketOutput {
  id: string;
  code: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}
