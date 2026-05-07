---
name: dgcom-shadcn-first
description: Use SEMPRE antes de criar qualquer componente de UI no apps/web. Verifica se o componente já existe em apps/web/src/components/ui (instalado via shadcn CLI) e, se não existir, instala via `pnpm --filter @dgcom/web dlx shadcn@latest add <name>`. Aplique em qualquer pedido envolvendo botão, input, dialog, dropdown, sheet, card, table, form, toast, alert, tabs, etc.
---

# dgcom-shadcn-first

Regra de ouro: **nunca crie componentes de UI do zero** se shadcn/ui cobrir o caso.

## Fluxo obrigatório

Quando precisar de um componente novo:

### 1. Cheque se já existe localmente
```bash
ls apps/web/src/components/ui/
```
Se o arquivo `<componente>.tsx` já existir, **importe e use**:
```tsx
import { Button } from '@/components/ui/button';
```

### 2. Se não existir, cheque o catálogo shadcn
Catálogo completo: https://ui.shadcn.com/docs/components

Os componentes mais comuns em helpdesk:
- `button`, `input`, `textarea`, `label`, `form`
- `card`, `badge`, `separator`, `skeleton`
- `dialog`, `sheet`, `dropdown-menu`, `popover`, `tooltip`
- `table`, `tabs`, `select`, `checkbox`, `radio-group`
- `toast` (sonner), `alert`, `avatar`, `scroll-area`

### 3. Instale via CLI
```bash
pnpm --filter @dgcom/web dlx shadcn@latest add <nome>
```
Múltiplos de uma vez:
```bash
pnpm --filter @dgcom/web dlx shadcn@latest add button input form label
```

A CLI cria os arquivos em `apps/web/src/components/ui/<nome>.tsx`,
respeita o `apps/web/components.json` (style "new-york", icons lucide).

### 4. Use os tokens DGcom
O componente vem usando `bg-primary`, `text-foreground`, etc. — esses já apontam
para os tokens DGcom (`#1758E6`, `#0A2540`, etc.) via `globals.css`.

Nunca sobrescreva com hex/rgb hardcoded. Errado: `<button className="bg-[#1758E6]">`.
Certo: `<Button>` ou, para variante accent: `<Button className="bg-accent text-accent-foreground hover:bg-accent/90">`.

## Quando criar do zero é aceitável

- Componente extremamente específico do domínio (ex: `TicketStatusBadge`, `TicketTimeline`).
- Composto que **usa** primitivos shadcn por dentro (ex: `TicketCard` usa `Card`, `Badge`, `Avatar`).
- Layout/structure que não é um componente reutilizável (page-level).

Mesmo nesses casos, componha sobre primitivos shadcn — não reimplemente botão, input, dialog.

## Antes de afirmar que terminou

- [ ] O arquivo está em `apps/web/src/components/ui/` (gerenciado pela CLI) ou em `apps/web/src/components/features/` (composto sobre primitivos)?
- [ ] Não há cores hex/rgb hardcoded?
- [ ] Estados de loading, empty e error estão tratados quando aplicável?
- [ ] Acessibilidade dos primitivos shadcn está preservada (não removeu `aria-*` nem `Slot`)?
