# Circle.so — Research completa

Este diretório é o "dossiê" da Circle.so capturado para servir de fonte da
verdade da nossa réplica. Tudo que está aqui foi extraído da comunidade
`projeto-copias-comunidade.circle.so` (acesso admin do Charles, autorizado).

## Estrutura

```
docs/circle-research/
├── 01-layout/         — Layout shell, topbar, sidebars, breakpoints
├── 02-spaces/         — Tipos de espaço (feed, chat, course, event, members, link)
├── 03-feed/           — Listagem, post detail, criação, comentários, reações
├── 04-chat/           — Mensagens, threads, reações, presença, anexos
├── 05-courses/        — Curso, lições, progresso, certificado
├── 06-members/        — Diretório, perfil, conexões, DMs
├── 07-events/         — Calendário, página de evento, RSVP
├── 08-modals/         — Modais e overlays globais (search, profile, settings)
├── 09-admin/          — Painel administrativo completo
├── 10-mobile/         — Breakpoints e variações mobile
└── 11-measurements/   — Tabelas com medidas exatas (px) de cada elemento
```

Cada pasta tem:
- `README.md` — descrição da seção e link para os screenshots
- Screenshots `.png` numerados
- `measurements.json` — quando aplicável, medidas extraídas via JS

## Convenções

- Resolução padrão de captura: **1440 × 900** (desktop principal)
- Captura adicional em **1280, 1024, 820, 560** (breakpoints)
- Nome do arquivo: `<numero>-<descricao-curta>.png`
- Se a tela tem hover/state, capturar `default`, `hover`, `active`, `disabled`

## Ordem de execução desta pesquisa

1. ✅ Estrutura de pastas criada
2. ⏳ Layout shell (topbar, sidebars, main, footer)
3. ⏳ Cada tipo de espaço aberto
4. ⏳ Painel admin completo (já tinha 17 capturas iniciais)
5. ⏳ Modais globais (search, profile, settings, criar post)
6. ⏳ Mobile breakpoints
7. ⏳ Tabela de medidas final

## Como usar

Cada vez que formos refinar uma seção da nossa réplica, abre o `README.md`
da pasta correspondente, compara com o que está em `comunidade/app/javascript/`
e ajusta. Esse dossiê é a referência única.
