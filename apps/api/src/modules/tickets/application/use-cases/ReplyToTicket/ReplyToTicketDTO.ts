export interface ReplyToTicketInput {
  ticketCode: string;
  authorId: string | null;
  authorName: string;
  content: string;
  isInternal?: boolean;
}

export interface ReplyToTicketOutput {
  messageId: string;
  ticketCode: string;
  createdAt: string;
}
