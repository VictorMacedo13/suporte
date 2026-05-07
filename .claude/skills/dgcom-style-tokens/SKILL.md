---
name: dgcom-style-tokens
description: Use ao escrever ou revisar qualquer estilo visual (cores, fontes, raios, espaçamento) no apps/web. Garante que apenas tokens DGcom sejam usados — nunca hex/rgb hardcoded. Aplica em CSS, classes Tailwind, componentes React e qualquer trecho que envolva aparência.
---

# dgcom-style-tokens

Fonte da verdade dos tokens visuais DGcom. Toda decisão de cor/fonte/raio deve
referenciar esta skill.

## Cores (definitivas, do briefing)

| Uso              | Hex       | Token Tailwind          | CSS var          |
|------------------|-----------|-------------------------|------------------|
| Primária         | `#1758E6` | `bg-primary`, `text-primary` | `--primary`      |
| Accent           | `#E6A717` | `bg-accent`, `text-accent`   | `--accent`       |
| Background claro | `#FFFFFF` | `bg-background`         | `--background`   |
| Texto / escuro   | `#0A2540` | `text-ink`, `bg-ink`    | `--ink`          |

Variações derivadas (já configuradas em `apps/web/src/styles/globals.css`):
- `text-ink-soft` — texto secundário
- `text-ink-muted` — labels e captions
- `bg-secondary` / `text-secondary-foreground` — fundo neutro de destaque suave
- `bg-muted` — fundo cinza muito claro (cards inativos)
- `border-border` — borda padrão (cinza claro)

## Tipografia

| Uso        | Família           | Variável Tailwind | Quando usar                                    |
|------------|-------------------|-------------------|------------------------------------------------|
| UI / corpo | Geist             | `font-sans`       | **Padrão.** Tudo que não é display/mono.       |
| Mono       | Geist Mono        | `font-mono`       | Códigos de ticket (`#DG-0001`), IDs, snippets.|
| Display    | Instrument Serif  | `font-display`    | Apenas headlines grandes (`h1` hero, callouts).|

Pesos disponíveis Geist: 300, 400, 500, 600, 700.
Feature settings ativados no `body`: `"ss01", "cv11"` (alternates do Geist) — não desativar.

## Raio

| Uso                       | Classe Tailwind | Valor    |
|---------------------------|-----------------|----------|
| Padrão (cards, botões)    | `rounded-lg`    | 0.75rem  |
| Médio (inputs)            | `rounded-md`    | 0.5rem   |
| Pequeno (badges)          | `rounded-sm`    | 0.375rem |
| Pílula                    | `rounded-full`  | 9999px   |

## Regras absolutas

1. **Proibido hex/rgb hardcoded** em componentes (`bg-[#1758E6]`, `style={{ color: '#0A2540' }}`).
   - Exceção: tokens definidos no `globals.css` ou no `dgcomTokens` do `@dgcom/ui`.
2. **Proibido importar fontes ad-hoc** em páginas. As 3 famílias estão carregadas em `apps/web/src/app/layout.tsx`.
3. Para um novo token (ex: `--success`, `--warning`), **adicionar primeiro em `globals.css` + `tailwind.config.ts`** antes de usar.
4. Modo escuro: já existe `:root` e `.dark` em `globals.css`. Não criar tokens fora deles.
5. Espaçamento: usar a escala Tailwind padrão (`space-y-4`, `gap-6`, etc.). Sem números mágicos.

## Antes de fechar uma mudança visual

- [ ] Sem hex/rgb fora de `globals.css` ou `@dgcom/ui/tokens`?
- [ ] Fontes vêm de `font-sans|mono|display` (não `font-['Inter']` etc.)?
- [ ] Raio usa `rounded-{sm,md,lg,full}` (não valores arbitrários)?
- [ ] Funciona no `.dark`?
