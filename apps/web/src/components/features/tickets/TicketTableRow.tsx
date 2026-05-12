'use client';

import { useRouter } from 'next/navigation';
import {
  Settings,
  UserRound,
  Ban,
  Link2,
  BookOpen,
  CreditCard,
  AlertTriangle,
  HelpCircle,
  type LucideIcon,
} from 'lucide-react';
import { TableCell, TableRow } from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { TicketStatusBadge } from './TicketStatusBadge';

const CATEGORY_ICONS: Record<string, { icon: LucideIcon }> = {
  'dados-cadastrais': { icon: Settings },
  'troca-titularidade': { icon: UserRound },
  'cancelamento-conta': { icon: Ban },
  'unificacao-contas': { icon: Link2 },
  'sem-acesso-curso': { icon: BookOpen },
  'pagamentos-faturas': { icon: CreditCard },
  'problemas-tecnicos': { icon: AlertTriangle },
  'outros-assuntos': { icon: HelpCircle },
};

interface TicketRowProps {
  code: string;
  subject: string;
  status: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  requesterName: string;
  requesterEmail: string;
  updatedAt: string;
  categorySlug: string | null;
  categoryName: string | null;
}

const fmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function TicketTableRow({
  code,
  subject,
  status,
  requesterName,
  requesterEmail,
  updatedAt,
  categorySlug,
  categoryName,
}: TicketRowProps) {
  const router = useRouter();
  const category = categorySlug ? CATEGORY_ICONS[categorySlug] : null;
  const Icon = category?.icon ?? HelpCircle;

  return (
    <TableRow className="cursor-pointer" onClick={() => router.push(`/tickets/${code}`)}>
      <TableCell className="font-mono text-xs text-ink-soft">{code}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex size-7 shrink-0 cursor-default items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon className="size-4" />
                </div>
              </TooltipTrigger>
              {categoryName && (
                <TooltipContent side="top">
                  <p>{categoryName}</p>
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <span className="text-ink">{subject}</span>
        </div>
      </TableCell>
      <TableCell>
        <TicketStatusBadge status={status} />
      </TableCell>
      <TableCell className="hidden md:table-cell">
        <div className="text-sm">{requesterName}</div>
        <div className="text-xs text-ink-muted">{requesterEmail}</div>
      </TableCell>
      <TableCell className="text-right text-xs text-ink-muted">
        {fmt.format(new Date(updatedAt))}
      </TableCell>
    </TableRow>
  );
}
