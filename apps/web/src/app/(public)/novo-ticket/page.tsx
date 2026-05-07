import Link from 'next/link';
import { NewTicketForm } from '@/components/features/tickets/NewTicketForm';

export default function NovoTicketPage() {
  return (
    <main className="min-h-dvh bg-secondary/40">
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="mb-8 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Suporte DGcom
          </span>
          <h1 className="mt-2 font-display text-4xl text-ink md:text-5xl">
            Como podemos te <span className="italic">ajudar</span>?
          </h1>
          <p className="mt-3 text-sm text-ink-muted">
            Preencha o formulario abaixo e nossa equipe respondera no email informado.
          </p>
        </div>

        <NewTicketForm />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Ja possui conta?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </main>
  );
}
