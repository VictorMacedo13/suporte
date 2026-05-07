# Suporte DGcom — Guia para Claude

Sistema de helpdesk (tickets) com formulário público, área autenticada, painel de
agente/admin, notificações por email e atualizações em tempo real.

## Stack

- **Monorepo:** Turborepo + pnpm workspaces
- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind v3 + shadcn/ui
- **Backend:** Express + TypeScript, organização **DDD + Clean Architecture**
- **DB:** Postgres + Drizzle ORM
- **Auth:** BetterAuth (email+senha, magic link)
- **Validação:** Zod (schemas compartilhados em `@dgcom/contracts`)
- **Testes:** Vitest
- **Email:** Resend
- **Realtime:** SSE (Server-Sent Events)
- **Idioma:** PT-BR

## Estrutura do monorepo

```
apps/
  web/   # Next.js — UI pública e autenticada
  api/   # Express — DDD/Clean Arch
packages/
  db/         # Drizzle (schema, client, migrations)
  auth/       # BetterAuth (server + client)
  contracts/  # Zod schemas + tipos compartilhados
  ui/         # tokens DGcom + componentes shadcn (re-exportáveis se preciso)
```

## Brand & UI

### Cores (definitivas)
| Token         | Hex        | HSL var (Tailwind)         |
|---------------|------------|----------------------------|
| Primária      | `#1758E6`  | `--primary` 220 80% 50%    |
| Accent        | `#E6A717`  | `--accent` 39 81% 50%      |
| Background    | `#FFFFFF`  | `--background` 0 0% 100%   |
| Texto/escuro  | `#0A2540`  | `--ink` 211 70% 15%        |

### Tipografia
- **Sans:** [Geist](https://vercel.com/font) (300, 400, 500, 600, 700) — corpo e UI
- **Mono:** Geist Mono (400, 500) — códigos, IDs, ticket codes
- **Display:** Instrument Serif (regular + italic) — apenas em headlines grandes
- Feature settings ativados: `"ss01", "cv11"`

### Raio padrão
- `--radius: 0.75rem` (cards, botões grandes)
- Botões pequenos: `rounded-md` (0.5rem)
- Pills/badges: `rounded-full`

### Regras de UI
1. **Sempre** preferir componente shadcn antes de criar do zero
   (`pnpm --filter @dgcom/web dlx shadcn@latest add <name>`).
2. **Nunca hardcode** cores hex/rgb em componentes — use os tokens (`bg-primary`, `text-ink`, etc.).
3. Estados obrigatórios em listas/dados: **loading**, **empty**, **error**.
4. Form: usar `react-hook-form` + `@hookform/resolvers` com Zod schema de `@dgcom/contracts`.
5. Páginas em PT-BR. Sem camada de i18n.

## Backend — Clean Architecture

**Dependency Rule:** `domain` ← `application` ← `infrastructure` (HTTP, DB, etc.).
Domínio é puro: não conhece Express, Drizzle, Zod, ou qualquer detalhe externo.

```
apps/api/src/
├── modules/<modulo>/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   ├── events/
│   │   └── repositories/         # Interfaces (I*Repository)
│   ├── application/
│   │   └── use-cases/<Nome>/<Nome>.ts + spec.ts + DTO.ts
│   ├── infrastructure/
│   │   ├── repositories/Drizzle*Repository.ts
│   │   └── http/
│   │       ├── controllers/
│   │       └── routes.ts
│   └── index.ts                  # composition root do módulo
└── shared/
    ├── domain/{Either,Entity,UseCase,errors/}
    └── infrastructure/{db,email,sse,http/}
```

### Convenções
- Use cases retornam `Either<DomainError, Output>` — sem `throw` no caminho feliz.
- Cada use case tem 1 arquivo de teste co-localizado: `<Nome>.spec.ts`.
- Repositórios são **interfaces no domain** + **implementações no infrastructure**.
- Controllers são finos: validam (Zod), chamam use case, mapeiam erro → HTTP.
- O composition root do módulo (`modules/<x>/index.ts`) faz o wiring (cria repo, injeta no use case, registra rotas).

## Frontend — convenções

```
apps/web/src/
├── app/
│   ├── (public)/         # rotas sem auth: /, /novo-ticket, /login
│   └── (auth)/           # rotas autenticadas: /dashboard, /tickets/[code], /admin/*
├── components/
│   ├── ui/               # shadcn — não editar manualmente, gerenciar via CLI
│   └── features/         # componentes de feature
├── lib/
│   ├── api-client.ts     # cliente HTTP (fetch wrapper)
│   ├── auth-client.ts    # re-export de @dgcom/auth/client
│   └── utils.ts          # cn(), formatters
└── styles/globals.css    # tokens
```

- Server components por padrão; client components só quando necessário (`"use client"`).
- Toda chamada à API tipa request/response com schemas de `@dgcom/contracts`.

## Skills, comandos e agents

`.claude/` contém:

- **Skills** (`.claude/skills/`):
  - `dgcom-feature-scaffold` — passo-a-passo para criar módulo DDD completo.
  - `dgcom-shadcn-first` — antes de criar componente, checa shadcn e roda CLI.
  - `dgcom-style-tokens` — tokens de cor/tipografia/raio aplicáveis.
  - `dgcom-clean-arch-rules` — dependency rule e onde colocar cada coisa.
- **Slash commands** (`.claude/commands/`):
  - `/feature <modulo>` — scaffold de módulo backend.
  - `/usecase <modulo> <nome>` — apenas use case + spec + DTO.
  - `/page <rota>` — página Next + layout.
  - `/ui <componente>` — adiciona componente shadcn.
  - `/migrate <nome>` — gera migration Drizzle.
- **Agents** (`.claude/agents/`):
  - `clean-arch-reviewer` — revisa violações de Clean Arch.
  - `ui-consistency-reviewer` — revisa cores hardcoded, shadcn ausente, estados faltando.

## Comandos úteis

```bash
pnpm install                          # instala deps de todo monorepo
pnpm dev                              # roda web + api em paralelo (turbo)
pnpm --filter @dgcom/web dev          # só Next
pnpm --filter @dgcom/api dev          # só API
pnpm db:generate                      # gera migrations a partir do schema
pnpm db:migrate                       # aplica migrations
pnpm db:studio                        # abre Drizzle Studio
pnpm --filter @dgcom/web dlx shadcn@latest add button   # adiciona shadcn
pnpm test                             # roda Vitest em todos pacotes
```

## Variáveis de ambiente

Veja `apps/api/.env.example`. Resumo:
- `DATABASE_URL` — Postgres
- `BETTER_AUTH_SECRET` — segredo da sessão (32+ chars aleatórios)
- `BETTER_AUTH_URL` — URL da API (ex: http://localhost:3333)
- `WEB_ORIGIN` — origem do front para CORS
- `RESEND_API_KEY` / `RESEND_FROM` — envio de emails
