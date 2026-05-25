# 01 — Layout shell

## Estado da pesquisa

| Item | Status | Arquivo |
|---|---|---|
| Home logada (com trial banner) | ✅ | `01-home-1440.png` |
| Medidas exatas do shell | ✅ | `measurements.json` |
| Topbar isolado | ✅ via `01-home-1440.png` |
| Sidebar comunidade | ✅ via `01-home-1440.png` |

## Achados principais

- **Topbar comunidade** começa em `x:72` (deixa espaço pro community switcher)
- **Topbar admin** começa em `x:0` (ocupa viewport todo)
- Em ambos: altura **64px**
- Banner trial de 48px aparece logo abaixo na comunidade quando em trial
- Community switcher (sidebar primária esquerda na comunidade): **72px** de largura
- Sidebar de navegação dentro da comunidade: **281px**
- Sidebar admin: **368px** com 2 colunas internas (ícones+texto)
