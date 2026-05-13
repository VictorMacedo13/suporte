import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api-client';
import { getServerSession } from '@/lib/auth-server';
import { TicketStatusBadge } from '@/components/features/tickets/TicketStatusBadge';
import { TicketThread } from '@/components/features/tickets/TicketThread';
import { TicketActions } from '@/components/features/tickets/TicketActions';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface TicketMessageDTO {
  id: string;
  authorId: string | null;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

interface TicketDetailDTO {
  id: string;
  code: string;
  subject: string;
  description: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requesterName: string;
  requesterEmail: string;
  requesterId: string | null;
  assigneeId: string | null;
  categoryId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  clientType: string | null;
  documentType: string | null;
  productId: string | null;
  productName: string | null;
  createdAt: string;
  updatedAt: string;
  closedAt: string | null;
  messages: TicketMessageDTO[];
}

async function fetchTicket(code: string): Promise<TicketDetailDTO | null> {
  const h = await headers();
  const cookie = h.get('cookie') ?? '';
  try {
    const res = await fetch(`${API_BASE_URL}/api/tickets/${encodeURIComponent(code)}`, {
      headers: { cookie },
      cache: 'no-store',
    });
    if (res.status === 404) return null;
    if (!res.ok) return null;
    return (await res.json()) as TicketDetailDTO;
  } catch {
    return null;
  }
}

const fmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

const clientTypeLabel: Record<string, string> = {
  produtor: 'Produtor',
  afiliado: 'Afiliado',
  comprador: 'Comprador',
  agencia: 'Agência',
};

export default async function TicketDetailPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const [session, ticket] = await Promise.all([getServerSession(), fetchTicket(code)]);
  if (!session) return null;
  if (!ticket) notFound();

  const canChangeStatus = session.user.role === 'admin' || session.user.role === 'agent';

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-ink-muted">{ticket.code}</span>
            <TicketStatusBadge status={ticket.status} />
          </div>
          <h1 className="font-display text-3xl text-ink">{ticket.subject}</h1>
          <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-muted">
            <span>
              <strong className="font-medium text-ink-soft">Solicitante:</strong>{' '}
              {ticket.requesterName} ({ticket.requesterEmail})
            </span>
            {ticket.categoryName && (
              <span>
                <strong className="font-medium text-ink-soft">Assunto:</strong>{' '}
                {ticket.categoryName}
              </span>
            )}
            {ticket.clientType && (
              <span>
                <strong className="font-medium text-ink-soft">Tipo de cliente:</strong>{' '}
                {clientTypeLabel[ticket.clientType] ?? ticket.clientType}
              </span>
            )}
            {ticket.documentType && (
              <span>
                <strong className="font-medium text-ink-soft">Documento:</strong>{' '}
                {ticket.documentType.toUpperCase()}
              </span>
            )}
            {ticket.productName && (
              <span>
                <strong className="font-medium text-ink-soft">Produto:</strong> {ticket.productName}
              </span>
            )}
            <span>
              <strong className="font-medium text-ink-soft">Aberto em:</strong>{' '}
              {fmt.format(new Date(ticket.createdAt))}
            </span>
            <span>
              <strong className="font-medium text-ink-soft">Atualizado:</strong>{' '}
              {fmt.format(new Date(ticket.updatedAt))}
            </span>
          </div>
        </CardHeader>
        <Separator />
        <CardContent className="pt-6">
          <p className="whitespace-pre-wrap text-sm text-ink">{ticket.description}</p>
        </CardContent>
      </Card>

      <TicketThread
        ticketCode={ticket.code}
        initialMessages={ticket.messages}
        currentUserId={session.user.id}
        currentUserName={session.user.name}
        canPostInternal={canChangeStatus}
      />

      {canChangeStatus && <TicketActions ticketCode={ticket.code} currentStatus={ticket.status} />}
    </div>
  );
}
