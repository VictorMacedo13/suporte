import { and, desc, eq, ilike, ne, or, sql, type SQL } from 'drizzle-orm';
import { schema, type DB } from '@dgcom/db';
import { Ticket } from '../../domain/entities/Ticket';
import { TicketMessage } from '../../domain/entities/TicketMessage';
import { TicketCode } from '../../domain/value-objects/TicketCode';
import { TicketStatus } from '../../domain/value-objects/TicketStatus';
import { TicketPriority } from '../../domain/value-objects/TicketPriority';
import type {
  ITicketRepository,
  ListTicketsFilter,
  ListTicketsResult,
  RecordStatusChangeInput,
} from '../../domain/repositories/ITicketRepository';

const { tickets, ticketMessages, ticketStatusHistory, ticketCategories, products } = schema;

export class DrizzleTicketRepository implements ITicketRepository {
  constructor(private readonly db: DB) {}

  async create(input: {
    subject: string;
    description: string;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    categoryId?: string | null;
    categorySlug?: string | null;
    requesterId?: string | null;
    requesterName: string;
    requesterEmail: string;
    clientType?: string | null;
    documentType?: string | null;
    productId?: string | null;
  }): Promise<Ticket> {
    // Resolve categoryId a partir do slug, se fornecido
    let resolvedCategoryId = input.categoryId ?? null;
    if (!resolvedCategoryId && input.categorySlug) {
      const cat = await this.db.query.ticketCategories.findFirst({
        where: eq(schema.ticketCategories.slug, input.categorySlug),
      });
      resolvedCategoryId = cat?.id ?? null;
    }

    // Insere com placeholder de code; sequence e gerado pelo Postgres.
    // Apos inserir, atualiza com code real "DG-XXXX" usando o sequence retornado.
    const [inserted] = await this.db
      .insert(tickets)
      .values({
        code: 'pending',
        subject: input.subject.trim(),
        description: input.description.trim(),
        priority: input.priority ?? 'medium',
        categoryId: resolvedCategoryId,
        requesterId: input.requesterId ?? null,
        requesterName: input.requesterName.trim(),
        requesterEmail: input.requesterEmail.trim().toLowerCase(),
        clientType: (input.clientType ?? null) as
          | 'produtor'
          | 'afiliado'
          | 'comprador'
          | 'agencia'
          | null,
        documentType: (input.documentType ?? null) as 'cpf' | 'cnpj' | null,
        productId: input.productId ?? null,
      })
      .returning();

    if (!inserted) throw new Error('Falha ao criar ticket');

    const code = TicketCode.fromSequence(inserted.sequence).value;
    const [updated] = await this.db
      .update(tickets)
      .set({ code })
      .where(eq(tickets.id, inserted.id))
      .returning();

    if (!updated) throw new Error('Falha ao atualizar codigo do ticket');

    return this.toEntity(updated);
  }

  async save(ticket: Ticket): Promise<void> {
    await this.db
      .update(tickets)
      .set({
        subject: ticket.subject,
        description: ticket.description,
        status: ticket.status.value,
        priority: ticket.priority.value,
        categoryId: ticket.categoryId,
        assigneeId: ticket.assigneeId,
        updatedAt: ticket.updatedAt,
        closedAt: ticket.closedAt,
      })
      .where(eq(tickets.id, ticket.id));
  }

  async findById(id: string): Promise<Ticket | null> {
    const row = await this.db.query.tickets.findFirst({ where: eq(tickets.id, id) });
    return row ? this.toEntity(row) : null;
  }

  async findByCode(code: string): Promise<Ticket | null> {
    const rows = await this.db
      .select({
        ticket: tickets,
        categorySlug: ticketCategories.slug,
        categoryName: ticketCategories.name,
        productName: products.name,
      })
      .from(tickets)
      .leftJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id))
      .leftJoin(products, eq(tickets.productId, products.id))
      .where(eq(tickets.code, code))
      .limit(1);

    const row = rows[0];
    if (!row) return null;
    return this.toEntity(
      row.ticket,
      row.categorySlug ?? null,
      row.categoryName ?? null,
      row.productName ?? null,
    );
  }

  async list(filter: ListTicketsFilter): Promise<ListTicketsResult> {
    const where: SQL[] = [];
    if (filter.status) {
      where.push(eq(tickets.status, filter.status));
    } else {
      where.push(ne(tickets.status, 'closed'));
    }
    if (filter.requesterId) where.push(eq(tickets.requesterId, filter.requesterId));
    if (filter.assigneeId) where.push(eq(tickets.assigneeId, filter.assigneeId));
    if (filter.search) {
      const q = `%${filter.search}%`;
      const searchExpr = or(
        ilike(tickets.subject, q),
        ilike(tickets.code, q),
        ilike(tickets.requesterEmail, q),
        ilike(tickets.requesterName, q),
      );
      if (searchExpr) where.push(searchExpr);
    }
    const whereExpr = where.length > 0 ? and(...where) : undefined;

    const rows = await this.db
      .select({
        ticket: tickets,
        categorySlug: ticketCategories.slug,
        categoryName: ticketCategories.name,
      })
      .from(tickets)
      .leftJoin(ticketCategories, eq(tickets.categoryId, ticketCategories.id))
      .where(whereExpr)
      .orderBy(desc(tickets.updatedAt))
      .limit(filter.limit ?? 20)
      .offset(filter.offset ?? 0);

    const totalRows = await this.db
      .select({ count: sql<number>`count(*)::int` })
      .from(tickets)
      .where(whereExpr);

    return {
      tickets: rows.map((r) =>
        this.toEntity(r.ticket, r.categorySlug ?? null, r.categoryName ?? null),
      ),
      total: totalRows[0]?.count ?? 0,
    };
  }

  async appendMessage(message: TicketMessage): Promise<void> {
    await this.db.insert(ticketMessages).values({
      id: message.id,
      ticketId: message.ticketId,
      authorId: message.authorId,
      authorName: message.authorName,
      content: message.content,
      isInternal: message.isInternal,
      createdAt: message.createdAt,
    });
  }

  async listMessages(
    ticketId: string,
    opts?: { includeInternal: boolean },
  ): Promise<TicketMessage[]> {
    const conditions: SQL[] = [eq(ticketMessages.ticketId, ticketId)];
    if (!opts?.includeInternal) conditions.push(eq(ticketMessages.isInternal, false));
    const rows = await this.db
      .select()
      .from(ticketMessages)
      .where(and(...conditions))
      .orderBy(ticketMessages.createdAt);

    return rows.map((r) =>
      TicketMessage.create(
        {
          ticketId: r.ticketId,
          authorId: r.authorId,
          authorName: r.authorName,
          content: r.content,
          isInternal: r.isInternal,
          createdAt: r.createdAt,
        },
        r.id,
      ),
    );
  }

  async recordStatusChange(input: RecordStatusChangeInput): Promise<void> {
    await this.db.insert(ticketStatusHistory).values({
      ticketId: input.ticketId,
      fromStatus: input.fromStatus,
      toStatus: input.toStatus,
      changedById: input.changedById,
      note: input.note,
    });
  }

  private toEntity(
    row: typeof tickets.$inferSelect,
    categorySlug: string | null = null,
    categoryName: string | null = null,
    productName: string | null = null,
  ): Ticket {
    return Ticket.restore(
      {
        sequence: row.sequence,
        code: TicketCode.fromString(row.code),
        subject: row.subject,
        description: row.description,
        status: TicketStatus.create(row.status),
        priority: TicketPriority.create(row.priority),
        categoryId: row.categoryId,
        categorySlug,
        categoryName,
        requesterId: row.requesterId,
        requesterName: row.requesterName,
        requesterEmail: row.requesterEmail,
        clientType: row.clientType,
        documentType: row.documentType,
        productId: row.productId ?? null,
        productName,
        assigneeId: row.assigneeId,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        closedAt: row.closedAt,
      },
      row.id,
    );
  }
}
