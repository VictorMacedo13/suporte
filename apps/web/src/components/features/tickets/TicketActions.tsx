'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Status = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

const STATUS_OPTIONS: { value: Status; label: string }[] = [
  { value: 'open', label: 'Aberto' },
  { value: 'in_progress', label: 'Em atendimento' },
  { value: 'waiting_customer', label: 'Aguardando cliente' },
  { value: 'resolved', label: 'Resolvido' },
  { value: 'closed', label: 'Fechado' },
];

interface Props {
  ticketCode: string;
  currentStatus: Status;
}

export function TicketActions({ ticketCode, currentStatus }: Props) {
  const router = useRouter();
  const [next, setNext] = useState<Status>(currentStatus);
  const [loading, setLoading] = useState(false);

  async function handleChangeStatus() {
    if (next === currentStatus) return;
    setLoading(true);
    try {
      await apiClient.patch(`/api/tickets/${encodeURIComponent(ticketCode)}/status`, {
        toStatus: next,
      });
      toast.success('Status atualizado');
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao mudar status';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-wrap items-center justify-between gap-3 py-4">
        <div>
          <h3 className="text-sm font-medium text-ink">Acoes da equipe</h3>
          <p className="text-xs text-ink-muted">Mude o status do ticket conforme o atendimento.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={next} onValueChange={(v) => setNext(v as Status)}>
            <SelectTrigger className="w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={handleChangeStatus} disabled={loading || next === currentStatus}>
            {loading ? 'Atualizando...' : 'Salvar'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
