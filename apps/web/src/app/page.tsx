import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <main className="container mx-auto flex min-h-dvh flex-col items-center justify-center gap-8 px-4 text-center">
      <div className="flex flex-col items-center gap-4">
        <span className="text-xs font-semibold uppercase tracking-wider text-primary">DGcom</span>
        <h1 className="font-display text-5xl text-ink md:text-6xl">
          Central de <span>suporte</span>
        </h1>
        <p className="max-w-prose text-base text-ink-muted">
          Abra um chamado, acompanhe o status e converse com nossa equipe sem complicacao.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg">
          <Link href="/novo-ticket">Abrir um chamado</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link href="/login">Acessar minha conta</Link>
        </Button>
      </div>
    </main>
  );
}
