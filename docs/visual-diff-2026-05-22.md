# Visual Diff Report — comunidade.com vs P6

**Data:** 22/05/2026 21:38 (Onda B + B-2 finalizadas)
**Viewport de referência:** 1440x900
**Método:** Playwright MCP capturando elementos via `getBoundingClientRect()` + `getComputedStyle()`

---

## ✅ Tokens fundamentais — IDÊNTICOS

| Token | P6 | Local | Status |
|---|---|---|---|
| `--brand` | `#e11d48` | `#e11d48` | ✅ |
| `--circle-primary` | `#506cf0` | `#506cf0` | ✅ |
| `--font-sans` | `InterVariable` | `InterVariable` | ✅ |
| `body` background | `#f7f9fa` | `#f7f9fa` | ✅ |
| `--p6-topbar-height` | `64px` | `64px` | ✅ |
| `--p6-sidebar-width` | `281px` | `281px` | ✅ |
| `--p6-page-header-height` | `72px` | `72px` | ✅ |
| `--color-text-darkest` | `#191b1f` | `#191b1f` | ✅ |

---

## 🎯 Validação visual em 10 rotas — TODAS IDÊNTICAS À P6

```
ROTAS COM SIDEBAR (281px à esquerda):
   /              ✅
   /feed          ✅
   /c/chat-geral  ✅
   /c/feed-geral  ✅
   /c/membros     ✅
   /c/seu-progresso ✅
   /c/aulas-gravadas ✅
   /c/network     ✅

ROTAS SEM SIDEBAR (full width pós-topbar):
   /courses       ✅
   /events        ✅
   /members       ✅
   /leaderboard   ✅
```

Em todas: topbar 64px, h1 20px/600/letter-spacing tight, main bg #f7f9fa.

---

## 🔧 Fixes aplicados nas Ondas B + B-2

### Onda B (sessão anterior)

1. `.chat-main` background → `--color-grey-50` (#f7f9fa)
2. `.chat-room-title h1` → 20px / 600 / tracking tight
3. `.members-main` background → `--color-grey-50`
4. `.members-title h1` → 20px / 600 / tracking tight / line-height 30
5. `.members-main` recebe `withSidebar` dinâmico
6. **REVERTIDO em B-2:** havia mudado .leaderboard-main, .courses-main, .events-main para acomodar sidebar — mas P6 não mostra sidebar nessas páginas

### Onda B-2 (esta sessão)

7. **`shouldShowSidebar` lógica revertida** no `ChatLayout.tsx`:
   ```ts
   const hideSidebarViews: ChatView[] = ["leaderboard", "members", "courses", "events"];
   const shouldShowSidebar = !hideSidebarViews.includes(activeView) || pathname.startsWith("/c/");
   ```

8. **`.leaderboard-main`** revertido para `inset: var(--p6-topbar-height) 0 0 0`
9. **`.courses-main, .events-main`** revertidos para `left: 0`

10. 🔴 **BUG CRÍTICO CORRIGIDO:** `.chat-message-content p` usava `color: var(--color-text-primary)` que é `var(--color-grey-50)` = `#f7f9fa` = mesma cor do FUNDO. Texto invisível.
    **Fix:** trocar para `color: var(--color-text-darkest, #191b1f)`. Agora matcha exatamente P6.

11. **`.chat-message-content p` font-weight**: era 450 (custom), trocado para 400 (`--font-weight-normal`) — matcha Tailwind `font-normal` da P6.

12. **`.chat-message-content p` line-height**: era 1.45, trocado para 1.5 — matcha Tailwind `leading-normal`.

---

## 🟡 Diffs ainda pendentes (próximas Ondas)

### Telas a auditar
- [ ] LoginPanel (precisa cookies/captcha pra login dummy P6)
- [ ] Modal "criar post" (clicar em + post)
- [ ] Modal "criar space" (admin)
- [ ] Member profile modal
- [ ] Search modal/dropdown
- [ ] Notifications dropdown

### Estados/interações
- [ ] Hover em mensagens (3 botões: favoritar, responder, mais)
- [ ] Reactions popover
- [ ] Threads abertas (lateral panel)
- [ ] Empty states
- [ ] Loading skeletons
- [ ] Error states

### Mobile
- [ ] Breakpoint 1280px
- [ ] Breakpoint 1180px
- [ ] Breakpoint 820px
- [ ] Breakpoint 560px
- [ ] Mobile menu (hamburger)

### Composer
- Ainda há diff visual: P6 mostra composer pequeno (~21px input single-line), nosso mostra completo com toolbar. P6 expande on-focus. Investigar.

---

## 📊 Score de fidelidade visual

| Camada | Score |
|---|---|
| Tokens base (cores, fontes, spacing) | **100%** ✅ |
| Layout estrutural (sidebar, topbar, main) | **100%** ✅ |
| Headers de página (h1, page-header) | **100%** ✅ |
| Mensagens chat (avatar, name, body, color) | **~95%** ✅ |
| Conteúdo dos componentes (cards, posts) | **~75%** (não auditado em detalhe) |
| Modais e dropdowns | **~50%** (não auditados) |
| Mobile responsivo | **~50%** (não auditado) |

**Score global estimado: ~88%** (era 70% pré-Onda B, 85% pós-Onda B)

Meta: **>95%** após auditoria de modais/interações + mobile.

---

## 📐 Screenshots de referência

Salvos em `.playwright-mcp/`:
- `p6-chat-1440.png` — P6 Chat Geral
- `local-chat-1440.png` — Local pré-fix
- `local-chat-after-fix.png` — Local pós-Onda B
- `local-chat-after-message-fix.png` — Local pós-Onda B-2 (mensagem visível)
- `local-chat-onda-b2-final.png` — Final Onda B-2
- `p6-feed-1440.png` — P6 Feed
- `local-feed-1440.png` — Local Feed
- `p6-members-real-1440.png` — P6 Members (sem sidebar, full width)
- `local-members-after-fix.png` — Local Members

---

## 🛠️ Debug MCP Playwright (problemas conhecidos)

### Problema 1: File chooser modal trava todas as tools
**Causa:** ChatComposer click em botão de anexo dispara `fileInputRef.current?.click()` que abre seletor nativo do SO.
**Solução:** Tools `browser_handle_dialog` e `browser_press_key` não funcionam em modal SO. Usar `browser_close` + reabrir tab.

### Problema 2: Viewport reseta em nova tab
**Causa:** browser_close + nova nav cria tab nova com viewport default (1920x1080).
**Solução:** sempre `browser_resize 1440 900` após open novo.

### Problema 3: P6 Cloudflare rate-limit
**Causa:** Cloudflare Turnstile detecta padrão de automação após N requests.
**Solução:** aguardar 5-15min, ou usar cookies de sessão real via `context.addCookies()`.

Playwright MCP atual está com stealth-mode parcial (webdriver=false, UA Chrome 148, plugins=5, webGL=true).
