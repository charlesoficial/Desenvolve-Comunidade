# Continuidade da conta 2

Este arquivo é o handoff para a próxima conta/agente continuar o projeto sem repetir erros e sem perder o contexto técnico.

Projeto real:

`C:/Users/Servico/Documents/Projeto-Website/comunidade.com/comunidade`

Referência absoluta:

`C:/Users/Servico/Documents/Projeto-Website/comunidade.com/SOURCE-SIX`

Data do handoff: 2026-05-01.

## Objetivo do projeto

Estamos reconstruindo a comunidade dentro do projeto `comunidade/`.

A meta é deixar o projeto visual e funcionalmente idêntico à comunidade original extraída em `SOURCE-SIX`, incluindo:

- layout
- medidas
- espaçamentos
- cores
- fontes
- ícones
- imagens
- estados hover, active, focus e disabled
- responsividade
- comportamento de menus, modais, feed, chat, membros, cursos, eventos e demais páginas
- lógica de funcionamento
- integração com backend Rails/Supabase
- autenticação real do projeto
- dados dinâmicos

O resultado final precisa ser React/TypeScript nativo, integrado ao Rails/Supabase, manutenível e escalável.

## O que é SOURCE-SIX

`SOURCE-SIX/` é uma extração da comunidade original.

Ela contém:

- HTML extraído
- CSS extraído
- JavaScript extraído
- screenshots
- tokens
- assets
- ícones
- fontes
- medidas
- rotas observadas
- lógica de funcionamento
- APIs observadas

`SOURCE-SIX` é referência absoluta para reconstrução.

Ela serve para medir, comparar, entender e reconstruir o projeto atual com fidelidade.

Regra de ouro:

`SOURCE-SIX` ajuda a reconstruir.

`SOURCE-SIX` não é o projeto.

O projeto real é `comunidade/`.

## O que nunca pode ser feito

É proibido:

- usar iframe
- criar `SourceSixFrame`
- servir HTML extraído do `SOURCE-SIX`
- copiar `SOURCE-SIX` para `public/` como runtime
- transformar a aplicação em site estático
- renderizar páginas capturadas diretamente
- importar HTML capturado como se fosse componente final
- depender de JS/CSS extraído como runtime da aplicação final

A reconstrução deve ser feita como componentes React/TSX nativos.

O HTML, CSS, JS, screenshots, tokens e assets do `SOURCE-SIX` são somente referência técnica e visual.

## Erro cometido na primeira conta

A primeira conta/agente cometeu um erro grave de arquitetura.

O erro foi:

- criou `SourceSixFrame.tsx`
- renderizou HTML extraído do `SOURCE-SIX` dentro de iframe
- tratou captura estática como se fosse reconstrução
- copiou/serviu partes extraídas em runtime

Isso foi rejeitado pelo usuário porque não era reconstrução real.

Por que estava errado:

- não integrava com Rails/Supabase
- não usava o sistema real de autenticação
- não usava dados dinâmicos
- não era manutenível
- não era escalável
- podia causar conflito com JS extraído
- dava falsa impressão de fidelidade visual
- não transformava a comunidade em componentes React/TypeScript nativos

Depois disso, a arquitetura foi corrigida removendo esse caminho.

A próxima conta não deve repetir esse erro em nenhuma hipótese.

## Regra sobre exemplos não serem escopo fechado

Quando o usuário citar rotas, arquivos, páginas ou componentes como exemplo, isso não significa que o trabalho deve ficar limitado somente a eles.

Exemplo: se o usuário citar `/c/feed-geral`, `/members` e `/courses`, isso não quer dizer que só essas páginas importam.

O escopo real da reconstrução é completo:

- todas as páginas do `SOURCE-SIX`
- todas as rotas
- todos os componentes
- todos os canais
- todos os posts capturados
- todos os assets
- todos os ícones
- todas as fontes
- todas as medidas
- toda a lógica de funcionamento
- todos os endpoints e integrações relevantes

Só considerar escopo limitado se o usuário disser explicitamente algo como: "corrija somente estes itens".

Na dúvida, interpretar o escopo como completo.

## Estado atual da auditoria

O mapa principal do projeto é:

`docs/source-six-diff-report.md`

Esse relatório deve guiar as próximas fases.

Estado registrado no relatório:

- 78 rotas/páginas encontradas no `SOURCE-SIX`
- 78 rotas classificadas
- 71 existem mas divergem
- 6 usam componente errado
- 0 páginas base faltando
- 1 não confirmada
- 29 páginas individuais de post capturadas
- 402 assets em `SOURCE-SIX/assets`
- 402 assets em `comunidade/public/source-six-assets`

O relatório separa:

- problemas globais
- problemas por página
- componentes errados ou genéricos demais
- páginas faltando
- páginas individuais de post
- matriz de cobertura `SOURCE-SIX x comunidade`
- ordem recomendada de correção

Observação importante: alguns documentos antigos ainda podem exibir mojibake dependendo de como o terminal lê UTF-8. A próxima conta deve verificar o arquivo real antes de assumir corrupção. O relatório em si já foi usado como fonte de planejamento, mas ainda deve ser tratado como mapa de pendências, não como prova de que algo está pixel perfect.

## Grupo 1 aplicado

O Grupo 1 foi aplicado antes deste handoff.

Arquivos editados no Grupo 1:

- `app/javascript/design-system/p6-canonical-tokens.css`
- `app/javascript/design-system/components.css`
- `app/javascript/styles/application.css`
- `app/javascript/components/chat/ChatLayout.tsx`
- `app/javascript/components/chat/ChatTopbar.tsx`
- `app/javascript/data/chatData.ts`
- `app/javascript/data/sourceSixRoutes.ts`
- `docs/conversa-e-execucao.md`
- `docs/source-six-diff-report.md`

Também foram regenerados artefatos de build em `dist/`.

O Grupo 1 resolveu ou iniciou a base global:

- encoding corrompido nos arquivos auditados
- tokens globais
- fonte `InterVariable`
- body `16px/24px`
- background global `#f7f9fa`
- texto global `#3b3b3b`
- marca principal `#e11d48`
- tokens globais de topbar
- tokens globais de sidebar
- tokens globais de z-index
- tokens globais de breakpoints
- layout base
- topbar
- sidebar

Detalhes relevantes observados nos arquivos:

- `p6-canonical-tokens.css` contém `@font-face` para `InterVariable`, `InterVariable-Italic` e `SF Mono`.
- `components.css` contém classes globais para `.p6-icon-button`, `.p6-search-field`, `.p6-nav-pill`, `.p6-sidebar-item`, avatar, badges e painéis.
- `application.css` define a base visual e variáveis do shell.
- `ChatLayout.tsx` roteia as páginas principais e rotas `/c/*`.
- `chatData.ts` contém a lista completa de sidebar/canais usada no layout.
- `sourceSixRoutes.ts` contém 78 rotas extraídas do `SOURCE-SIX`.

## Validações feitas

Validações do Grupo 1:

- `npm run build` passou.
- `npm run lint` ainda falhou naquele momento.
- Busca por `iframe`, `SourceSixFrame`, `source-six/html`, `/packs/js`, `/packs/css` em `app/` e `config/` retornou zero ocorrências.
- `SOURCE-SIX` continuou apenas como referência.

O lint falhou por pendências estruturais principalmente em:

- `LoginPanel`
- `ChatMain`
- `CoursesMain`
- `MembersMain`
- `PostDetail`
- `ProgressMain`
- `P6Icon`
- `ChatTopbar`

Atualização importante desta conta: o Grupo 1.5 foi executado depois do Grupo 1 e corrigiu essas pendências estruturais de lint. No estado atual desta conversa:

- `npm run lint` passou.
- `npm run build` passou.
- Busca em `app/` e `config/` confirmou zero ocorrências para `iframe`, `SourceSixFrame`, `source-six/html`, `/packs/js` e `/packs/css`.

Arquivos editados no Grupo 1.5:

- `app/javascript/components/auth/LoginPanel.tsx`
- `app/javascript/components/chat/ChatMain.tsx`
- `app/javascript/components/chat/ChatLayout.tsx`
- `app/javascript/components/chat/ChatTopbar.tsx`
- `app/javascript/components/courses/CoursesMain.tsx`
- `app/javascript/components/feedGeral/FeedGeralMain.tsx`
- `app/javascript/components/global/NotificationsPanel.tsx`
- `app/javascript/components/members/MembersMain.tsx`
- `app/javascript/components/pages/PostDetail.tsx`
- `app/javascript/components/pages/CanalLayout.tsx`
- `app/javascript/components/pages/canalConfigs.ts`
- `app/javascript/components/progress/ProgressMain.tsx`
- `app/javascript/design-system/components/P6Icon.tsx`
- `app/javascript/design-system/components/makeP6Icon.ts`
- `app/javascript/design-system/index.ts`

Correções do Grupo 1.5:

- hooks estabilizados
- dependências de `useEffect` corrigidas
- `useMemo(getRememberedLogin, [])` corrigido
- `prefer-const` no timer do chat corrigido
- exports mistos de componente/utilitário separados para Fast Refresh
- `Date.now()` removido de cálculo direto durante render
- inicialização de tab em `CoursesMain` movida para lazy state

## Pendências atuais

Ainda faltam:

- revalidar lint/build no início da próxima conta
- corrigir componentes errados/genéricos
- corrigir páginas principais
- corrigir canais
- corrigir `PostDetail`
- cobrir posts individuais
- corrigir comportamentos JS avançados
- comparar visualmente por screenshot
- validar medidas pixel a pixel contra `SOURCE-SIX`
- validar APIs/backend contra comportamento observado
- reconciliar assets e ícones página por página
- validar responsividade mobile/tablet/desktop
- validar menus, modais, busca, notificações, reactions, bookmarks, upload, scroll infinito e painéis laterais

Não marcar páginas específicas como corrigidas sem comparação real contra HTML, screenshot, token e comportamento do `SOURCE-SIX`.

## Próximo passo obrigatório: Grupo 1.5

Para uma próxima conta que leia este handoff como ponto de entrada, o primeiro passo deve ser revalidar o Grupo 1.5.

Status atual desta conta: Grupo 1.5 já foi concluído e `lint/build` passaram.

Mesmo assim, a próxima conta deve começar por uma checagem curta:

1. Rodar `npm run lint`.
2. Rodar `npm run build`.
3. Buscar referências proibidas:
   - `iframe`
   - `SourceSixFrame`
   - `source-six/html`
   - `/packs/js`
   - `/packs/css`
4. Confirmar que `SOURCE-SIX` segue apenas como referência.

Se tudo continuar passando, não refazer o Grupo 1.5. Avançar para o próximo grupo de correção.

Se algum erro voltar, corrigir somente lint estrutural, preservando comportamento.

Não fazer no Grupo 1.5:

- criar páginas novas
- corrigir visual pixel perfect
- mexer nos componentes errados além do necessário para lint
- alterar contratos de API
- alterar design system sem necessidade
- implementar PostDetail funcional além do necessário para lint

## Depois do Grupo 1.5

Depois de lint/build estarem confirmados, avançar para os componentes errados/genéricos identificados na auditoria.

Essas rotas existem tecnicamente, mas ainda usam componente errado ou genérico demais.

A próxima fase deve ler para cada rota:

- HTML correspondente em `SOURCE-SIX/html/`
- screenshot correspondente em `SOURCE-SIX/screenshots/`
- token correspondente em `SOURCE-SIX/tokens/`
- CSS/JS do `SOURCE-SIX` apenas para referência
- componente atual em `comunidade/app/javascript`
- APIs existentes em `communityApi.ts`

Depois reconstruir em React/TSX nativo, com dados reais, sem iframe e sem HTML estático.

## Componentes errados identificados

Os 6 componentes errados/genéricos registrados no relatório são:

- `/c/evento-aula`
- `/c/metodop6`
- `/c/fba`
- `/c/aulas-nvl1`
- `/c/opsec-2026`
- `/c/influencer-ia-tiktok-dark`

Observações:

- `/c/evento-aula` usa fallback de eventos, mas precisa layout próprio conforme `SOURCE-SIX`.
- `/c/metodop6` usa `CanalLayout`, mas o SOURCE indica página de curso/aula, não feed genérico.
- `/c/fba` usa `CanalLayout`, mas precisa estrutura própria.
- `/c/aulas-nvl1` usa fallback de cursos, mas precisa estrutura própria.
- `/c/opsec-2026` usa `CanalLayout`, mas precisa layout próprio.
- `/c/influencer-ia-tiktok-dark` é tratado como curso/canal genérico, mas precisa comparação específica.

## Arquivos importantes

Documentos:

- `docs/conversadaconta.1.md`
- `docs/conversa-e-execucao.md`
- `docs/source-six-diff-report.md`
- `docs/source-six-measurement-audit.md`
- `docs/conversadaconta.2.md`

Design system:

- `app/javascript/design-system/p6-canonical-tokens.css`
- `app/javascript/design-system/components.css`
- `app/javascript/styles/application.css`
- `app/javascript/design-system/components/P6Icon.tsx`
- `app/javascript/design-system/components/makeP6Icon.ts`
- `app/javascript/design-system/index.ts`

Layout global:

- `app/javascript/components/chat/ChatLayout.tsx`
- `app/javascript/components/chat/ChatTopbar.tsx`
- `app/javascript/components/chat/ChatSidebar.tsx`
- `app/javascript/data/chatData.ts`
- `app/javascript/data/sourceSixRoutes.ts`
- `app/javascript/data/communityData.ts`

Páginas/componentes principais:

- `app/javascript/components/feedGeral/FeedGeralMain.tsx`
- `app/javascript/components/chat/ChatMain.tsx`
- `app/javascript/components/members/MembersMain.tsx`
- `app/javascript/components/leaderboard/LeaderboardMain.tsx`
- `app/javascript/components/courses/CoursesMain.tsx`
- `app/javascript/components/events/EventsMain.tsx`
- `app/javascript/components/pages/PostDetail.tsx`
- `app/javascript/components/pages/CanalLayout.tsx`
- `app/javascript/components/pages/canalConfigs.ts`

Globais/comportamentos:

- `app/javascript/components/global/SearchModal.tsx`
- `app/javascript/components/global/NotificationsPanel.tsx`
- `app/javascript/components/global/MembersOnlinePanel.tsx`
- `app/javascript/components/global/PostReactions.tsx`
- `app/javascript/components/global/ThreadPanel.tsx`
- `app/javascript/components/global/BookmarkButton.tsx`
- `app/javascript/lib/communityApi.ts`

Referência:

- `SOURCE-SIX/html/`
- `SOURCE-SIX/css/`
- `SOURCE-SIX/js/`
- `SOURCE-SIX/screenshots/`
- `SOURCE-SIX/tokens/`
- `SOURCE-SIX/assets/`

## Critérios de aceite para próximas fases

Para qualquer página ou componente corrigido:

- usar React/TypeScript nativo
- buscar dados reais via API Rails/Supabase quando houver endpoint
- preservar autenticação real do projeto
- não servir HTML capturado
- não usar iframe
- não introduzir dependência runtime de `SOURCE-SIX`
- comparar contra HTML, screenshot, token e CSS do `SOURCE-SIX`
- aplicar medidas exatas sempre que confirmadas
- registrar valores não confirmados sem fingir pixel perfect
- rodar `npm run lint`
- rodar `npm run build`
- buscar referências proibidas em `app/` e `config/`
- listar arquivos alterados
- listar pendências restantes

Critério visual:

- só considerar página "corrigida" depois de comparação real por screenshot e tokens.

Critério funcional:

- comportamento deve ser dinâmico e integrado ao backend, não estático.

Critério de escopo:

- exemplos do usuário são ponto de partida, não lista final, exceto quando ele disser claramente que o escopo é limitado.

## Prompt sugerido para a próxima conta

Use este prompt para iniciar a próxima conta:

```text
Estamos reconstruindo a comunidade no projeto:

C:/Users/Servico/Documents/Projeto-Website/comunidade.com/comunidade

Leia primeiro:

- docs/conversadaconta.2.md
- docs/source-six-diff-report.md
- docs/conversa-e-execucao.md, se existir

Regra absoluta:

SOURCE-SIX é apenas referência. Não use iframe. Não crie SourceSixFrame. Não sirva HTML extraído. Não copie SOURCE-SIX para public como runtime. Não transforme o projeto em site estático.

Antes de avançar, revalide o Grupo 1.5:

1. Rode npm run lint.
2. Rode npm run build.
3. Busque em app/ e config/ por iframe, SourceSixFrame, source-six/html, /packs/js e /packs/css.
4. Confirme que SOURCE-SIX continua apenas como referência.

Se lint/build passarem, avance para o próximo grupo: corrigir os 6 componentes errados/genéricos identificados no relatório:

- /c/evento-aula
- /c/metodop6
- /c/fba
- /c/aulas-nvl1
- /c/opsec-2026
- /c/influencer-ia-tiktok-dark

Para cada rota, leia HTML, screenshot e tokens correspondentes em SOURCE-SIX, mas reconstrua em React/TypeScript nativo com dados reais via Rails/Supabase.

Não implemente páginas fora desse grupo sem nova instrução.
```
