import { getServerSession } from '@/lib/auth-server';
import { AuthenticatedTicketForm } from '@/components/features/tickets/AuthenticatedTicketForm';

export default async function NovoTicketAuthPage() {
  const session = await getServerSession();
  if (!session) return null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">
          Abrir um <span>novo ticket</span>
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Conta o que esta acontecendo. Quanto mais detalhes, mais rapido a gente resolve.
        </p>
      </div>

      <AuthenticatedTicketForm defaultName={session.user.name} defaultEmail={session.user.email} />
    </div>
  );
}
