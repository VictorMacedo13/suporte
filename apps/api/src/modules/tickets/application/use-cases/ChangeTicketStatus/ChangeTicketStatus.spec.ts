import { describe, it, expect, beforeEach } from 'vitest';
import { ChangeTicketStatus } from './ChangeTicketStatus';
import { CreateTicket } from '../CreateTicket/CreateTicket';
import { InMemoryTicketRepository } from '../../../infrastructure/repositories/InMemoryTicketRepository';

describe('ChangeTicketStatus', () => {
  let repo: InMemoryTicketRepository;
  let createTicket: CreateTicket;
  let useCase: ChangeTicketStatus;

  beforeEach(() => {
    repo = new InMemoryTicketRepository();
    createTicket = new CreateTicket(repo);
    useCase = new ChangeTicketStatus(repo);
  });

  async function seed(): Promise<string> {
    const r = await createTicket.execute({
      subject: 'Assunto qualquer',
      description: 'Descricao com tamanho suficiente para validar',
      requesterName: 'Maria',
      requesterEmail: 'maria@example.com',
    });
    if (!r.isRight()) throw new Error('seed failed');
    return r.value.code;
  }

  it('muda status open -> in_progress', async () => {
    const code = await seed();
    const result = await useCase.execute({
      ticketCode: code,
      toStatus: 'in_progress',
      changedById: 'agent-1',
    });
    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.fromStatus).toBe('open');
      expect(result.value.toStatus).toBe('in_progress');
    }
  });

  it('rejeita transicao invalida', async () => {
    const code = await seed();
    await useCase.execute({ ticketCode: code, toStatus: 'closed', changedById: 'agent-1' });
    // de closed so pode ir para open; tentar in_progress falha
    const result = await useCase.execute({
      ticketCode: code,
      toStatus: 'in_progress',
      changedById: 'agent-1',
    });
    expect(result.isLeft()).toBe(true);
  });

  it('registra mudanca no historico', async () => {
    const code = await seed();
    await useCase.execute({ ticketCode: code, toStatus: 'in_progress', changedById: 'agent-1' });
    // 1 do create + 1 da mudanca
    expect(repo.statusHistory).toHaveLength(2);
    expect(repo.statusHistory[1]?.fromStatus).toBe('open');
    expect(repo.statusHistory[1]?.toStatus).toBe('in_progress');
  });
});
