import { Entity } from '@/shared/domain/Entity';

export interface TicketMessageProps {
  ticketId: string;
  authorId: string | null;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: Date;
}

export class TicketMessage extends Entity<TicketMessageProps> {
  private constructor(props: TicketMessageProps, id?: string) {
    super(props, id);
  }

  static create(
    props: Omit<TicketMessageProps, 'createdAt'> & { createdAt?: Date },
    id?: string,
  ): TicketMessage {
    return new TicketMessage(
      {
        ...props,
        createdAt: props.createdAt ?? new Date(),
      },
      id,
    );
  }

  get ticketId() { return this.props.ticketId; }
  get authorId() { return this.props.authorId; }
  get authorName() { return this.props.authorName; }
  get content() { return this.props.content; }
  get isInternal() { return this.props.isInternal; }
  get createdAt() { return this.props.createdAt; }
}
