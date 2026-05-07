import { describe, it, expect, beforeEach } from 'vitest';
import { ReplyToTicket } from './ReplyToTicket';
import { CreateTicket } from '../CreateTicket/CreateTicket';
import { InMemoryTicketRepository } from '../../../infrastructure/repositories/InMemoryTicketRepository';

describe('ReplyToTicket', () => {
  let repo: InMemoryTicketRepository;
  let createTicket: CreateTicket;
  let useCase: ReplyToTicket;

  beforeEach(() => {
    repo = new InMemoryTicketRepository();
    createTicket = new CreateTicket(repo);
    useCase = new ReplyToTicket(repo);
  });

  async function seedTicket(): Promise<string> {
    const result = await createTicket.execute({
      subject: 'Assunto qualquer',
      description: 'Descricao com tamanho suficiente para validar',
      requesterName: 'Maria',
      requesterEmail: 'maria@example.com',
    });
    if (!result.isRight()) throw new Error('seed failed');
    return result.value.code;
  }

  it('adiciona uma resposta a um ticket existente', async () => {
    const code = await seedTicket();
    const result = await useCase.execute({
      ticketCode: code,
      authorId: null,
      authorName: 'Atendente',
      content: 'Ola, vamos verificar',
    });

    expect(result.isRight()).toBe(true);
    expect(repo.messages).toHaveLength(1);
    expect(repo.messages[0]?.content).toBe('Ola, vamos verificar');
  });

  it('retorna Left para ticket inexistente', async () => {
    const result = await useCase.execute({
      ticketCode: 'DG-9999',
      authorId: null,
      authorName: 'X',
      content: 'mensagem',
    });
    expect(result.isLeft()).toBe(true);
  });

  it('marca como interna quando isInternal=true', async () => {
    const code = await seedTicket();
    await useCase.execute({
      ticketCode: code,
      authorId: 'agent-1',
      authorName: 'Atendente',
      content: 'nota interna',
      isInternal: true,
    });
    expect(repo.messages[0]?.isInternal).toBe(true);
  });
});
