import Link from 'next/link';
import { headers } from 'next/headers';
import { API_BASE_URL } from '@/lib/api-client';
import { getServerSession } from '@/lib/auth-server';
import { TicketTableRow } from '@/components/features/tickets/TicketTableRow';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface TicketSummary {
  id: string;
  code: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  requesterName: string;
  requesterEmail: string;
  assigneeId: string | null;
  categorySlug: string | null;
  categoryName: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ListResponse {
  tickets: TicketSummary[];
  total: number;
}

async function fetchTickets(scope?: string): Promise<ListResponse | null> {
  const h = await headers();
  const cookie = h.get('cookie') ?? '';
  const url = new URL(`${API_BASE_URL}/api/tickets`);
  if (scope) url.searchParams.set('scope', scope);
  try {
    const res = await fetch(url, { headers: { cookie }, cache: 'no-store' });
    if (!res.ok) return null;
    return (await res.json()) as ListResponse;
  } catch {
    return null;
  }
}

export default async function DashboardPage() {
  const session = await getServerSession();
  const data = await fetchTickets();

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">
            Ola, <span>{session?.user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-ink-muted">
            {session?.user.role === 'customer'
              ? 'Acompanhe os seus chamados.'
              : 'Acompanhe os chamados em aberto.'}
          </p>
        </div>
        <Button asChild>
          <Link href="/tickets/novo">Novo ticket</Link>
        </Button>
      </div>

      {!data ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-ink-muted">
            Nao foi possivel carregar os tickets. Tente novamente em instantes.
          </CardContent>
        </Card>
      ) : data.tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            <p className="font-display text-2xl text-ink">Nenhum chamado por aqui</p>
            <p className="text-sm text-ink-muted">
              Quando voce abrir um ticket, ele aparece nesta lista.
            </p>
            <Button asChild>
              <Link href="/tickets/novo">Abrir o primeiro ticket</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Codigo</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead className="hidden w-48 md:table-cell">Solicitante</TableHead>
                  <TableHead className="w-40 text-right">Atualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.tickets.map((t) => (
                  <TicketTableRow
                    key={t.id}
                    code={t.code}
                    subject={t.subject}
                    status={t.status}
                    requesterName={t.requesterName}
                    requesterEmail={t.requesterEmail}
                    updatedAt={t.updatedAt}
                    categorySlug={t.categorySlug}
                    categoryName={t.categoryName}
                  />
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
