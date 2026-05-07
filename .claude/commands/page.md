---
description: Cria uma pagina Next.js seguindo o style guide DGcom (App Router, server-first).
argument-hint: <rota> [<grupo>]
---

# /page

Cria uma pagina nova em `apps/web/src/app/`.

**Argumento:** `$ARGUMENTS` — rota relativa (ex: `tickets/[code]`) e, opcionalmente, o grupo de rota: `(public)` ou `(auth)`.

## Passos

1. Invoque as skills `dgcom-shadcn-first` e `dgcom-style-tokens` antes de escrever JSX.
2. Confirme com o usuario:
   - A rota fica em `(public)` (sem auth) ou `(auth)` (logado)?
   - Quais dados a pagina mostra? (Server Component faz fetch direto; Client Component apenas se houver estado/interatividade complexa).
3. Crie:
   - `apps/web/src/app/<grupo>/<rota>/page.tsx`
   - `apps/web/src/app/<grupo>/<rota>/layout.tsx` se houver header/sidebar especifico.
   - Componentes auxiliares em `apps/web/src/components/features/<modulo>/<Componente>.tsx` quando reutilizaveis.
4. Use `font-display` apenas em headlines grandes (h1 hero). Resto e `font-sans` (default do body).
5. Trate sempre tres estados em listas: **loading**, **empty**, **error**.

## Restricoes

- **Sem cores hex hardcoded.** Use tokens (`bg-primary`, `text-ink`, `border-border`).
- **Server Component por padrao.** Adicione `'use client'` apenas quando precisar de hooks/eventos.
- Form sempre com `react-hook-form` + `zodResolver`, importando schema de `@dgcom/contracts`.
- Antes de criar componente do zero, rode `pnpm --filter @dgcom/web dlx shadcn@latest add <nome>`.
