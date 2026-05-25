# Deploy comunidade.com no Fly.io

Resumo prático para subir o app na Fly.io. A região recomendada é **gru** (São Paulo).

## Pré-requisitos

- Conta na Fly.io com cartão cadastrado (free tier serve para começar)
- `flyctl` instalado: <https://fly.io/docs/hands-on/install-flyctl/>
- Repositório com `Dockerfile`, `fly.toml` e `.dockerignore` na raiz (já estão commitados)

## Primeira subida

```bash
flyctl auth login
flyctl apps create comunidade-com
flyctl volumes create comunidade_data --region gru --size 1
```

Configurar segredos antes do deploy:

```bash
flyctl secrets set \
  RAILS_MASTER_KEY="$(cat config/master.key)" \
  SECRET_KEY_BASE="$(bin/rails secret)" \
  DATABASE_URL="postgresql://..." \
  REDIS_URL="rediss://default:senha@host:6379/0" \
  SUPABASE_URL="https://..." \
  SUPABASE_ANON_KEY="..." \
  SUPABASE_SERVICE_ROLE_KEY="..." \
  STRIPE_SECRET_KEY="sk_live_..." \
  STRIPE_WEBHOOK_SECRET="whsec_..." \
  APP_HOST="https://comunidade.com"
```

## Deploy

```bash
flyctl deploy --remote-only
```

A configuração em `fly.toml` cria 2 processos:

- `web` → Rails + Puma (escalável horizontalmente)
- `worker` → Sidekiq consumindo as filas `default`, `mailers`, `billing`

## Pós-deploy

```bash
flyctl status
flyctl logs
flyctl ssh console -C "bin/rails db:migrate:status"
```

## Webhook do Stripe

Após o deploy, configure o endpoint no painel do Stripe apontando para
`https://comunidade-com.fly.dev/api/v1/billing/webhook` (ou o domínio
customizado) e copie o `whsec_…` para `STRIPE_WEBHOOK_SECRET`.

Eventos que o backend trata hoje:

- `checkout.session.completed` — ativa subscription com `plan_id` salvo no metadata
- `customer.subscription.updated` — sincroniza status e `current_period_end`
- `customer.subscription.deleted` — marca subscription como cancelada

## Custom domain

```bash
flyctl certs add comunidade.com
flyctl certs add www.comunidade.com
```

Depois aponte um `A` para `66.241.124.x` e `AAAA` conforme o painel do Fly.io.

## Rollback

```bash
flyctl releases
flyctl deploy --image registry.fly.io/comunidade-com:deployment-XXX
```
