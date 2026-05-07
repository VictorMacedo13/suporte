export const TICKET_PRIORITIES = ['low', 'medium', 'high', 'urgent'] as const;
export type TicketPriorityValue = (typeof TICKET_PRIORITIES)[number];

export class TicketPriority {
  private constructor(public readonly value: TicketPriorityValue) {}

  static create(value: TicketPriorityValue = 'medium'): TicketPriority {
    return new TicketPriority(value);
  }

  equals(other: TicketPriority): boolean {
    return this.value === other.value;
  }
}
