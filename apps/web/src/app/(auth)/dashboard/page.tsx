import Link from 'next/link';
import { getServerSession } from '@/lib/auth-server';
import { TicketList } from '@/components/features/tickets/TicketList';
import { Button } from '@/components/ui/button';

export default async function DashboardPage() {
  const session = await getServerSession();
  const isCustomer = session?.user.role === 'customer';

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl text-ink">
            Olá, <span>{session?.user.name.split(' ')[0]}</span>
          </h1>
          <p className="text-sm text-ink-muted">
            {isCustomer ? 'Acompanhe os seus chamados.' : 'Acompanhe os chamados em aberto.'}
          </p>
        </div>
        <Button asChild>
          <Link href="/tickets/novo">Novo ticket</Link>
        </Button>
      </div>

      <TicketList isCustomer={isCustomer} />
    </div>
  );
}
