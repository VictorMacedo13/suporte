'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Plus, Package, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createProductSchema, type CreateProductInput } from '@dgcom/contracts';
import { apiClient, ApiError } from '@/lib/api-client';
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
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';

interface Product {
  id: string;
  name: string;
  createdAt: string;
}

const fmt = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
});

export default function ProdutosAdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const form = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema),
    defaultValues: { name: '' },
  });

  async function loadProducts() {
    setLoadingList(true);
    try {
      const data = await apiClient.get<{ products: Product[] }>('/api/products');
      setProducts(data.products);
    } catch {
      toast.error('Erro ao carregar produtos');
    } finally {
      setLoadingList(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  async function onSubmit(values: CreateProductInput) {
    setSubmitting(true);
    try {
      const created = await apiClient.post<Product>('/api/products', values);
      toast.success(`Produto "${created.name}" criado`);
      form.reset();
      setProducts((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Erro ao criar produto');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Remover o produto "${product.name}"? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(product.id);
    try {
      await apiClient.delete(`/api/products/${product.id}`);
      toast.success(`Produto "${product.name}" removido`);
      setProducts((prev) => prev.filter((p) => p.id !== product.id));
    } catch {
      toast.error('Erro ao remover produto');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin">
            <ArrowLeft className="size-4" />
          </Link>
        </Button>
        <div>
          <h1 className="font-display text-3xl text-ink">Produtos</h1>
          <p className="text-sm text-ink-muted">
            Gerencie os produtos disponíveis no formulário de suporte.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* ── Formulário de criação ── */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-ink">Novo produto</h2>
            <p className="text-sm text-ink-muted">
              Adicione um produto que os clientes poderão selecionar ao abrir um chamado.
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do produto</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: DGCOM, INTEGRAT…" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={submitting} className="w-full">
                  <Plus className="mr-2 size-4" />
                  {submitting ? 'Criando…' : 'Criar produto'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* ── Lista de produtos ── */}
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-ink">Produtos cadastrados</h2>
          </CardHeader>
          <CardContent>
            {loadingList ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center gap-2 py-8 text-center text-sm text-ink-muted">
                <Package className="size-8 opacity-30" />
                <p>Nenhum produto cadastrado ainda.</p>
              </div>
            ) : (
              <ul className="space-y-1">
                {products.map((p, i) => (
                  <li key={p.id}>
                    {i > 0 && <Separator className="mb-1" />}
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm font-medium text-ink">{p.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-ink-muted">
                          {fmt.format(new Date(p.createdAt))}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={deletingId === p.id}
                          onClick={() => handleDelete(p)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
