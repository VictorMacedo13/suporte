'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { authClient } from '@/lib/auth-client';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const passwordSchema = z.object({
  email: z.email('E-mail invalido'),
  password: z.string().min(1, 'Informe sua senha'),
});
type PasswordValues = z.infer<typeof passwordSchema>;

const magicSchema = z.object({
  email: z.email('E-mail invalido'),
});
type MagicValues = z.infer<typeof magicSchema>;

export function LoginForm() {
  const router = useRouter();
  const [magicSent, setMagicSent] = useState(false);

  const passwordForm = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { email: '', password: '' },
  });

  const magicForm = useForm<MagicValues>({
    resolver: zodResolver(magicSchema),
    defaultValues: { email: '' },
  });

  async function onPassword(values: PasswordValues) {
    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
    });
    if (error) {
      toast.error(error.message ?? 'Nao foi possivel entrar');
      return;
    }
    toast.success('Bem-vindo!');
    router.push('/dashboard');
  }

  async function onMagic(values: MagicValues) {
    const { error } = await authClient.signIn.magicLink({ email: values.email });
    if (error) {
      toast.error(error.message ?? 'Falha ao enviar link');
      return;
    }
    setMagicSent(true);
  }

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <Tabs defaultValue="password">
          <TabsList className="mb-6 grid w-full grid-cols-2">
            <TabsTrigger value="password">Senha</TabsTrigger>
            <TabsTrigger value="magic">Magic link</TabsTrigger>
          </TabsList>

          <TabsContent value="password">
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPassword)} className="space-y-4">
                <FormField
                  control={passwordForm.control}
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
                <FormField
                  control={passwordForm.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Senha</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="********" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  disabled={passwordForm.formState.isSubmitting}
                  className="w-full"
                >
                  {passwordForm.formState.isSubmitting ? 'Entrando...' : 'Entrar'}
                </Button>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="magic">
            {magicSent ? (
              <div className="flex flex-col items-center gap-3 py-6 text-center">
                <p className="text-sm text-ink">
                  Link enviado! Verifique sua caixa de entrada e clique para entrar.
                </p>
                <Button variant="outline" onClick={() => setMagicSent(false)}>
                  Reenviar
                </Button>
              </div>
            ) : (
              <Form {...magicForm}>
                <form onSubmit={magicForm.handleSubmit(onMagic)} className="space-y-4">
                  <FormField
                    control={magicForm.control}
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
                  <Button
                    type="submit"
                    disabled={magicForm.formState.isSubmitting}
                    className="w-full"
                  >
                    {magicForm.formState.isSubmitting ? 'Enviando...' : 'Receber link por email'}
                  </Button>
                </form>
              </Form>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
