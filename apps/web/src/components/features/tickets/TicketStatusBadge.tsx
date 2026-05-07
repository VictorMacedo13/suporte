import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type Status = 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';

const STATUS_CONFIG: Record<Status, { label: string; className: string }> = {
  open: {
    label: 'Aberto',
    className: 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/15',
  },
  in_progress: {
    label: 'Em atendimento',
    className: 'bg-accent/15 text-accent-foreground border-accent/30 hover:bg-accent/20',
  },
  waiting_customer: {
    label: 'Aguardando cliente',
    className: 'bg-secondary text-ink border-border hover:bg-secondary/80',
  },
  resolved: {
    label: 'Resolvido',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100',
  },
  closed: {
    label: 'Fechado',
    className: 'bg-muted text-ink-muted border-border hover:bg-muted',
  },
};

export function TicketStatusBadge({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) {
  const config = STATUS_CONFIG[status];
  return (
    <Badge variant="outline" className={cn(config.className, 'font-medium', className)}>
      {config.label}
    </Badge>
  );
}
