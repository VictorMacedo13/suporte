---
description: Gera migration Drizzle a partir do schema atual e (opcionalmente) aplica.
argument-hint: [<nome-da-migration>]
---

# /migrate

Gera uma nova migration Drizzle baseada no schema em `packages/db/src/schema/`.

**Argumento:** `$ARGUMENTS` — nome opcional da migration (snake_case, ex: `add_ticket_attachments`).

## Passos

1. Confirme que o schema em `packages/db/src/schema/*.ts` reflete a mudanca desejada.
2. Rode a geracao:
   ```bash
   pnpm db:generate
   ```
   Se um nome foi passado, use:
   ```bash
   pnpm --filter @dgcom/db drizzle-kit generate --name <nome>
   ```
3. Inspecione o SQL gerado em `packages/db/drizzle/` antes de aplicar. Procure por:
   - `DROP COLUMN` ou `DROP TABLE` sem intencao (geralmente significa schema dessincronizado).
   - Tipos errados (ex: `text` quando deveria ser `uuid`).
4. Pergunte ao usuario se quer aplicar agora.
5. Se sim, rode:
   ```bash
   pnpm db:migrate
   ```

## Restricoes

- **Nunca** edite manualmente arquivos em `packages/db/drizzle/` — sempre regenere a partir do schema.
- Migrations destrutivas (drop column/table, alter type) precisam de **confirmacao explicita** do usuario antes de `db:migrate`.
- Backup ou snapshot do banco antes de migration destrutiva em qualquer ambiente que nao seja `localhost`.
