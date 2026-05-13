'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  Check,
  Settings,
  UserRound,
  Ban,
  Link2,
  BookOpen,
  CreditCard,
  AlertTriangle,
  HelpCircle,
} from 'lucide-react';
import { apiClient, ApiError } from '@/lib/api-client';
import { cn } from '@/lib/utils';
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
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

// ─── Schema ─────────────────────────────────────────────────────────────────

const wizardSchema = z.object({
  name: z.string().trim().min(2, 'Informe seu nome'),
  email: z.string().trim().email('E-mail inválido'),
  clientType: z.enum(['produtor', 'afiliado', 'comprador', 'agencia'], {
    error: 'Selecione o tipo de cliente',
  }),
  documentType: z.enum(['cpf', 'cnpj'], {
    error: 'Selecione CPF ou CNPJ',
  }),
  productId: z.string().uuid({ message: 'Selecione o produto' }),
  categorySlug: z.string().min(1, 'Selecione um assunto'),
  subject: z.string().trim().min(3, 'Título muito curto').max(200),
  description: z.string().trim().min(10, 'Descreva melhor o problema'),
});
type WizardData = z.infer<typeof wizardSchema>;

// ─── Constants ───────────────────────────────────────────────────────────────

const CLIENT_TYPES = [
  { value: 'produtor', label: 'Produtor' },
  { value: 'afiliado', label: 'Afiliado' },
  { value: 'comprador', label: 'Comprador' },
  { value: 'agencia', label: 'Agência' },
] as const;

const DOCUMENT_TYPES = [
  { value: 'cpf', label: 'CPF' },
  { value: 'cnpj', label: 'CNPJ' },
] as const;

const CATEGORIES = [
  {
    slug: 'dados-cadastrais',
    label: 'Dados Cadastrais',
    description: 'Configurações de perfil',
    icon: Settings,
    color: 'bg-blue-100 text-blue-600',
  },
  {
    slug: 'troca-titularidade',
    label: 'Troca de Titularidade',
    description: 'Transferir propriedade',
    icon: UserRound,
    color: 'bg-pink-100 text-pink-600',
  },
  {
    slug: 'cancelamento-conta',
    label: 'Cancelamento de Conta',
    description: 'Encerrar ou desativar',
    icon: Ban,
    color: 'bg-red-100 text-red-600',
  },
  {
    slug: 'unificacao-contas',
    label: 'Unificação de Contas',
    description: 'Juntar contas duplicadas',
    icon: Link2,
    color: 'bg-purple-100 text-purple-600',
  },
  {
    slug: 'sem-acesso-curso',
    label: 'Sem Acesso ao Curso',
    description: 'Não consigo acessar conteúdo',
    icon: BookOpen,
    color: 'bg-green-100 text-green-600',
  },
  {
    slug: 'pagamentos-faturas',
    label: 'Pagamentos e Faturas',
    description: 'Cobranças e reembolsos',
    icon: CreditCard,
    color: 'bg-yellow-100 text-yellow-600',
  },
  {
    slug: 'problemas-tecnicos',
    label: 'Problemas Técnicos',
    description: 'Erros e bugs',
    icon: AlertTriangle,
    color: 'bg-orange-100 text-orange-600',
  },
  {
    slug: 'outros-assuntos',
    label: 'Outros Assuntos',
    description: 'Demais solicitações',
    icon: HelpCircle,
    color: 'bg-slate-100 text-slate-600',
  },
] as const;

const STEP_FIELDS: Record<number, (keyof WizardData)[]> = {
  1: ['name', 'email', 'clientType', 'documentType'],
  2: ['productId'],
  3: ['categorySlug'],
  4: ['subject', 'description'],
};

// ─── Step Indicator ──────────────────────────────────────────────────────────

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="mb-8 flex items-center justify-center">
      {Array.from({ length: total }, (_, i) => {
        const step = i + 1;
        const done = step < current;
        const active = step === current;
        return (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                'flex size-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                done && 'border-primary bg-primary text-white',
                active && 'border-primary bg-primary/10 text-primary',
                !done && !active && 'border-border text-muted-foreground',
              )}
            >
              {done ? <Check className="size-4" /> : step}
            </div>
            {step < total && (
              <div className={cn('h-0.5 w-14 transition-all', done ? 'bg-primary' : 'bg-border')} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

interface Props {
  defaultName: string;
  defaultEmail: string;
}

interface CreateResponse {
  id: string;
  code: string;
}

export function AuthenticatedTicketForm({ defaultName, defaultEmail }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Array<{ id: string; name: string }>>([]);

  useEffect(() => {
    apiClient
      .get<{ products: Array<{ id: string; name: string }> }>('/api/products')
      .then((data) => setProducts(data.products ?? []))
      .catch(() => {});
  }, []);

  const form = useForm<WizardData>({
    resolver: zodResolver(wizardSchema),
    defaultValues: {
      name: defaultName,
      email: defaultEmail,
      clientType: undefined,
      documentType: undefined,
      productId: '',
      categorySlug: '',
      subject: '',
      description: '',
    },
    mode: 'onTouched',
  });

  const values = form.watch();
  const selectedCategory = CATEGORIES.find((c) => c.slug === values.categorySlug);
  const clientTypeLabel = CLIENT_TYPES.find((c) => c.value === values.clientType)?.label;
  const selectedProduct = products.find((p) => p.id === values.productId);

  async function handleNext() {
    const valid = await form.trigger(STEP_FIELDS[step]);
    if (!valid) return;
    if (step === 4) {
      setConfirmOpen(true);
    } else {
      setStep((s) => s + 1);
    }
  }

  async function handleConfirmSubmit() {
    setLoading(true);
    try {
      const v = form.getValues();
      const result = await apiClient.post<CreateResponse>('/api/tickets', {
        name: v.name,
        email: v.email,
        subject: v.subject,
        description: v.description,
        categorySlug: v.categorySlug,
        clientType: v.clientType,
        documentType: v.documentType,
        productId: v.productId || undefined,
      });
      toast.success(`Chamado ${result.code} criado`);
      router.push(`/tickets/${result.code}`);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao criar ticket');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Card>
        <CardContent className="pt-6">
          <StepIndicator current={step} total={4} />

          <Form {...form}>
            {/* ── Step 1 ── */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Seus dados</h2>
                  <p className="text-sm text-ink-muted">Confirme ou ajuste suas informações.</p>
                </div>
                <div className="grid gap-4 md:grid-cols-2">
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
                  name="clientType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de cliente</FormLabel>
                      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                        {CLIENT_TYPES.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => field.onChange(t.value)}
                            className={cn(
                              'rounded-lg border-2 px-3 py-2.5 text-sm font-medium transition-all',
                              field.value === t.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-ink-muted hover:border-primary/40 hover:text-ink',
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="documentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de documento</FormLabel>
                      <div className="flex gap-2">
                        {DOCUMENT_TYPES.map((t) => (
                          <button
                            key={t.value}
                            type="button"
                            onClick={() => field.onChange(t.value)}
                            className={cn(
                              'flex-1 rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-all',
                              field.value === t.value
                                ? 'border-primary bg-primary/5 text-primary'
                                : 'border-border text-ink-muted hover:border-primary/40 hover:text-ink',
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── Step 2 ── */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Qual produto?</h2>
                  <p className="text-sm text-ink-muted">
                    Selecione o produto relacionado ao seu chamado.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produto</FormLabel>
                      {products.length === 0 ? (
                        <p className="text-sm text-ink-muted">Nenhum produto disponível.</p>
                      ) : (
                        <div className="flex flex-col gap-3 sm:flex-row">
                          {products.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              onClick={() => field.onChange(p.id)}
                              className={cn(
                                'flex-1 rounded-lg border-2 px-4 py-3 text-sm font-semibold transition-all',
                                field.value === p.id
                                  ? 'border-primary bg-primary/5 text-primary'
                                  : 'border-border text-ink-muted hover:border-primary/40 hover:text-ink',
                              )}
                            >
                              {p.name}
                            </button>
                          ))}
                        </div>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── Step 3 ── */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Qual o assunto?</h2>
                  <p className="text-sm text-ink-muted">
                    Selecione a categoria que melhor descreve sua solicitação.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="categorySlug"
                  render={({ field }) => (
                    <FormItem>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {CATEGORIES.map((cat) => {
                          const Icon = cat.icon;
                          return (
                            <button
                              key={cat.slug}
                              type="button"
                              onClick={() => field.onChange(cat.slug)}
                              className={cn(
                                'flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all',
                                field.value === cat.slug
                                  ? 'border-primary bg-primary/5'
                                  : 'border-border hover:border-primary/40',
                              )}
                            >
                              <div
                                className={cn(
                                  'flex size-10 shrink-0 items-center justify-center rounded-lg',
                                  cat.color,
                                )}
                              >
                                <Icon className="size-5" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-ink">{cat.label}</p>
                                <p className="text-xs text-ink-muted">{cat.description}</p>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* ── Step 4 ── */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-semibold text-ink">Detalhes do chamado</h2>
                  <p className="text-sm text-ink-muted">
                    Descreva com detalhes o que está acontecendo.
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Título</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Resumo em uma frase do que está acontecendo"
                          {...field}
                        />
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
                      <FormLabel>Descrição detalhada</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Conte os detalhes: passos para reproduzir, mensagens de erro, quando começou..."
                          className="min-h-36"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
          </Form>

          <div className="mt-8 flex justify-between">
            {step > 1 ? (
              <Button variant="outline" onClick={() => setStep((s) => s - 1)}>
                Voltar
              </Button>
            ) : (
              <Button type="button" variant="ghost" onClick={() => router.back()}>
                Cancelar
              </Button>
            )}
            <Button onClick={handleNext}>{step === 4 ? 'Finalizar' : 'Continuar'}</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Modal de confirmação ── */}
      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar chamado</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-1 text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Nome</p>
                <p className="truncate text-ink">{values.name}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">E-mail</p>
                <p className="truncate text-ink">{values.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Tipo de cliente
                </p>
                <p className="capitalize text-ink">{clientTypeLabel}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Documento
                </p>
                <p className="uppercase text-ink">{values.documentType}</p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Produto
                </p>
                <p className="text-ink">{selectedProduct?.name}</p>
              </div>
            </div>
            <Separator />
            {selectedCategory && (
              <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wide text-ink-muted">
                  Assunto
                </p>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      'flex size-8 shrink-0 items-center justify-center rounded-lg',
                      selectedCategory.color,
                    )}
                  >
                    <selectedCategory.icon className="size-4" />
                  </div>
                  <span className="font-medium text-ink">{selectedCategory.label}</span>
                </div>
              </div>
            )}
            <Separator />
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">Título</p>
              <p className="font-medium text-ink">{values.subject}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-ink-muted">
                Descrição
              </p>
              <p className="line-clamp-4 text-xs leading-relaxed text-ink-muted">
                {values.description}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)} disabled={loading}>
              Revisar
            </Button>
            <Button onClick={handleConfirmSubmit} disabled={loading}>
              {loading ? 'Criando...' : 'Confirmar e criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
