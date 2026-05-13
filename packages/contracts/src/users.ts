import { z } from 'zod';

export const inviteUserSchema = z.object({
  name: z.string().trim().min(2, 'Nome muito curto'),
  email: z.string().trim().email('E-mail inválido'),
  role: z.enum(['admin', 'agent', 'customer']).optional().default('customer'),
});
export type InviteUserInput = z.output<typeof inviteUserSchema>;
