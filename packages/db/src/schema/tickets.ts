import {
  pgTable,
  text,
  timestamp,
  pgEnum,
  serial,
  integer,
  boolean,
  uuid,
  index,
} from 'drizzle-orm/pg-core';
import { users } from './auth';

export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
]);

export const ticketPriorityEnum = pgEnum('ticket_priority', ['low', 'medium', 'high', 'urgent']);

export const ticketCategories = pgTable('ticket_categories', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull(),
  slug: text('slug').notNull().unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    sequence: serial('sequence').notNull(),
    code: text('code').notNull().unique(),
    subject: text('subject').notNull(),
    description: text('description').notNull(),
    status: ticketStatusEnum('status').notNull().default('open'),
    priority: ticketPriorityEnum('priority').notNull().default('medium'),
    categoryId: uuid('category_id').references(() => ticketCategories.id, {
      onDelete: 'set null',
    }),
    requesterId: text('requester_id').references(() => users.id, { onDelete: 'set null' }),
    requesterName: text('requester_name').notNull(),
    requesterEmail: text('requester_email').notNull(),
    assigneeId: text('assignee_id').references(() => users.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    closedAt: timestamp('closed_at', { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index('tickets_status_idx').on(table.status),
    requesterIdx: index('tickets_requester_idx').on(table.requesterId),
    assigneeIdx: index('tickets_assignee_idx').on(table.assigneeId),
  }),
);

export const ticketMessages = pgTable(
  'ticket_messages',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    authorId: text('author_id').references(() => users.id, { onDelete: 'set null' }),
    authorName: text('author_name').notNull(),
    content: text('content').notNull(),
    isInternal: boolean('is_internal').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    ticketIdx: index('ticket_messages_ticket_idx').on(table.ticketId),
  }),
);

export const ticketStatusHistory = pgTable('ticket_status_history', {
  id: uuid('id').primaryKey().defaultRandom(),
  ticketId: uuid('ticket_id')
    .notNull()
    .references(() => tickets.id, { onDelete: 'cascade' }),
  fromStatus: ticketStatusEnum('from_status'),
  toStatus: ticketStatusEnum('to_status').notNull(),
  changedById: text('changed_by_id').references(() => users.id, { onDelete: 'set null' }),
  changedAt: timestamp('changed_at', { withTimezone: true }).notNull().defaultNow(),
  note: text('note'),
});

export type Ticket = typeof tickets.$inferSelect;
export type NewTicket = typeof tickets.$inferInsert;
export type TicketStatus = (typeof ticketStatusEnum.enumValues)[number];
export type TicketPriority = (typeof ticketPriorityEnum.enumValues)[number];
export type TicketMessage = typeof ticketMessages.$inferSelect;
export type TicketCategory = typeof ticketCategories.$inferSelect;
