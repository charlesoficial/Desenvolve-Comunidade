# KIRO.md — Guia mestre do projeto comunidade.com

**Última atualização:** 25/05/2026
**Status:** Onda R (rebrand) finalizada. Stack 100% funcional, código limpo de referências P6.

> Este documento é a **fonte da verdade** pra qualquer agente (Kiro, Codex, Claude) retomar o projeto. Lê isso antes de qualquer coisa.

---

## 🎯 Visão do produto

**comunidade.com** é uma plataforma própria de comunidade online no estilo da [Circle.so](https://www.circle.so/), com:

- Sidebar com espaços (chat, feed, course, event, members, link)
- Chat em tempo real (Action Cable)
- Feed com posts longos, comentários, reactions
- Cursos com lições e progresso
- Eventos/aulas ao vivo
- Diretório de membros + member profile + DMs
- Painel administrativo completo
- Paywall com Stripe Checkout

A comunidade é **own-branded** (não white-label de ninguém). Vai ter logo, cores, conteúdo próprios.

---

## 🆕 Mudança de estratégia (22/05/2026)

### ❌ NÃO USAR MAIS COMO REFERÊNCIA
- ~~P6 / Project Six / p6.chat~~
- ~~projects-six / source-six / SOURCE-SIX~~

A referência anterior (P6/Project Six) foi **descartada**. Estamos agora usando **a Circle.so diretamente**, na **comunidade própria do Charles** (trial 14 dias, $49/mês depois).

### ✅ USAR COMO REFERÊNCIA AGORA
- **circle.so** (homepage, marketing, design system público)
- **app.circle.so** (a comunidade própria do Charles, quando criada)
- Painel admin Circle (acesso direto via conta admin)

### Razões da troca
1. Como admin da própria comunidade Circle, conseguimos capturar **TUDO**: 200+ telas, modais, painel admin, settings, integrações
2. Zero risco de Cloudflare bloqueando (rate-limit que vinha acontecendo)
3. Zero risco de admin de comunidade alheia notar
4. Liberdade pra clicar, criar, editar, deletar à vontade
5. Desbloqueia a Onda G (painel admin) que estava travada

### Plano de migração de nome
**Toda referência P6/Project Six no código deve sumir.**

62 arquivos têm referência hoje (`p6-`, `P6`, `Project Six`, `source-six`, `SOURCE-SIX`, `sourceSix`). Plano:

| Categoria | Quantidade aproximada | Ação |
|---|---|---|
| Classes CSS `p6-*` (`.p6-card`, `.p6-action-button`, etc) | ~50+ classes | Renomear pra namespace neutro tipo `.cs-*` ou usar Tailwind direto |
| Variáveis CSS `--p6-*` (`--p6-topbar-height`, etc) | 4-5 vars | Renomear pra `--cm-*` ou `--app-*` |
| Strings `Project Six` em data files | 200+ ocorrências | Substituir pelo nome da comunidade nova ou tornar config-driven |
| `aria-label="Project Six"` | poucos | Trocar pelo nome da nova comunidade |
| Pasta `SOURCE-SIX/` no repo (HTMLs capturados da P6) | 1 pasta | **Deletar** todo o conteúdo |
| `data/sourceSixCapturedPosts.ts`, `sourceSixRoutes.ts` | 2 arquivos | Deletar ou refatorar pra `circleCaptured*` |
| `data/chatData.ts`, `communityData.ts` (mocks com texto P6) | 2 arquivos | Substituir mocks por dados genéricos |
| `OBISIDIAN-CEREBRAL/`, `chatdirect_files/`, `chatdirect.html`, `dist/` | pasta + arquivos | **Deletar**, é lixo de captura/build |

**Importante:** o nome interno do projeto continua **comunidade.com**. Só sai a "marca" P6.

---

## 🛠️ Stack técnica

### Frontend
- **Vite v8.0.10** (dev em `http://127.0.0.1:5173`)
- **React 19.2.5** + **TypeScript 6.0.2**
- **lucide-react** (ícones)
- **Tailwind tokens** (831 design tokens canônicos extraídos da Circle, em `app/javascript/design-system/p6-canonical-tokens.css` — arquivo precisa renomear pra `circle-canonical-tokens.css`)
- Routing manual em `ChatLayout.tsx` (sem React Router por enquanto)

### Backend
- **Rails 7.2.3.1** (porta `3000`, Puma 8.0.1, Ruby 3.3.11)
- 15 controllers em `app/controllers/api/v1/`
- 18 models, 7 serializers, 1 query (FeedQuery)
- **Action Cable** (4 channels: Chat, Notification, Presence, Connection)
- **Sidekiq 7** (jobs background — Redis ainda não rodando local)
- **Devise** ❌ (usamos `has_secure_password` + bcrypt direto)

### Banco
- **PostgreSQL 17.6 via Supabase**
- Projeto: `pxlsrqjstypketfztaoc` (region `us-east-2`)
- Conexão: `aws-1-us-east-2.pooler.supabase.com:6543` (Transaction pooler — porta 5432 bloqueada na rede do Charles)
- 21 tabelas, ~25 spaces seedados
- `prepared_statements: false` no `database.yml` (necessário pra PgBouncer)

### Infra extra
- **Neo4j Desktop 2** local (instância `graphiti`, porta 7687) — pra memória do agente
- **Stripe** gem instalada, ainda não plugada
- **Active Storage** (uploads ainda em stub)

### Auth
- Frontend chama **Supabase GoTrue** direto (`lib/auth.ts`)
- Bridge no Rails: `ApplicationController#supabase_jwt_email` decodifica o JWT do header `Authorization` e procura User por email
- 3 níveis de fallback: session Rails → JWT Supabase → user `vitor-araujo` (dev only)

---

## 🚀 Como subir o ambiente

### Pré-requisito manual
**Abrir Neo4j Desktop 2** e dar Start na instância `graphiti`. Sem isso o MCP Graphiti não funciona, mas o app sobe normal.

### Comandos

```cmd
# Terminal 1 — Vite (frontend)
cd C:\Users\Servico\Documents\Projeto-Website\comunidade.com\comunidade
npm run dev
# disponível em http://127.0.0.1:5173/

# Terminal 2 — Rails (backend)
cd C:\Users\Servico\Documents\Projeto-Website\comunidade.com\comunidade
bin\rails server -p 3000 -b 127.0.0.1
# disponível em http://127.0.0.1:3000/api/v1/auth

# Terminal 3 (opcional) — Sidekiq, quando tiver Redis local
cd C:\Users\Servico\Documents\Projeto-Website\comunidade.com\comunidade
bundle exec sidekiq
```

### Validação rápida

```cmd
curl.exe http://127.0.0.1:5173/
curl.exe http://127.0.0.1:3000/api/v1/auth
curl.exe http://127.0.0.1:3000/api/v1/spaces
```

Esperado: HTTP 200 em todos. Auth retorna user `vitor-araujo`. Spaces retorna 25 spaces.

---

## 📊 Estado atual da fidelidade visual

**~88% do layout-frame** idêntico à Circle (medido via Playwright em 12 rotas).

### Já validado (Onda B + B-2)

| Elemento | Status |
|---|---|
| Tokens base (cores, fontes, spacing) | ✅ 100% |
| Topbar 64px | ✅ |
| Sidebar 281px (em rotas com sidebar) | ✅ |
| H1 padronizado 20px/600/letter-spacing tight | ✅ |
| Page-header 72px | ✅ |
| Background main `#f7f9fa` | ✅ |
| Mensagem chat (avatar 36, body 14px/400, color `#191b1f`) | ✅ |
| Sidebar **não** aparece em /members /courses /events /leaderboard | ✅ |

### Pendente
- LoginPanel em detalhe
- Modais (criar post, criar space, member profile, search, notifications)
- Hover states em mensagens (3 botões: favoritar, responder, mais)
- Reactions popover
- Thread panel lateral
- Empty / loading / error states
- Mobile breakpoints (1500, 1280, 1180, 900, 820, 760, 560, 520)
- **Painel admin completo** ← maior bloco pendente, depende da conta Circle do Charles

---

## 🌊 Roadmap de Ondas

| Onda | Conteúdo | Tempo | Status |
|---|---|---|---|
| Fundação | Vite IPv4, vite.config, cache, proxy Rails | 1-2h | ✅ Concluída |
| Auth + Cable | bcrypt, signup/login, ChatChannel, NotificationChannel, PresenceChannel, CORS, JWT bridge | 2-3h | ✅ Concluída |
| **B** | Visual diff sistemático Circle vs local (12 rotas) | 2-3h | ✅ Concluída |
| **B-2** | Bug fix de cor invisível em mensagens, fontWeight, line-height | 1h | ✅ Concluída |
| **🆕 R** | **Rebrand: tirar P6/Project Six do código** | 2-3h | ✅ Concluída em 25/05/2026 |
| **G (estrutura)** | Painel admin: layout, topbar, 2 sidebars, 6 páginas iniciais, 1 placeholder, CSS dedicado | 2h | ✅ Concluída em 25/05/2026 |
| **G (parte 2)** | Backend admin (community + users) + frontend conectado | 1h | ✅ Concluída em 25/05/2026 |
| **G (parte 3)** | Dashboard real, Spaces real com reorder, Drawer de membro, Plans/Paywalls CRUD | 2h | ✅ Concluída em 25/05/2026 |
| **G (parte 4)** | Workflows, Analytics chart, Audience invites/requests | 1h | ✅ Concluída em 25/05/2026 |
| **F** | Stripe Checkout backend (stub-friendly) + plan link em subscriptions | 1h | ✅ Concluída em 25/05/2026 |
| **B-3** | Modais e interações (hover, reactions, thread, empty/loading) | 2-3h | ⏳ Pendente |
| **A** | OAuth Google/Amazon no Supabase | 30 min | ⏳ Pendente |
| **D** | Sidekiq + Redis local (Memurai ou WSL2) | 1h | ⏳ Pendente |
| **G (continuação)** | Forms reais conectados ao backend, Spaces drag-drop, Audience com paginação real | 6-10h | ⏳ Próxima |
| **E** | Active Storage com Cloudflare R2 | 1-2h | ⏳ Pendente |
| **H** | Deploy Fly.io (Dockerfile + fly.toml region gru) | 2-3h | ⏳ Pendente |
| **C** | Modular `application.css` (13.379 linhas) | 4-6h | ⏳ Baixa prioridade |

### Ordem sugerida pra próxima sessão
1. **R (rebrand)** — limpar P6 do código antes de qualquer coisa
2. **G (admin panel)** — depende do Charles criar conta Circle e dar acesso
3. **B-3 (modais)** — em paralelo, sem depender de Circle
4. **A (OAuth)** — rápido, fecha login social
5. **F (Stripe)** — fecha paywall
6. **D (Sidekiq)** — quando precisar de jobs
7. **E (Storage)** — quando precisar de uploads
8. **H (Deploy)** — quando estiver pronto pra produção

---

## 🆕 Onda R — Rebrand (tirar P6 do código)

### Plano detalhado

#### Passo 1 — Renomear classes CSS `p6-*` → `cs-*` (community-style)
Lista completa em `application.css`:
- `.p6-card`, `.p6-post-title`, `.p6-action-button`
- `.p6-toolbar-button`, `.p6-send-button`, `.p6-composer`
- `.p6-message-row`, `.p6-search-field`, `.p6-icon`
- `.p6-nav-pill`, `.p6-icon-button`, `.p6-logo`
- `.p6-fonts/` na pasta de fontes
- E outros ~50 que aparecem no scan

**Estratégia:** find/replace em massa em todos `.tsx`, `.css`, `.ts`. Comando sugerido:
```cmd
# preview
rg -l "p6-" app/javascript app/javascript/styles
# replace
sed -i 's/\bp6-/cs-/g' arquivos
```

#### Passo 2 — Renomear vars CSS `--p6-*` → `--cm-*` (community)
4-5 variáveis:
- `--p6-topbar-height` → `--cm-topbar-height`
- `--p6-sidebar-width` → `--cm-sidebar-width`
- `--p6-page-header-height` → `--cm-page-header-height`
- `--p6-feed-column-width` → `--cm-feed-column-width`
- `--p6-feed-rail-width` → `--cm-feed-rail-width`

#### Passo 3 — Renomear arquivos
- `p6-canonical-tokens.css` → `circle-canonical-tokens.css` (ou `community-tokens.css`)
- `data/sourceSixCapturedPosts.ts` → `data/sampleCapturedPosts.ts` (ou deletar e refazer)
- `data/sourceSixRoutes.ts` → `data/spaceRoutes.ts` (ou refatorar pra config)
- Pasta `public/p6-fonts/` → `public/fonts/`
- `public/p6-app-sprite.svg` → `public/app-sprite.svg`

#### Passo 4 — Substituir strings de marca
- `"Project Six"` → nome da nova comunidade (ex: configuração via env var ou constante `COMMUNITY_NAME`)
- `aria-label="Project Six"` → mesma config
- Em mocks (`chatData.ts`, `communityData.ts`, `progress/ProgressMain.tsx`): substituir conteúdo P6-específico (`P6 Veterano`, frases sobre P6) por placeholder genérico ou texto da nova comunidade

#### Passo 5 — Deletar pastas/arquivos lixo
```cmd
# Capturas externas da P6
Remove-Item -Recurse -Force SOURCE-SIX/

# Lixo de captura no repo raiz
Remove-Item -Recurse -Force chatdirect_files/
Remove-Item chatdirect.html

# Build antigo
Remove-Item -Recurse -Force dist/

# Notas locais
Remove-Item -Recurse -Force OBISIDIAN-CEREBRAL/
```

E adicionar essas pastas ao `.gitignore` se ainda não estiverem.

#### Passo 6 — Validar build após rebrand
```cmd
npm run build
npx tsc --noEmit
npm run lint
```

Tudo deve passar zero erros.

### ⚠️ Cuidado durante rebrand
- A pasta `.playwright-mcp/` tem screenshots e snapshots com nome `p6-*.png` — **manter, são histórico de capturas**
- Os docs em `docs/visual-diff-2026-05-22.md` mencionam P6 como referência histórica — **manter como log**
- `KIRO.md` (este arquivo) menciona P6 só pra explicar a transição — **manter**

---

## 📂 Estrutura de pastas relevantes

```
comunidade.com/
├── KIRO.md                          ← este arquivo
├── comunidade/                      ← projeto Rails + Vite
│   ├── app/
│   │   ├── channels/                ← Action Cable (Chat, Notification, Presence)
│   │   ├── controllers/api/v1/      ← 15 controllers REST
│   │   ├── javascript/
│   │   │   ├── components/          ← 21 pastas React
│   │   │   │   ├── admin/           ← VAZIA, esperando Onda G
│   │   │   │   ├── auth/            ← LoginPanel
│   │   │   │   ├── chat/            ← ChatLayout, ChatMain, ChatComposer, etc
│   │   │   │   ├── feed/, feedGeral/, members/, leaderboard/, courses/, events/
│   │   │   │   ├── pages/           ← rotas específicas
│   │   │   │   ├── paywall/         ← VAZIA
│   │   │   │   └── moderation/      ← VAZIA
│   │   │   ├── data/                ← mocks
│   │   │   ├── design-system/       ← tokens CSS canônicos
│   │   │   ├── lib/                 ← auth.ts, communityApi.ts, supabase.ts
│   │   │   └── styles/              ← application.css (13k linhas, refatorar)
│   │   ├── models/                  ← 18 models AR
│   │   ├── queries/                 ← FeedQuery
│   │   └── serializers/             ← 7 serializers
│   ├── config/                      ← routes, database, cable, cors, sidekiq
│   ├── db/                          ← schema.rb, migrate/
│   ├── docs/                        ← documentação técnica e roadmap
│   └── public/                      ← fontes p6-fonts/, sprite
├── .playwright-mcp/                 ← capturas Playwright (histórico)
├── SOURCE-SIX/                      ← HTMLs capturados da P6 (DELETAR na Onda R)
├── chatdirect.html, chatdirect_files/  ← lixo (DELETAR)
└── OBISIDIAN-CEREBRAL/              ← notas locais (DELETAR)
```

---

## 📚 Documentos relacionados

| Doc | O que contém |
|---|---|
| `comunidade/docs/status-tecnico-2026-05-22.md` | Estado completo da stack (versões, endpoints, config) |
| `comunidade/docs/implementacoes-pendentes.md` | Código de referência: Action Cable, auth bcrypt, CORS |
| `comunidade/docs/roadmap-2026-05-22.md` | Roadmap original das Ondas A-H |
| `comunidade/docs/visual-diff-2026-05-22.md` | Relatório Onda B + B-2 com bateria de 12 rotas |

---

## 🔐 Credenciais (locais — não commitar)

Estão no `.env` do Rails:
- `DATABASE_URL` (Supabase Transaction pooler 6543)
- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `RAILS_MAX_THREADS`

⚠️ **Lembrete de segurança:**
- Service role key Supabase foi exposta em chat anterior — **rotacionar** quando puder
- GitHub PAT do `charlesoficial` expira **19/08/2026**
- Senha Neo4j local `society!` é fraca, considerar trocar
- Crédito OpenAI pago em 21/05/2026, hard limit $8, dura 4-8 meses no Graphiti

---

## 🤖 MCPs configurados (Codex e Kiro)

8 MCPs ativos: `supabase`, `playwright`, `context7`, `chrome-devtools`, `github`, `filesystem`, `fetch`, `graphiti`.

- **Codex CLI:** `C:/Users/Servico/.codex/config.toml`
- **Kiro:** `C:/Users/Servico/.kiro/settings/mcp.json`

Backups disponíveis em `mcp.json.backup-2026-05-22-*`.

### Como retomar o projeto em qualquer agente
```
Busca no Graphiti episódios com nome contendo "comunidade.com - CHECKPOINT FINAL 22-05-2026"
e me dá o estado atual. Lê também KIRO.md no root do projeto.
```

---

## 👤 Contexto pessoal

- **Charles** (`charlesoficial` no GitHub) é o owner do projeto
- User principal seedado no DB: `vitor-araujo` (id `4f3b5b5c-207d-4d90-bfba-73eb8e0f283a`) — usado como fallback de dev no `ApplicationController`
- Charles vai criar trial Circle.so 14 dias pra capturar admin panel ([circle.so](https://www.circle.so/))

---

## ❌ NÃO FAZER

- Não usar nome "P6", "Project Six", "p6.chat" em código novo
- Não navegar `app.p6.chat` mais que o necessário (Cloudflare bloqueia, e privacidade)
- Não commitar tokens reais
- Não rodar destrutivos no Supabase prod sem backup
- Não fazer push direto pra `main` no GitHub
- Não criar conta admin Circle só pra automação intensiva — a TOS proíbe scrape em massa
- Não distribuir o clone fingindo ser Circle.so oficial

---

## ✅ FAZER

- Manter `KIRO.md` atualizado a cada Onda concluída
- Salvar checkpoints no Graphiti com nome `comunidade.com - <Onda> finalizada`
- Backup do `.env` antes de qualquer mudança em config sensível
- Build (`npm run build`) e tsc check após mudanças grandes
- Documentar mudanças em `docs/`


---

## 🌊 Onda G — Painel Admin (estrutura inicial concluída em 25/05/2026)

### Estrutura criada

```
app/javascript/components/admin/
├── AdminLayout.tsx              ← entrypoint, mapeia 22 rotas para 14 secoes
├── AdminTopbar.tsx              ← topbar 64px com "Voltar" e "Documentação"
├── AdminPrimarySidebar.tsx      ← sidebar de icones, 64px de largura
├── AdminSecondarySidebar.tsx    ← sidebar com texto, 368px com grupos
└── pages/
    ├── AdminGeneral.tsx         ← /settings — form com nome, descricao, locale, fuso
    ├── AdminDashboard.tsx       ← /settings/dashboard — 4 KPIs + atividade recente
    ├── AdminAudience.tsx        ← /audience/manage — tabela de membros + busca + filtro
    ├── AdminPaywalls.tsx        ← /settings/paywalls — tabela de paywalls
    ├── AdminPlans.tsx           ← /settings/plans — grid de cards com plano destacado
    ├── AdminSpaces.tsx          ← /settings/spaces — tabela de espacos
    └── AdminPlaceholder.tsx     ← fallback "em construcao" para rotas faltando
```

### Estilo

CSS dedicado em `app/javascript/styles/admin.css` (~470 linhas) com prefixo `.admin-*`. Importado depois de `application.css` no entrypoint pra garantir cascade correta.

### Roteamento

`AppLayout.tsx` agora decide entre `AdminLayout` e `ChatLayout` baseado no pathname:

- `/settings` ou `/settings/*` → `AdminLayout`
- `/audience/manage` ou `/audience/*` → `AdminLayout`
- qualquer outra rota → `ChatLayout`

Navegação dentro do admin usa `pushState` + `popstate`, mesmo padrao do ChatLayout. Botão "Voltar para a comunidade" no topbar emite `popstate` manual pra forçar re-render.

### Validação

- `npm run build` — OK em 14s (495 KB JS, 230 KB CSS gzip 40 KB)
- `npx tsc --noEmit` — zero erros
- `npm run lint` — zero erros
- 4 telas validadas via Playwright em 1440×900: `/settings`, `/settings/dashboard`, `/audience/manage`, `/settings/plans`, `/settings/emails` (placeholder)

### Próximos passos da Onda G

1. ~~Conectar form de `/settings` a um endpoint Rails real~~ ✅ feito (PATCH /api/v1/admin/community)
2. ~~Carregar membros reais em `/audience/manage` via `GET /api/v1/users` com paginação~~ ✅ feito (GET /api/v1/admin/users)
3. Implementar drag-drop em `/settings/spaces` pra reordenar
4. Capturar e replicar mais telas Circle (Workflows, Analytics, AI Agents)
5. ~~Adicionar permissão por role no Rails (apenas admins acessam `/settings/*`)~~ ✅ feito (Api::V1::Admin::BaseController#require_admin!)
6. Conectar Plans, Paywalls, Spaces, Dashboard a endpoints reais
7. Detalhe de membro (modal /audience/:id) + ações (banir, mudar role)
8. Convites pendentes + solicitações em /audience/invites e /audience/requests

### Backend admin (criado em 25/05/2026)

```
app/controllers/api/v1/admin/
├── base_controller.rb        ← guarda require_admin! (role owner|admin)
├── community_controller.rb   ← GET/PATCH /api/v1/admin/community
├── dashboard_controller.rb   ← GET /api/v1/admin/dashboard (KPIs reais 30d)
├── users_controller.rb       ← GET/PATCH /api/v1/admin/users (paginado, busca, role/status)
├── spaces_controller.rb      ← GET/PATCH /api/v1/admin/spaces + POST /reorder
├── plans_controller.rb       ← CRUD /api/v1/admin/plans
└── paywalls_controller.rb    ← CRUD /api/v1/admin/paywalls
```

Tabelas novas em 25/05/2026 (migration `20260525160000_add_plans_and_paywalls.rb`):
- `plans` (community_id, name, description, price_cents, currency, interval, highlight, active, position)
- `paywalls` (community_id, name, description, price_cents, currency, interval, status)

Description, locale e timezone da comunidade são salvos no jsonb `communities.settings` pra evitar nova migration. User de dev `vitor-araujo` foi promovido a `owner` no banco.
