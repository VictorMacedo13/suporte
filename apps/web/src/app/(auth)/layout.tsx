import { redirect } from 'next/navigation';
import { getServerSession } from '@/lib/auth-server';
import { Header } from '@/components/features/layout/Header';

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession();
  if (!session) redirect('/login');

  return (
    <div className="min-h-dvh bg-secondary/40">
      <Header user={session.user} />
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
