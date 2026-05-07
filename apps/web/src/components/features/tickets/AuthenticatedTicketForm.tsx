'use client';

import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
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
}

interface Props {
  defaultName: string;
  defaultEmail: string;
}

export function AuthenticatedTicketForm({ defaultName, defaultEmail }: Props) {
  const router = useRouter();
  const form = useForm<CreatePublicTicketInput>({
    resolver: zodResolver(createPublicTicketSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      subject: '',
      description: '',
    },
  });

  async function onSubmit(values: CreatePublicTicketInput) {
    try {
      const result = await apiClient.post<CreateResponse>('/api/tickets', values);
      toast.success(`Chamado ${result.code} criado`);
      router.push(`/tickets/${result.code}`);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao criar ticket';
      toast.error(message);
    }
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
                      <Input {...field} />
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
                      <Input type="email" {...field} />
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
                    <Input placeholder="Resumo curto do problema" {...field} />
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
                      className="min-h-32"
                      placeholder="Conte os detalhes, mensagens de erro, passos para reproduzir..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Criando...' : 'Criar ticket'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
