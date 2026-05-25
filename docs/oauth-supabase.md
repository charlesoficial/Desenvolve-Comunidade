# OAuth Google e Amazon via Supabase (Onda A)

O frontend já chama `startOAuth("google")` e `startOAuth("amazon")` em `LoginPanel`. Para liberar isso é só configurar os providers no painel do Supabase.

## Google

1. Acesse o Google Cloud Console → APIs & Services → Credentials.
2. Crie um OAuth Client ID do tipo "Web application".
3. Em **Authorized redirect URIs** adicione:
   - `https://PROJECT_REF.supabase.co/auth/v1/callback`
4. Copie o Client ID e Client Secret.
5. No Supabase: Authentication → Providers → Google → Enable.
6. Cole o Client ID e Client Secret.
7. Em Authentication → URL Configuration → Redirect URLs adicione:
   - `http://127.0.0.1:5173/auth/callback`
   - `https://comunidade.com/auth/callback` (produção)

## Amazon (Login with Amazon)

1. Acesse <https://developer.amazon.com/loginwithamazon/console/site/lwa/overview.html>.
2. Crie um Security Profile e gere um Web Settings com:
   - **Allowed Return URLs**: `https://PROJECT_REF.supabase.co/auth/v1/callback`
3. No Supabase: Authentication → Providers → Amazon → Enable.
4. Cole o Client ID e Client Secret.

## Fluxo

1. Usuário clica em "Google" ou "Amazon" no `LoginPanel`.
2. `startOAuth(provider)` redireciona para `https://PROJECT_REF.supabase.co/auth/v1/authorize?provider=...&redirect_to=https://app/auth/callback`.
3. Supabase redireciona o navegador de volta com `#access_token=...&refresh_token=...`.
4. `AppLayout` chama `consumeOAuthCallback()` no primeiro render: parseia o hash, salva a sessão em `localStorage` (`cs-auth-session`), busca o user via `/auth/v1/user` e limpa o hash da URL.
5. As próximas chamadas REST/Action Cable já enviam o JWT no header `Authorization: Bearer ...`. O `ApplicationController#supabase_jwt_email` do Rails decodifica o JWT, encontra o usuário pelo email e estabelece a sessão server-side.

## Sincronização com a tabela `users`

Como o JWT do Supabase identifica o usuário só pelo email, garanta que ao logar pela primeira vez via OAuth o app crie/atualize a linha em `users` (mesma tabela que armazena `username`, `display_name`, `role`, `password_digest`).

Sugestão futura: hook `auth.signUp` no Supabase que insere via REST na tabela `users`.
