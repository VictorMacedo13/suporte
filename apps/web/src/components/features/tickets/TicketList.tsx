'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { apiClient } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { TicketTableRow } from './TicketTableRow';

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

const PAGE_SIZE = 20;

interface Props {
  isCustomer: boolean;
}

export function TicketList({ isCustomer }: Props) {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce the search input (300 ms)
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // reset to page 1 on new search
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    setError(false);
    try {
      const params = new URLSearchParams({
        limit: String(PAGE_SIZE),
        offset: String((page - 1) * PAGE_SIZE),
      });
      if (debouncedSearch) params.set('search', debouncedSearch);
      const data = await apiClient.get<ListResponse>(`/api/tickets?${params}`);
      setTickets(data.tickets);
      setTotal(data.total);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <Input
          className="pl-9"
          placeholder="Pesquisar por assunto, código, nome ou e-mail..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-ink-muted">
            Carregando chamados...
          </CardContent>
        </Card>
      ) : error ? (
        <Card>
          <CardContent className="py-12 text-center text-sm text-ink-muted">
            Não foi possível carregar os tickets. Tente novamente em instantes.
          </CardContent>
        </Card>
      ) : tickets.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-16 text-center">
            {debouncedSearch ? (
              <>
                <p className="font-display text-2xl text-ink">Nenhum resultado</p>
                <p className="text-sm text-ink-muted">
                  Nenhum chamado encontrado para &quot;{debouncedSearch}&quot;.
                </p>
                <Button variant="outline" onClick={() => setSearch('')}>
                  Limpar pesquisa
                </Button>
              </>
            ) : (
              <>
                <p className="font-display text-2xl text-ink">Nenhum chamado por aqui</p>
                <p className="text-sm text-ink-muted">
                  {isCustomer
                    ? 'Quando você abrir um ticket, ele aparece nesta lista.'
                    : 'Não há chamados em aberto no momento.'}
                </p>
                {isCustomer && (
                  <Button asChild>
                    <Link href="/tickets/novo">Abrir o primeiro ticket</Link>
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-28">Código</TableHead>
                  <TableHead>Assunto</TableHead>
                  <TableHead className="w-40">Status</TableHead>
                  <TableHead className="hidden w-48 md:table-cell">Solicitante</TableHead>
                  <TableHead className="w-40 text-right">Atualizado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((t) => (
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

      {/* Pagination */}
      {!loading && !error && total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-ink-muted">
          <span>
            {total} chamado{total !== 1 ? 's' : ''} · página {page} de {totalPages}
          </span>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
            >
              Próximo
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
