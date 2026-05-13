'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';

const schema = z
  .object({
    password: z.string().min(8, 'Mínimo de 8 caracteres'),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: 'As senhas não coincidem',
    path: ['confirm'],
  });

type FormData = z.infer<typeof schema>;

export default function DefinirSenhaPage() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [submitting, setSubmitting] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);

  useEffect(() => {
    if (!token) setInvalidToken(true);
  }, [token]);

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });

  async function onSubmit(values: FormData) {
    if (!token) return;
    setSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: values.password,
        token,
      });
      if (error) {
        toast.error(error.message ?? 'Link inválido ou expirado');
        return;
      }
      toast.success('Senha criada com sucesso! Faça login para continuar.');
      router.push('/login');
    } catch {
      toast.error('Erro ao definir senha. Tente novamente.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-dvh bg-secondary/40">
      <div className="container mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center px-4">
        <div className="mb-6 text-center">
          <span className="text-xs font-semibold uppercase tracking-wider text-primary">
            Suporte DGcom
          </span>
          <h1 className="mt-2 font-display text-3xl text-ink">
            Criar <span>senha</span>
          </h1>
          <p className="mt-1 text-sm text-ink-muted">Defina sua senha para finalizar o cadastro.</p>
        </div>

        <Card className="w-full">
          <CardContent className="pt-6">
            {invalidToken ? (
              <div className="py-4 text-center text-sm text-destructive">
                Link inválido ou expirado. Solicite um novo convite ao administrador.
              </div>
            ) : (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nova senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Mínimo 8 caracteres" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="confirm"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirmar senha</FormLabel>
                        <FormControl>
                          <Input type="password" placeholder="Repita a senha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? 'Salvando…' : 'Criar senha e entrar'}
                  </Button>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
