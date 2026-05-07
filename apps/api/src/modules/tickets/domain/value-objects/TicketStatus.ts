export const TICKET_STATUSES = [
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
] as const;

export type TicketStatusValue = (typeof TICKET_STATUSES)[number];

const ALLOWED_TRANSITIONS: Record<TicketStatusValue, ReadonlyArray<TicketStatusValue>> = {
  open: ['in_progress', 'waiting_customer', 'resolved', 'closed'],
  in_progress: ['waiting_customer', 'resolved', 'closed', 'open'],
  waiting_customer: ['in_progress', 'resolved', 'closed', 'open'],
  resolved: ['closed', 'open'],
  closed: ['open'],
};

export class TicketStatus {
  private constructor(public readonly value: TicketStatusValue) {}

  static create(value: TicketStatusValue): TicketStatus {
    return new TicketStatus(value);
  }

  canTransitionTo(next: TicketStatusValue): boolean {
    return ALLOWED_TRANSITIONS[this.value].includes(next);
  }

  isClosed(): boolean {
    return this.value === 'closed';
  }

  equals(other: TicketStatus): boolean {
    return this.value === other.value;
  }
}
