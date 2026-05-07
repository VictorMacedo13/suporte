import type { TicketStatusValue } from '../../../domain/value-objects/TicketStatus';

export interface ChangeTicketStatusInput {
  ticketCode: string;
  toStatus: TicketStatusValue;
  changedById: string | null;
  note?: string;
}

export interface ChangeTicketStatusOutput {
  ticketCode: string;
  fromStatus: TicketStatusValue;
  toStatus: TicketStatusValue;
}
