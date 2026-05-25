# Status Técnico — comunidade.com

**Data:** 22/05/2026 18:30 (atualizado após implementações)

---

## 🎉 Stack rodando ponta-a-ponta

### Frontend (Vite/React)
- **Vite v8.0.10** rodando em `http://127.0.0.1:5173`
- IPv4 forçado, alias e proxy configurados
- 27 arquivos críticos validados (HTTP 200)
- 69 arquivos TS/TSX, 11.033 linhas
- 21 pastas de componentes
- 831 design tokens P6 importados

### Backend (Rails)
- **Rails 7.2.3.1 + Puma 8.0.1 + Ruby 3.3.11** em `http://127.0.0.1:3000`
- 15 controllers de API v1, todos respondendo HTTP 200
- 18 models com associações
- 7 serializers, FeedQuery
- ApplicationController com fallback dev → user `vitor-araujo`
- **Auth real implementada** com bcrypt + has_secure_password
- **Action Cable channels implementados** (Chat, Notification, Presence)
- **CORS configurado** para Vite

### Banco (Supabase)
- **PostgreSQL 17.6** no projeto `comunity-society` (us-east-2)
- Conexão: Transaction pooler em `aws-1-us-east-2.pooler.supabase.com:6543`
- 21 tabelas em `public` (17 do schema + 4 views)
- 6 migrations marcadas como aplicadas em `schema_migrations`
- 25 spaces e múltiplos posts já populados

### Infra adicional
- Neo4j Desktop 2 instância "graphiti" RUNNING (127.0.0.1:7687)
- 8 MCPs configurados em Codex e Kiro
- OpenAI: $10 crédito, hard limit $8

---

## ✅ Endpoints validados em 22/05/2026 18:30

| Endpoint | Status | Tamanho |
|---|---|---|
| `GET /api/v1/auth` | 200 | 170 bytes (user vitor-araujo) |
| `GET /api/v1/spaces` | 200 | 5.584 bytes (25 spaces) |
| `GET /api/v1/posts` | 200 | 58.498 bytes |
| `GET /api/v1/memberships` | 200 | 10.897 bytes |
| `GET /api/v1/courses` | 200 | 176 bytes |
| `GET /api/v1/lessons` | 200 | 467 bytes |
| `GET /api/v1/rankings` | 200 | 12.189 bytes |
| `GET /api/v1/notifications` | 200 | 2 bytes (vazio ok) |
| `GET /api/v1/direct_conversations` | 200 | 2 bytes (vazio ok) |
| `GET /api/v1/member_connections` | 200 | 439 bytes |
| `GET /api/v1/messages` | 200 | 10.970 bytes |
| `GET /api/v1/billing` | 200 | 47 bytes |
| **POST /api/v1/auth/signup** | **201** | Cria usuário com password_digest |
| **POST /api/v1/auth** (login) | **200** | Autentica via bcrypt |
| **POST /api/v1/auth** (senha errada) | **401** | invalid_credentials |

---

## ✅ Implementações aplicadas hoje

### Action Cable — Real-time funcional
- `app/channels/application_cable/connection.rb` — autenticação por sessão
- `app/channels/chat_channel.rb` — subscribe/speak/typing por space
- `app/channels/notification_channel.rb` — stream por user, mark_read
- `app/channels/presence_channel.rb` — status online/offline broadcast

### Auth com bcrypt
- Gem `bcrypt ~> 3.1` adicionada ao Gemfile
- Migration `20260522180000_add_password_digest_to_users` aplicada
- `User` model com `has_secure_password validations: false`
- `Api::V1::AuthController#create` — login real com authenticate
- `Api::V1::AuthController#signup` — registro novo (route `POST /api/v1/auth/signup`)
- `Api::V1::AuthController#destroy` — logout com status offline

### CORS pra Vite
- `config/initializers/cors.rb` aceita `localhost:5173` e `127.0.0.1:5173`
- Credentials habilitado pra cookies de sessão

---

## 🟡 Pendências de menor prioridade

### Frontend
- Pastas vazias: `admin/`, `paywall/`, `moderation/`
- `application.css` com 11.564 linhas (precisa modularizar)
- `lib/communityApi.ts` com 2.089 linhas (split por domínio)
- Sem React Router (routing manual em `ChatLayout.tsx`)

### Visual
- Comparação sistemática das 70 rotas P6 vs versão local não feita
- Diff visual lado-a-lado é a próxima Onda

### Backend
- Sem Devise/JWT (usando session-based simples)
- Sidekiq não está rodando (jobs background ficam parados)
- Active Storage sem provider configurado (uploads não persistem fora do disco)

---

## 🚦 Como iniciar tudo (cheatsheet)

```powershell
# Terminal 1 - Vite (frontend SPA)
cd C:\Users\Servico\Documents\Projeto-Website\comunidade.com\comunidade
npm run dev

# Terminal 2 - Rails (backend API)
cd C:\Users\Servico\Documents\Projeto-Website\comunidade.com\comunidade
bin\rails server -p 3000 -b 127.0.0.1

# Terminal 3 - Sidekiq (opcional, jobs background)
cd C:\Users\Servico\Documents\Projeto-Website\comunidade.com\comunidade
bundle exec sidekiq

# Neo4j Desktop 2 - manual
# Abrir o app, dar Start na instancia "graphiti"
```

URLs:
- Frontend SPA: http://127.0.0.1:5173
- API Rails: http://127.0.0.1:3000/api/v1/auth
- Action Cable: ws://127.0.0.1:3000/cable
- Neo4j Browser: http://127.0.0.1:7474

---

## 📊 Estatísticas finais

| Camada | Arquivos | Linhas |
|---|---|---|
| Frontend TS/TSX | 69 | 11.033 |
| CSS | 3 | 12.671 |
| Backend Ruby | 53+ | 1.000+ (após implementações) |
| **Total** | **125+** | **24.700+** |

Banco:
- 21 tabelas
- 25 spaces
- Múltiplos posts e dados de teste já populados
- 6 migrations aplicadas

---

## 🎯 Próxima Onda — Visual Diff (P6 vs comunidade.com)

Prereq: precisa do Playwright MCP funcional (Ctrl+Shift+P → MCP Reload no Kiro).

Plano:
1. Capturar 70 rotas da P6 sistematicamente
2. Capturar mesmas rotas locais (5173)
3. Diff de screenshot por página
4. Listar diferenças (margens, fontes, cores, spacing)
5. Aplicar correções em CSS/componentes
6. Re-capturar e validar
