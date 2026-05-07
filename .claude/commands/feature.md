---
description: Scaffold de modulo backend completo (DDD/Clean Arch) em apps/api/src/modules/<nome>.
argument-hint: <nome-do-modulo> [<caso-de-uso-inicial>]
---

# /feature

Cria a estrutura DDD/Clean Arch completa de um novo modulo no backend.

**Argumento:** `$ARGUMENTS` — nome do modulo (kebab-case ou camelCase) e, opcionalmente, o caso de uso inicial.

## Passos

1. Invoque a skill `dgcom-feature-scaffold` para regras detalhadas.
2. Confirme com o usuario:
   - Nome do agregado principal (ex: `Notification`, `Comment`).
   - Caso(s) de uso inicial(is).
   - Quais campos a entidade tera.
3. Liste no chat **todos** os arquivos que vai criar antes de criar.
4. Crie a estrutura:

```
apps/api/src/modules/<modulo>/
├── domain/
│   ├── entities/<Aggregate>.ts
│   ├── value-objects/                   (se aplicavel)
│   └── repositories/I<Aggregate>Repository.ts
├── application/
│   └── use-cases/<Caso>/
│       ├── <Caso>.ts
│       ├── <Caso>.spec.ts
│       └── <Caso>DTO.ts
├── infrastructure/
│   ├── repositories/Drizzle<Aggregate>Repository.ts
│   └── http/
│       ├── controllers/<Action>Controller.ts
│       └── routes.ts
└── index.ts
```

5. Registre o modulo em `apps/api/src/shared/http/app.ts` (importe `build<Modulo>Module`, monte `app.use('/<recurso>', module.routes)`).
6. Rode `pnpm --filter @dgcom/api typecheck` para validar.
7. Reporte o que foi criado e o que falta (ex: implementacao Drizzle real do repositorio).

## Restricoes

- **Nao** crie arquivos sem confirmar a lista com o usuario.
- **Nao** invente nomes de entidades — use os termos que o usuario forneceu.
- Schemas Zod compartilhados (request/response) ficam em `packages/contracts/src/<modulo>.ts`, nao no controller.
