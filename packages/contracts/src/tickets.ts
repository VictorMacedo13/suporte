import { z } from 'zod';

export const ticketStatusSchema = z.enum([
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
]);
export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export const ticketPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export const clientTypeSchema = z.enum(['produtor', 'afiliado', 'comprador', 'agencia']);
export type ClientType = z.infer<typeof clientTypeSchema>;

export const documentTypeSchema = z.enum(['cpf', 'cnpj']);
export type DocumentType = z.infer<typeof documentTypeSchema>;

/**
 * Form público (sem autenticação) — espelha suporte.eduzz.com.
 */
export const createPublicTicketSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.email('E-mail inválido').trim(),
  clientType: clientTypeSchema.optional(),
  documentType: documentTypeSchema.optional(),
  productId: z.string().uuid().optional(),
  subject: z.string().trim().min(3, 'Assunto muito curto').max(200),
  description: z.string().trim().min(10, 'Descreva melhor o problema'),
  categorySlug: z.string().trim().optional(),
});
export type CreatePublicTicketInput = z.infer<typeof createPublicTicketSchema>;

export const replyTicketSchema = z.object({
  content: z.string().trim().min(1, 'Mensagem vazia'),
  isInternal: z.boolean().default(false),
});
/** Tipo de entrada (form). isInternal e opcional pois tem default. */
export type ReplyTicketInput = z.input<typeof replyTicketSchema>;
/** Tipo apos parse (servidor). isInternal e sempre boolean. */
export type ReplyTicketParsed = z.output<typeof replyTicketSchema>;

export const changeTicketStatusSchema = z.object({
  toStatus: ticketStatusSchema,
  note: z.string().trim().max(500).optional(),
});
export type ChangeTicketStatusInput = z.infer<typeof changeTicketStatusSchema>;

export const ticketSummarySchema = z.object({
  id: z.uuid(),
  code: z.string(),
  subject: z.string(),
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  requesterName: z.string(),
  requesterEmail: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type TicketSummary = z.infer<typeof ticketSummarySchema>;
