'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { replyTicketSchema, type ReplyTicketInput } from '@dgcom/contracts';
import { apiClient, ApiError, API_BASE_URL } from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  authorId: string | null;
  authorName: string;
  content: string;
  isInternal: boolean;
  createdAt: string;
}

interface Props {
  ticketCode: string;
  initialMessages: Message[];
  currentUserId: string;
  canPostInternal: boolean;
}

const fmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function TicketThread({
  ticketCode,
  initialMessages,
  currentUserId,
  canPostInternal,
}: Props) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isInternal, setIsInternal] = useState(false);

  const form = useForm<ReplyTicketInput>({
    resolver: zodResolver(replyTicketSchema),
    defaultValues: { content: '', isInternal: false },
  });

  // SSE — reage a 'reply' e 'status' atualizando a UI.
  useEffect(() => {
    const url = `${API_BASE_URL}/api/sse/tickets/${encodeURIComponent(ticketCode)}`;
    const source = new EventSource(url, { withCredentials: true });
    source.addEventListener('reply', () => router.refresh());
    source.addEventListener('status', () => router.refresh());
    source.onerror = () => source.close();
    return () => source.close();
  }, [ticketCode, router]);

  async function onSubmit(values: ReplyTicketInput) {
    try {
      await apiClient.post(`/api/tickets/${encodeURIComponent(ticketCode)}/reply`, {
        ...values,
        isInternal,
      });
      form.reset();
      setIsInternal(false);
      toast.success('Resposta enviada');
      router.refresh();
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Erro ao enviar resposta';
      toast.error(message);
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="font-display text-xl text-ink">Conversa</h2>

      {messages.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-ink-muted">
            Sem respostas ainda. Aguarde o atendente ou envie uma mensagem abaixo.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {messages.map((m) => {
            const isMine = m.authorId === currentUserId;
            const initials = m.authorName
              .split(' ')
              .slice(0, 2)
              .map((p) => p[0]?.toUpperCase() ?? '')
              .join('');
            return (
              <Card
                key={m.id}
                className={cn(
                  m.isInternal && 'border-accent/40 bg-accent/5',
                  isMine && 'border-primary/30',
                )}
              >
                <CardContent className="flex gap-3 py-4">
                  <Avatar className="size-8 shrink-0">
                    <AvatarFallback className="text-xs">{initials || '?'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-medium text-ink">{m.authorName}</span>
                      {m.isInternal && (
                        <Badge variant="outline" className="border-accent/40 bg-accent/15 text-xs">
                          Nota interna
                        </Badge>
                      )}
                      <span className="text-xs text-ink-muted">
                        {fmt.format(new Date(m.createdAt))}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-ink-soft">{m.content}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <Textarea
              placeholder="Escreva sua resposta..."
              className="min-h-24"
              {...form.register('content')}
            />
            {form.formState.errors.content && (
              <p className="text-xs text-destructive">{form.formState.errors.content.message}</p>
            )}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {canPostInternal && (
                <label className="flex items-center gap-2 text-sm text-ink-muted">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="size-4 rounded border-border"
                  />
                  Marcar como nota interna (so a equipe ve)
                </label>
              )}
              <Button type="submit" disabled={form.formState.isSubmitting} className="ml-auto">
                {form.formState.isSubmitting ? 'Enviando...' : 'Enviar resposta'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
