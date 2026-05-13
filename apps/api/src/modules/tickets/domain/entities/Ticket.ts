import { Entity } from '@/shared/domain/Entity';
import { TicketStatus, type TicketStatusValue } from '../value-objects/TicketStatus';
import { TicketPriority, type TicketPriorityValue } from '../value-objects/TicketPriority';
import { TicketCode } from '../value-objects/TicketCode';
import {
  InvalidTicketDataError,
  InvalidTicketStatusTransitionError,
  TicketClosedError,
} from '../errors/TicketErrors';

export interface TicketProps {
  sequence: number;
  code: TicketCode;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
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
  createdAt: Date;
  updatedAt: Date;
  closedAt: Date | null;
}

export interface CreateTicketInput {
  sequence: number;
  subject: string;
  description: string;
  priority?: TicketPriorityValue;
  categoryId?: string | null;
  requesterId?: string | null;
  requesterName: string;
  requesterEmail: string;
  clientType?: string | null;
  documentType?: string | null;
  productId?: string | null;
}

export class Ticket extends Entity<TicketProps> {
  private constructor(props: TicketProps, id?: string) {
    super(props, id);
  }

  static create(input: CreateTicketInput, id?: string): Ticket {
    if (input.subject.trim().length < 3) {
      throw new InvalidTicketDataError('Assunto muito curto');
    }
    if (input.description.trim().length < 10) {
      throw new InvalidTicketDataError('Descricao muito curta');
    }
    const now = new Date();
    return new Ticket(
      {
        sequence: input.sequence,
        code: TicketCode.fromSequence(input.sequence),
        subject: input.subject.trim(),
        description: input.description.trim(),
        status: TicketStatus.create('open'),
        priority: TicketPriority.create(input.priority ?? 'medium'),
        categoryId: input.categoryId ?? null,
        categorySlug: null,
        categoryName: null,
        requesterId: input.requesterId ?? null,
        requesterName: input.requesterName.trim(),
        requesterEmail: input.requesterEmail.trim().toLowerCase(),
        clientType: input.clientType ?? null,
        documentType: input.documentType ?? null,
        productId: input.productId ?? null,
        productName: null,
        assigneeId: null,
        createdAt: now,
        updatedAt: now,
        closedAt: null,
      },
      id,
    );
  }

  static restore(props: TicketProps, id: string): Ticket {
    return new Ticket(props, id);
  }

  changeStatusTo(next: TicketStatusValue): void {
    if (!this.props.status.canTransitionTo(next)) {
      throw new InvalidTicketStatusTransitionError(
        `Transicao de status invalida: ${this.props.status.value} -> ${next}`,
      );
    }
    this.props.status = TicketStatus.create(next);
    this.props.updatedAt = new Date();
    if (next === 'closed') this.props.closedAt = new Date();
    if (next === 'open') this.props.closedAt = null;
  }

  assignTo(userId: string): void {
    if (this.props.status.isClosed()) {
      throw new TicketClosedError('Nao e possivel atribuir um ticket fechado');
    }
    this.props.assigneeId = userId;
    this.props.updatedAt = new Date();
  }

  unassign(): void {
    this.props.assigneeId = null;
    this.props.updatedAt = new Date();
  }

  registerReply(): void {
    if (this.props.status.isClosed()) {
      throw new TicketClosedError('Nao e possivel responder um ticket fechado');
    }
    this.props.updatedAt = new Date();
  }

  // Getters
  get sequence() {
    return this.props.sequence;
  }
  get code() {
    return this.props.code;
  }
  get subject() {
    return this.props.subject;
  }
  get description() {
    return this.props.description;
  }
  get status() {
    return this.props.status;
  }
  get priority() {
    return this.props.priority;
  }
  get categoryId() {
    return this.props.categoryId;
  }
  get categorySlug() {
    return this.props.categorySlug;
  }
  get categoryName() {
    return this.props.categoryName;
  }
  get requesterId() {
    return this.props.requesterId;
  }
  get requesterName() {
    return this.props.requesterName;
  }
  get requesterEmail() {
    return this.props.requesterEmail;
  }
  get clientType() {
    return this.props.clientType;
  }
  get documentType() {
    return this.props.documentType;
  }
  get productId() {
    return this.props.productId;
  }
  get productName() {
    return this.props.productName;
  }
  get assigneeId() {
    return this.props.assigneeId;
  }
  get createdAt() {
    return this.props.createdAt;
  }
  get updatedAt() {
    return this.props.updatedAt;
  }
  get closedAt() {
    return this.props.closedAt;
  }
}
