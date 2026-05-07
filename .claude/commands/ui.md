---
description: Adiciona um componente shadcn/ui ao apps/web. Verifica se ja existe antes.
argument-hint: <nome-do-componente> [<outros>...]
---

# /ui

Adiciona componente(s) shadcn/ui ao Next app.

**Argumento:** `$ARGUMENTS` — um ou mais nomes shadcn (ex: `button`, `dialog form input`).

## Passos

1. Invoque a skill `dgcom-shadcn-first`.
2. Para cada componente solicitado, verifique se ja existe em `apps/web/src/components/ui/<nome>.tsx`:
   - Se existe: avise o usuario, mostre o caminho e pergunte se quer reinstalar.
   - Se nao existe: prossiga.
3. Rode no terminal:
   ```bash
   pnpm --filter @dgcom/web dlx shadcn@latest add <nome1> <nome2> ...
   ```
4. Confirme criacao listando os arquivos novos em `apps/web/src/components/ui/`.
5. Se o componente depende de uma lib de runtime (ex: `sonner`, `cmdk`), o instalador shadcn ja a adiciona — nao instale manualmente.

## Restricoes

- **Nao** edite os arquivos gerados em `components/ui/` para mudar tema/cores. Os tokens vem do `globals.css`.
- Componente customizado especifico do dominio vai em `components/features/`, **compondo** sobre primitivos shadcn.
