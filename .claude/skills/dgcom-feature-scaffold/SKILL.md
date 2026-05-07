---
name: dgcom-feature-scaffold
description: Use ao criar um novo módulo de domínio no backend (apps/api). Gera a estrutura DDD/Clean Arch completa — entity, value objects, repositório (interface), use cases com Either, controller fino, rotas Express e specs Vitest. Aplica quando o usuário pedir para "criar um módulo", "adicionar uma feature backend", "scaffold X" ou similar.
---

# dgcom-feature-scaffold

Scaffolding de um módulo de domínio em `apps/api/src/modules/<nome>/` seguindo
DDD + Clean Architecture. Use isto **antes** de criar arquivos avulsos.

## Quando usar

- Usuário pede um novo módulo backend (ex: "criar módulo de notificações", "adicionar feature de comentários").
- Você está prestes a criar uma entidade/use case sem estrutura definida.

## Estrutura a gerar

Para um módulo `<modulo>` (camelCase no domain, kebab-case na pasta):

```
apps/api/src/modules/<modulo>/
├── domain/
│   ├── entities/<Aggregate>.ts
│   ├── value-objects/<VO>.ts                    (1+ se houver)
│   ├── events/<Event>.ts                        (opcional)
│   └── repositories/I<Aggregate>Repository.ts
├── application/
│   └── use-cases/
│       └── <CasoDeUso>/
│           ├── <CasoDeUso>.ts                   (export class)
│           ├── <CasoDeUso>.spec.ts              (Vitest)
│           └── <CasoDeUso>DTO.ts                (Input/Output)
├── infrastructure/
│   ├── repositories/Drizzle<Aggregate>Repository.ts
│   └── http/
│       ├── controllers/<Action>Controller.ts
│       └── routes.ts
└── index.ts                                     (composition root)
```

## Regras invioláveis

1. **Dependency Rule**
   - `domain/` não importa de `application/` nem `infrastructure/`.
   - `application/` não importa de `infrastructure/`.
   - `infrastructure/` pode importar das duas anteriores.
2. **Use cases retornam `Either<DomainError, Output>`** — não usam `throw` no caminho feliz.
   Importe: `import { Either, left, right } from '@/shared/domain/Either'`.
3. **Repositórios**: interface no `domain/repositories/`, implementação Drizzle no `infrastructure/repositories/`.
4. **Controllers são finos**: validam input com Zod (importando de `@dgcom/contracts` quando o schema for compartilhado), chamam use case, mapeiam Left → erro HTTP via `next(err)` e Right → `res.json(...)`.
5. **Cada use case tem `.spec.ts` co-localizado**, usando repositório in-memory ou mock manual (não DB real).
6. **Composition root** (`modules/<modulo>/index.ts`) instancia o repositório, injeta no use case, monta os controllers e exporta o `Router` do Express. O `apps/api/src/shared/http/app.ts` consome esse router via `app.use('/<resource>', module.routes)`.

## Templates

### `domain/entities/<Aggregate>.ts`
```typescript
import { Entity } from '@/shared/domain/Entity';

interface Props {
  // ...
}

export class <Aggregate> extends Entity<Props> {
  private constructor(props: Props, id?: string) {
    super(props, id);
  }

  static create(props: Props, id?: string): <Aggregate> {
    // valida invariantes
    return new <Aggregate>(props, id);
  }

  // getters e métodos de domínio (mudança de estado retorna nova instância
  // ou usa setters privados que mantêm invariantes)
}
```

### `domain/repositories/I<Aggregate>Repository.ts`
```typescript
import type { <Aggregate> } from '../entities/<Aggregate>';

export interface I<Aggregate>Repository {
  findById(id: string): Promise<<Aggregate> | null>;
  save(entity: <Aggregate>): Promise<void>;
  // ...
}
```

### `application/use-cases/<Caso>/<Caso>.ts`
```typescript
import { Either, left, right } from '@/shared/domain/Either';
import type { UseCase } from '@/shared/domain/UseCase';
import { NotFoundError } from '@/shared/domain/errors/DomainError';
import type { I<Aggregate>Repository } from '../../../domain/repositories/I<Aggregate>Repository';
import type { <Caso>Input, <Caso>Output } from './<Caso>DTO';

export class <Caso> implements UseCase<<Caso>Input, Promise<Either<NotFoundError, <Caso>Output>>> {
  constructor(private readonly repo: I<Aggregate>Repository) {}

  async execute(input: <Caso>Input): Promise<Either<NotFoundError, <Caso>Output>> {
    const entity = await this.repo.findById(input.id);
    if (!entity) return left(new NotFoundError('<Aggregate> não encontrado'));
    // lógica
    return right({ /* ... */ });
  }
}
```

### `infrastructure/http/controllers/<Action>Controller.ts`
```typescript
import type { RequestHandler } from 'express';
import { <Caso> } from '../../../application/use-cases/<Caso>/<Caso>';
import { <Schema> } from '@dgcom/contracts';

export class <Action>Controller {
  constructor(private readonly useCase: <Caso>) {}

  handle: RequestHandler = async (req, res, next) => {
    try {
      const input = <Schema>.parse(req.body);
      const result = await this.useCase.execute(input);
      if (result.isLeft()) return next(result.value);
      res.status(201).json(result.value);
    } catch (err) {
      next(err);
    }
  };
}
```

### `index.ts` (composition root do módulo)
```typescript
import { Router } from 'express';
import { getDb } from '@dgcom/db';
import { Drizzle<Aggregate>Repository } from './infrastructure/repositories/Drizzle<Aggregate>Repository';
import { <Caso> } from './application/use-cases/<Caso>/<Caso>';
import { <Action>Controller } from './infrastructure/http/controllers/<Action>Controller';

export function build<Modulo>Module() {
  const repo = new Drizzle<Aggregate>Repository(getDb());
  const create<Caso> = new <Caso>(repo);
  const controller = new <Action>Controller(create<Caso>);

  const router = Router();
  router.post('/', controller.handle);
  // ...
  return { routes: router };
}
```

## Antes de gerar

1. Confirme com o usuário o nome do módulo e o(s) caso(s) de uso iniciais.
2. Liste no terminal os arquivos que vai criar antes de criar.
3. Não invente nomes — use os termos do domínio que o usuário forneceu.

## Depois de gerar

- Registre o módulo no `apps/api/src/shared/http/app.ts` (importe `build<Modulo>Module` e adicione `app.use('/<resource>', module.routes)`).
- Rode `pnpm --filter @dgcom/api typecheck` e `pnpm --filter @dgcom/api test` para validar.
