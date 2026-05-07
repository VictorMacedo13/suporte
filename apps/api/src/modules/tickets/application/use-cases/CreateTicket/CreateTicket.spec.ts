import { describe, it, expect, beforeEach } from 'vitest';
import { CreateTicket } from './CreateTicket';
import { InMemoryTicketRepository } from '../../../infrastructure/repositories/InMemoryTicketRepository';

describe('CreateTicket', () => {
  let repo: InMemoryTicketRepository;
  let useCase: CreateTicket;

  beforeEach(() => {
    repo = new InMemoryTicketRepository();
    useCase = new CreateTicket(repo);
  });

  it('cria um ticket com codigo sequencial DG-XXXX', async () => {
    const result = await useCase.execute({
      subject: 'Nao consigo emitir nota',
      description: 'Mensagem de erro ao gerar a NFS-e no painel',
      requesterName: 'Maria',
      requesterEmail: 'maria@example.com',
    });

    expect(result.isRight()).toBe(true);
    if (result.isRight()) {
      expect(result.value.code).toBe('DG-0001');
      expect(result.value.status).toBe('open');
    }
    expect(repo.tickets).toHaveLength(1);
  });

  it('incrementa o codigo a cada novo ticket', async () => {
    await useCase.execute({
      subject: 'Primeiro ticket',
      description: 'Descricao do primeiro ticket',
      requesterName: 'Ana',
      requesterEmail: 'ana@example.com',
    });
    const second = await useCase.execute({
      subject: 'Segundo ticket',
      description: 'Descricao do segundo ticket',
      requesterName: 'Bruno',
      requesterEmail: 'bruno@example.com',
    });

    expect(second.isRight()).toBe(true);
    if (second.isRight()) expect(second.value.code).toBe('DG-0002');
  });

  it('retorna Left quando o assunto for invalido', async () => {
    const result = await useCase.execute({
      subject: 'aa',
      description: 'descricao com tamanho suficiente',
      requesterName: 'Carlos',
      requesterEmail: 'carlos@example.com',
    });

    expect(result.isLeft()).toBe(true);
  });

  it('registra o evento inicial no historico de status', async () => {
    await useCase.execute({
      subject: 'Assunto valido aqui',
      description: 'Descricao com tamanho suficiente para passar',
      requesterName: 'Diana',
      requesterEmail: 'diana@example.com',
    });

    expect(repo.statusHistory).toHaveLength(1);
    expect(repo.statusHistory[0]?.toStatus).toBe('open');
    expect(repo.statusHistory[0]?.fromStatus).toBe(null);
  });
});
