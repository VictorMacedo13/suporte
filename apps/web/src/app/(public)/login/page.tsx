import Link from 'next/link';
import { LoginForm } from '@/components/features/auth/LoginForm';

export default function LoginPage() {
  return (
    <main className="min-h-dvh bg-secondary/40">
      <div className="container mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4">
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Suporte DGcom
          </span>
          <h1 className="mt-2 font-display text-3xl text-ink">
            Acesse sua <span className="italic">conta</span>
          </h1>
        </div>

        <LoginForm />

        <p className="mt-6 text-center text-sm text-ink-muted">
          Ainda nao tem conta?{' '}
          <Link href="/novo-ticket" className="font-medium text-primary hover:underline">
            Abra um chamado
          </Link>
        </p>
      </div>
    </main>
  );
}
