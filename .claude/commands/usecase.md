---
description: Cria apenas um caso de uso novo (com DTO e spec) em um modulo existente.
argument-hint: <modulo> <NomeDoCaso>
---

# /usecase

Cria um caso de uso isolado em `apps/api/src/modules/<modulo>/application/use-cases/<NomeDoCaso>/`.

**Argumento:** `$ARGUMENTS` — primeiro o modulo, depois o nome do caso de uso (PascalCase, ex: `ReplyToTicket`).

## Passos

1. Verifique que o modulo existe em `apps/api/src/modules/<modulo>/`. Se nao existir, sugira `/feature <modulo>` antes.
2. Invoque a skill `dgcom-clean-arch-rules` para o padrao de Either e injecao.
3. Confirme com o usuario:
   - Que dependencias o use case precisa (interfaces de repositorio, services).
   - Quais erros de dominio podem ocorrer (mapeie para classes que estendam `DomainError`).
4. Crie tres arquivos:
   - `<NomeDoCaso>.ts` — classe que implementa `UseCase<Input, Output>` e retorna `Either<DomainError, Output>`.
   - `<NomeDoCaso>DTO.ts` — tipos `<Nome>Input` e `<Nome>Output` (interfaces puras, sem Zod).
   - `<NomeDoCaso>.spec.ts` — Vitest com repositorio in-memory.
5. Atualize o composition root (`modules/<modulo>/index.ts`) instanciando o novo use case e expondo o controller correspondente, se houver rota nova.

## Restricoes

- O use case **nao** importa Express, Drizzle, Zod nem Resend.
- O spec usa um fake/in-memory repository, nunca Drizzle real.
- Caminho feliz retorna `right(...)`; erros de dominio retornam `left(new <X>Error())`.
