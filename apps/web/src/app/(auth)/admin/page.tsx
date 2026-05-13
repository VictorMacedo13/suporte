import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getServerSession } from '@/lib/auth-server';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function AdminPage() {
  const session = await getServerSession();
  if (!session) redirect('/login');
  if (session.user.role !== 'admin' && session.user.role !== 'agent') {
    redirect('/dashboard');
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl text-ink">
          Area <span>administrativa</span>
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          Gestao da operacao de suporte. Mais funcionalidades vao chegar aqui.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <h2 className="font-display text-xl text-ink">Produtos</h2>
            <p className="text-sm text-ink-muted">
              Gerencie os produtos que aparecem no formulário de abertura de chamado.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/admin/produtos">Gerenciar produtos</Link>
            </Button>
          </CardContent>
        </Card>

        {session.user.role === 'admin' && (
          <Card>
            <CardHeader>
              <h2 className="font-display text-xl text-ink">Usuários</h2>
              <p className="text-sm text-ink-muted">
                Convide novos usuários e gerencie os perfis de acesso.
              </p>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline">
                <Link href="/admin/usuarios">Gerenciar usuários</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
