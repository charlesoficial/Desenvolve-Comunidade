# Circle — Painel administrativo

## Estrutura do shell admin

Captura: `01-settings-geral-1440.png` (full-page, 1440 × 3779)

```
┌─ Topbar global (mesmo da comunidade) ──────────────────────────────────────┐
│  64px de altura, x:0 w:1440. Logo + busca + ícones + avatar.              │
└────────────────────────────────────────────────────────────────────────────┘
┌─────────┬─────────────────┬──────────────────────────────────────────────┐
│ Ícones  │ Sub-itens texto │  Conteúdo                                     │
│ 64px*   │ 304px*          │  896px (max-w-4xl)                            │
│         │                 │  centralizado, padding 36×48                  │
│         │                 │                                               │
│ aside.standard-layout-v2__sidebar = 368px total                           │
└─────────┴─────────────────┴──────────────────────────────────────────────┘
```

`*` Estimativa visual — na DOM os dois grupos vivem dentro do mesmo `<aside>`
de 368px, com a coluna de ícones em x:11..53 (42px de largura cada item) e os
links de texto em x:84..340 (256px de largura cada link).

## Topbar admin

| Propriedade | Valor |
|---|---|
| Selector | `#root-header-v2_1` (`<nav>`) |
| Posição | x:0 y:0 |
| Largura | 1440px (viewport inteiro no admin) |
| Altura | 64px |
| Background | `#ffffff` |
| Padding | `8px 36px` |
| Border-bottom | 1px solid (cor da var `--color-border-primary`) |
| z-index | 50 |
| Sticky | sim |

Conteúdo da topbar (esquerda → direita):
- Logo da comunidade
- Search bar central (pesquisar)
- Ícones direita: notificação, mensagens, "voltar pra comunidade" (com texto)
- Avatar do usuário

## Sidebar admin (`aside.standard-layout-v2__sidebar`)

| Propriedade | Valor |
|---|---|
| Largura total | **368px** |
| Posição | x:0 y:112 (no admin com banner de trial; sem banner é y:64) |
| Altura | calc(100vh − 64) ou similar |
| Background | `#ffffff` |
| Padding interno | varia por seção |

A sidebar contém **duas colunas visuais**:

### Coluna 1 — ícones (esquerda)

| Y | Ícone | Rota | Função |
|---|---|---|---|
| 124 | `icon-20-back-to-community` | `/feed` | ← Voltar pra comunidade |
| 174 | `icon-sw-home` | `/settings/dashboard` | Dashboard |
| 224 | `icon-20-members` | `/audience/manage` | Membros |
| 274 | `icon-20-content` | `/settings/files` | Conteúdo (Espaços/Posts/Páginas/Tópicos/Moderação/Ao vivo) |
| 324 | `icon-20-send` | `/settings/emails` | E-mails |
| 374 | `icon-20-workflows` | `/settings/workflows` | Automações |
| 424 | `icon-20-analytics` | `/settings/analytics` | Analytics |
| 474 | `icon-20-community-bot` | `/settings/ai-agents/knowledge` | IA |
| 524 | `icon-20-payments` | `/settings/paywalls` | Paywalls |
| 574 | `icon-20-paywalls-affiliates` | `/settings/affiliates_settings` | Afiliados |
| 624 | `icon-20-plans` | `/settings/plans` | Planos |
| 674 | `icon-20-site` | `/settings/home` | Página inicial |
| 724 | `icon-20-code-tag` | `/settings/api` | API |
| 774 | `icon-20-nav-settings` | `/settings` | Geral ⭐ ativo aqui |

Cada ícone:
- Tamanho: 42 × 42 px
- Padding interno: equivalente ao SVG 20px centralizado
- x: 11 (margin de 11px da borda esquerda)
- Espaço vertical entre ícones: 50px (header center-to-center)
- Estado ativo: cor `text-selector-active` (provável azul/preto saturado)

### Coluna 2 — sub-itens de texto (direita, varia por seção ativa)

Quando o ícone `Geral` está ativo, mostra:

| Y | Item | Rota |
|---|---|---|
| 132 | **Configurações** (heading h5) | — |
| 174 | Geral ⭐ | `/settings` |
| 207 | Domínio personalizado | `/settings/custom_domain` |
| 240 | IA para comunidades | `/settings/community_ai` |
| 273 | Aplicativo móvel | `/settings/mobile_app` |
| 306 | Resumo semanal | `/settings/weekly_digest` |
| 339 | Incorporar | `/settings/embed` |
| 372 | Single sign-on (SSO) | `/settings/sso` |
| 405 | Conexões | `/settings/connect` |
| 438 | Jurídico | `/settings/legal` |

Cada item:
- Largura: 256px (4-tailwind: w-64)
- Altura: 32px
- Espaço vertical: 33px (1px margin)
- Padding horizontal: ~12px
- Item ativo: background `--color-grey-100` + font-weight 600

## Conteúdo principal

| Propriedade | Valor |
|---|---|
| Selector | `main.settings-app` |
| Posição | x:449 y:184 |
| Largura | 896px (max-w-4xl, equivalente Tailwind) |
| Padding | `36px 48px` (lg:px-9 lg:py-12) |
| Margin | mx-auto (centralizado dentro do remaining viewport) |

## Diferenças do nosso clone

| Item | Nosso atual | Circle real | Ação |
|---|---|---|---|
| Topbar height | 64 | 64 | ✅ correto |
| Topbar x | 0 (full) | 0 (full) | ✅ correto |
| Sidebar primária (ícones) | 64px isolada | 42px ícones DENTRO do aside de 368px | ⚠️ Refatorar: sem coluna 64px isolada |
| Sidebar secundária | 368px isolada | 368px (engloba ícones+texto) | ⚠️ Mesclar |
| Sidebar admin width total | 64+368 = 432px | 368px | ⚠️ Sobra 64px de espaço pra main |
| Main x | 449 (aproximado) | 449 | ✅ se corrigirmos sidebar |
| Main width | varia | 896px max | ⚠️ Limitar com max-width 896 + mx-auto |
| Main padding | 32px 40px | 36px 48px | ⚠️ Aproximar |

## Próximas capturas necessárias

- [ ] Hover state em cada ícone da sidebar (mostra tooltip com label)
- [ ] Cada uma das 14 seções abertas (Dashboard, Members, Content, etc)
- [ ] Topbar em detalhe (1280, 1024, 820 breakpoints)
- [ ] Estado responsivo: como sidebar colapsa em mobile
