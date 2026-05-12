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
            <h2 className="font-display text-xl text-ink">Tickets</h2>
            <p className="text-sm text-ink-muted">
              Veja todos os tickets, atribua agentes e mude status.
            </p>
          </CardHeader>
          <CardContent>
            <Button asChild variant="outline">
              <Link href="/dashboard">Ir para tickets</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-xl text-ink">Categorias</h2>
            <p className="text-sm text-ink-muted">
              Crie categorias para classificar e rotear chamados.
            </p>
          </CardHeader>
          <CardContent>
            <Button variant="outline" disabled>
              Em breve
            </Button>
          </CardContent>
        </Card>

        {session.user.role === 'admin' && (
          <Card>
            <CardHeader>
              <h2 className="font-display text-xl text-ink">Usuarios</h2>
              <p className="text-sm text-ink-muted">
                Gerencie quem tem acesso e os papeis de cada um.
              </p>
            </CardHeader>
            <CardContent>
              <Button variant="outline" disabled>
                Em breve
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
