import { DomainError } from '@/shared/domain/errors/DomainError';

export class TicketNotFoundError extends DomainError {
  readonly code = 'TICKET_NOT_FOUND';
  readonly httpStatus = 404;
}

export class InvalidTicketStatusTransitionError extends DomainError {
  readonly code = 'INVALID_TICKET_STATUS_TRANSITION';
  readonly httpStatus = 422;
}

export class InvalidTicketDataError extends DomainError {
  readonly code = 'INVALID_TICKET_DATA';
  readonly httpStatus = 400;
}

export class TicketClosedError extends DomainError {
  readonly code = 'TICKET_CLOSED';
  readonly httpStatus = 422;
}
