# Circle.so — Mapa completo do painel admin

**Capturado em**: 25/05/2026 17:55–18:14 BRT  
**Fonte**: `projeto-copias-comunidade.circle.so` (acesso admin do Charles)  
**Viewport**: 1440×900

## 14 ícones da sidebar primária (em ordem vertical)

| # | Ícone | URL primária | Sub-páginas |
|---|---|---|---|
| 1 | back-to-community | `/feed` | (volta pra comunidade) |
| 2 | sw-home | `/settings/dashboard` | _redireciona pra /feed se vazio_ |
| 3 | members | `/audience/manage` | **11 sub-páginas** ↓ |
| 4 | content | `/settings/files` | **8 sub-páginas** ↓ |
| 5 | send | `/settings/emails` | (single page com lista de templates) |
| 6 | workflows | `/settings/workflows` | (templates + automações criadas) |
| 7 | analytics | `/settings/analytics` | **10 sub-páginas** ↓ |
| 8 | community-bot | `/settings/ai-agents/knowledge` | **4 sub-seções** ↓ |
| 9 | payments | `/settings/paywalls` | **7 sub-páginas** ↓ |
| 10 | paywalls-affiliates | `/settings/affiliates_settings` | (single page) |
| 11 | plans | `/settings/plans` | (single page) |
| 12 | site | `/settings/home` | _Página inicial_ |
| 13 | code-tag | `/settings/api` | API tokens |
| 14 | nav-settings | `/settings` | **9 sub-páginas** ↓ Geral |

## Mapa expandido

### 3 — Membros (`/audience/manage`)
Sub-páginas (11):
1. `/audience/manage` — Gerenciar audiência ⭐
2. `/settings/access_groups` — Grupos de acesso
3. `/settings/audience/connect` — Conexões
4. `/settings/segments` — Segmentos
5. `/settings/members/bulk_import_tasks` — Registros em massa
6. `/members/invitation_links` — Links de convite
7. `/members/onboarding` — Onboarding
8. `/settings/member_tags` — Tags
9. `/members/profile_fields` — Campos de perfil
10. `/settings/gamification` — Gamificação
11. `/settings/members/activity_logs` — Registros de atividades

### 4 — Conteúdo (`/settings/files`)
Sub-páginas (8):
1. `/settings/files` — **Mídia (Novo)** ⭐
2. `/settings/posts` — Publicações
3. `/settings/pages` — Páginas
4. `/settings/spaces` — Espaços
5. `/settings/topics` — Tópicos
6. `/settings/moderation` — Moderação
7. `/settings/live_streams` — Ao vivo
8. `/settings/posts/bulk_actions` — Registros em massa

### 7 — Analytics (`/settings/analytics`)
Sub-páginas (10):
1. `/settings/analytics` — Visão Geral ⭐
2. `/settings/analytics/members` — Membros
3. `/settings/analytics/website` — Site
4. `/settings/analytics/spaces` — Espaços
5. `/settings/analytics/post_comments` — Publicações & comentários
6. `/settings/analytics/messages` — Mensagens
7. `/settings/analytics/devices` — Dispositivos
8. `/settings/analytics/events` — Eventos
9. `/settings/analytics/payments` — Pagamentos
10. `/settings/analytics/courses` — Cursos

### 8 — IA / AI Agents (`/settings/ai-agents/knowledge`)
Sub-seções (4 headings na página):
- Apresentando Agentes de IA
- Respostas geradas por IA
- Hub de conhecimento
- Inbox da IA

### 9 — Paywalls (`/settings/paywalls`)
Sub-páginas (7):
1. `/settings/paywalls` — Paywalls ⭐
2. `/settings/coupons` — Cupons
3. `/settings/paywall_groups` — Grupos de assinatura
4. `/settings/paywall_charges` — Transações
5. `/settings/paywall_subscriptions` — Assinaturas
6. `/settings/paywall_tax_settings` — Impostos
7. `/settings/paywall_bulk_logs` — Registros em massa

### 14 — Geral (`/settings`)
Sub-páginas (9):
1. `/settings` — Geral ⭐
2. `/settings/custom_domain` — Domínio personalizado
3. `/settings/community_ai` — IA para comunidades
4. `/settings/mobile_app` — Aplicativo móvel
5. `/settings/weekly_digest` — Resumo semanal
6. `/settings/embed` — Incorporar
7. `/settings/sso` — Single sign-on (SSO)
8. `/settings/connect` — Conexões
9. `/settings/legal` — Jurídico

---

## Total: 67+ páginas no admin

| Categoria | Sub-páginas |
|---|---|
| Geral | 9 |
| Membros | 11 |
| Conteúdo | 8 |
| Analytics | 10 |
| Paywalls | 7 |
| AI Agents | 4 (sub-seções) |
| Workflows | 1 (com builder + 20+ templates) |
| Demais (Dashboard, Emails, Affiliates, Plans, Site, API) | 6 |

## Workflows — 20+ templates de automação prontos

Documentados em `09-admin/workflows-templates.json`. As categorias são:
- E-mail Hub (envio de e-mails)
- Mensagem (DM ao membro)
- Tag (aplicar/remover tag)

Eventos identificados:
- member_joined
- member_joined_space
- post_published
- comment_created
- course_completed
- level_reached
- event_rsvp
- event_started
- email_opened
- email_link_clicked
- member_inactive_30_days
- paywall_purchased

---

## Comparação com nosso clone atual

| Categoria | Nosso clone | Circle real | Gap |
|---|---|---|---|
| **Sidebar primária** | 64px isolada | 0px (mesclada na sidebar de 368px) | ❌ Refatorar |
| **Sidebar secundária** | 368px | 368px com 2 colunas (ícones+texto) | ⚠️ Layout interno |
| **Dashboard** | 4 KPIs | (vazio na conta nova) | ✅ ok |
| **Membros** | 3 sub-páginas | **11 sub-páginas** | ❌ Faltam 8 |
| **Conteúdo** | 7 sub-páginas | 8 (faltava Mídia ser primeira) | ⚠️ Reordenar |
| **Analytics** | 1 (line chart) | **10 sub-páginas** com gráficos | ❌ Faltam 9 |
| **Paywalls** | 1 (lista) | **7 sub-páginas** | ❌ Faltam 6 |
| **AI Agents** | 1 (knowledge) | **4 sub-seções** com agentes editáveis | ❌ Faltam 3 |
| **Workflows** | 4 triggers + 4 actions | **20+ templates** organizados em 3 abas | ❌ Faltam ~16 |
| **E-mails** | 4 templates | (lista mostra "Hub de envios") | ⚠️ Repensar |
| **Geral** | 9 sub-páginas | 9 sub-páginas | ✅ correto |
| **Plans** | CRUD com Stripe | CRUD próprio | ✅ correto |

## Próximas capturas necessárias

- [ ] Detalhe de cada sub-página de Membros (11 telas)
- [ ] Detalhe de cada sub-página de Analytics (10 telas)
- [ ] Detalhe de cada sub-página de Paywalls (7 telas)
- [ ] Editor de workflow (clicar num template e ver os steps)
- [ ] Editor de AI agent (página `/edit/:id/customize`)
- [ ] Página de Mídia em detalhe
- [ ] Modal de criar paywall, plan, workflow, etc
- [ ] Gamificação (níveis, badges, regras)
- [ ] Onboarding (questionário pra novos membros)

## Implicações para o roadmap

A nossa réplica tem **a estrutura certa** (rotas, navegação, ícones, layout geral) mas tem **profundidade menor** em 4 áreas:
1. **Membros** — falta 8/11 sub-páginas
2. **Analytics** — falta 9/10 sub-páginas
3. **Paywalls** — falta 6/7 sub-páginas
4. **Workflows** — falta builder visual com 20+ templates

**Próxima onda sugerida**: refatorar layout admin pra mesclar a sidebar de ícones (64px) dentro da sidebar de texto (368px), e popular as 30+ sub-páginas faltantes usando o pattern `AdminSettingsForm` existente onde possível.
