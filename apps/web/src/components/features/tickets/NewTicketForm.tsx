'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import Link from 'next/link';
import { createPublicTicketSchema, type CreatePublicTicketInput } from '@dgcom/contracts';
import { apiClient, ApiError } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';

interface CreateResponse {
  id: string;
  code: string;
  subject: string;
  status: string;
  priority: string;
  createdAt: string;
}

export function NewTicketForm() {
  const [submitted, setSubmitted] = useState<CreateResponse | null>(null);

  const form = useForm<CreatePublicTicketInput>({
    resolver: zodResolver(createPublicTicketSchema),
    defaultValues: { name: '', email: '', subject: '', description: '' },
  });

  async function onSubmit(values: CreatePublicTicketInput) {
    try {
      const result = await apiClient.post<CreateResponse>('/api/tickets/public', values);
      setSubmitted(result);
      toast.success(`Chamado ${result.code} criado com sucesso`);
      form.reset();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao enviar';
      toast.error(message);
    }
  }

  if (submitted) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="size-6"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div>
            <h2 className="font-display text-2xl text-ink">Chamado registrado!</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Seu codigo de acompanhamento e{' '}
              <span className="rounded bg-secondary px-1.5 py-0.5 font-mono text-ink">
                {submitted.code}
              </span>
            </p>
            <p className="mt-3 text-sm text-ink-muted">
              Enviamos um email de confirmacao. Em breve voce recebera uma resposta.
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => setSubmitted(null)} variant="outline">
              Abrir outro chamado
            </Button>
            <Button asChild>
              <Link href="/login">Acompanhar pela conta</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Como podemos te chamar?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seu@email.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Resumo do que esta acontecendo" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descricao</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conte os detalhes do problema, passos para reproduzir, mensagens de erro..."
                      className="min-h-32"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
              {form.formState.isSubmitting ? 'Enviando...' : 'Enviar chamado'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
