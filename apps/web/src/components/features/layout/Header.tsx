'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface HeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
    role: 'admin' | 'agent' | 'customer';
  };
}

const ROLE_LABEL: Record<HeaderProps['user']['role'], string> = {
  admin: 'Administrador',
  agent: 'Agente',
  customer: 'Cliente',
};

export function Header({ user }: HeaderProps) {
  const router = useRouter();
  const initials = user.name
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? '')
    .join('');

  async function handleLogout() {
    await authClient.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="font-display text-lg text-ink">
            Suporte <span className="text-primary">DGcom</span>
          </Link>
          <nav className="hidden items-center gap-1 text-sm md:flex">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Tickets</Link>
            </Button>
            {(user.role === 'admin' || user.role === 'agent') && (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <Link href="/tickets/novo">Novo ticket</Link>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="gap-2">
                <Avatar className="size-7">
                  <AvatarFallback className="text-xs">{initials || '?'}</AvatarFallback>
                </Avatar>
                <span className="hidden text-sm md:inline">{user.name.split(' ')[0]}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="text-sm font-medium text-ink">{user.name}</div>
                <div className="text-xs font-normal text-ink-muted">{user.email}</div>
                <div className="mt-1 text-xs font-normal text-primary">{ROLE_LABEL[user.role]}</div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Sair</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
