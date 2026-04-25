# 📱 Plano de Responsividade Mobile — AstroMap

**Objetivo:** Tornar a UI amigável para dispositivos mobile **sem alterar nada da aparência em desktop**.

**Estratégia:** 100% das alterações serão feitas com prefixos responsivos do Tailwind (`max-md:`, `md:`, `lg:`) — zero impacto visual em telas ≥1024px.

---

## 🔍 Diagnóstico Geral

| Aspecto | Estado Atual |
|---|---|
| Sidebar em mobile | Ocupa largura total, empurra conteúdo |
| Header (botões) | Textos longos ocupam espaço excessivo |
| Paddings dos containers | `p-8` fixo em todos os tamanhos de tela |
| Info header badges | Funcionais mas com espaçamento folgado |
| AstroChart legenda | Adaptação parcial (`md:hidden` existe) |
| Aspectos lista | Layout horizontal quebra em telas estreitas |
| Traditional Drawer | Largura fixa `max-w-lg` — corta em mobile |
| AI Report | `max-h` fixo que pode conflitar com teclado |
| PlanetTable / HousesTable | Grids já colapsam — ajuste mínimo |
| Login | Quase ok — apenas padding |
| Meta viewport | Padrão Next.js — sem `maximum-scale` |

---

## 📋 Lista de Alterações

### 1. Meta Viewport (`src/app/layout.tsx`)

Adicionar export de viewport para evitar zoom indesejado em inputs mobile.

```ts
export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};
```

---

### 2. Sidebar → Drawer Overlay (`src/app/page.tsx`)

**Problema:** Sidebar ocupa 100% da largura em mobile.

**Solução:**
- Sidebar atual ganha `hidden lg:block` (desktop continua EXATAMENTE igual)
- Novo drawer mobile: `<div className="fixed inset-0 z-50 lg:hidden ...">`
  - Backdrop escuro (`bg-black/60`) + painel lateral deslizando da esquerda
  - Botão hamburger no header (só `<lg`)
  - Framer Motion `AnimatePresence` para animação de entrada/saída
  - Fechar ao tocar no backdrop ou no botão X

**Trecho ilustrativo (mobile drawer):**
```tsx
{/* Hamburger — só mobile */}
<button onClick={toggleMobileSidebar} className="lg:hidden p-2 ...">
  <Menu className="w-5 h-5" />
</button>

{/* Sidebar desktop — inalterada */}
<div className="hidden lg:block lg:col-span-4 space-y-6">
  ...
</div>

{/* Drawer mobile */}
{isMobileSidebarOpen && (
  <div className="fixed inset-0 z-50 lg:hidden">
    <div className="absolute inset-0 bg-black/60" onClick={toggleMobileSidebar} />
    <div className="absolute left-0 top-0 bottom-0 w-[85vw] max-w-sm bg-slate-950 border-r border-white/10 overflow-y-auto p-6">
      ...mesmo conteúdo da sidebar...
    </div>
  </div>
)}
```

---

### 3. Header Responsivo (`src/app/page.tsx`)

| Elemento | Desktop (inalterado) | Mobile |
|---|---|---|
| Título | `text-xl` | `text-base` |
| "Calcular Novo Mapa" | Texto + ícone (`px-4`) | Só ícone (`px-2`) + tooltip |
| "Sair" | Texto + ícone | Só ícone |
| Padding header | `py-3` | `py-2` |

---

### 4. Paddings dos Containers (`src/app/page.tsx`)

| Classe atual | Nova classe |
|---|---|
| `p-8` (glass tab) | `p-4 md:p-8` |
| `p-8` (info header) | `p-4 md:p-8` |
| `gap-8` (grid) | `gap-4 md:gap-8` |
| `px-6 py-4` (accordion headers) | `px-4 py-3 md:px-6 md:py-4` |

---

### 5. Badges do Info Header (`src/app/page.tsx`)

| Classe atual | Nova classe |
|---|---|
| `gap-6` | `gap-2 md:gap-6` |
| `px-4 py-2` | `px-3 py-1.5 md:px-4 md:py-2` |

---

### 6. Lista de Aspectos (`src/components/AspectsList.tsx`)

**Problema:** `flex items-center justify-between` com vários spans lado a lado quebra em telas estreitas.

**Solução:** Cada linha vira `flex-col md:flex-row` com espaçamento vertical em mobile.

| Classe atual | Nova classe |
|---|---|
| `flex items-center justify-between` | `flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0` |
| Badge + órbita + aplicando | `gap-4` → `gap-2 md:gap-4` |

---

### 7. Legenda do AstroChart (`src/components/AstroChart.tsx`)

**Problema:** Flex-wrap fica apertado, padding excessivo.

| Classe atual | Nova classe |
|---|---|
| `px-6 py-4` | `px-3 py-3 md:px-6 md:py-4` |
| `gap-x-6 gap-y-3` | `gap-x-3 md:gap-x-6 gap-y-1.5 md:gap-y-3` |

---

### 8. AI Report — Altura (`src/components/AIReport.tsx`)

| Classe atual | Nova classe |
|---|---|
| `max-h-[85vh]` | `max-h-[70vh] md:max-h-[85vh]` |

---

### 9. PlanetTable — min-height dos Cards (`src/components/PlanetTable.tsx`)

| Classe atual | Nova classe |
|---|---|
| `min-h-[140px]` | `min-h-0 md:min-h-[140px]` |

---

### 10. Traditional Planet Drawer (`src/components/traditional/TraditionalPlanetDrawer.tsx`)

**Problema:** `max-w-lg` (448px) fixo — em telas <480px o drawer fica cortado.

**Solução:**

| Classe atual | Nova classe |
|---|---|
| `max-w-lg` | `max-w-[calc(100vw-16px)] md:max-w-lg` |
| Ajustar posição left | Em mobile, centralizar com `left: 8px` + `right: 8px` |

No useEffect de posicionamento:
```ts
let left = position.x + 40;
// Se for mobile (<768px), forçar centralização com margem
if (window.innerWidth < 768) {
  left = 8; // margem de 8px de cada lado
}
```

---

### 11. Login Page (`src/app/login/page.tsx`)

| Classe atual | Nova classe |
|---|---|
| `p-8` (card) | `p-6 md:p-8` |

---

## ✅ Checklist de Verificação

- [ ] Nenhuma classe CSS desktop foi removida ou alterada
- [ ] Todas as mudanças usam prefixos responsivos (`max-md:`, `md:`, `lg:`, `hidden lg:block`)
- [ ] Sidebar drawer não interfere com layout desktop
- [ ] Touch targets ≥ 44px em mobile
- [ ] Scroll horizontal está funcionando onde necessário (tabelas, grid de aspectos)
- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` sucede sem erros
- [ ] `npm run test` — 100% dos testes existentes continuam passando

---

## 📊 Resumo de Arquivos

| # | Arquivo | Tipo de Mudança | Complexidade |
|---|---|---|---|
| 1 | `src/app/layout.tsx` | Adicionar `viewport` export | 🟢 Baixa |
| 2 | `src/app/page.tsx` | Drawer sidebar + header + paddings | 🔴 Alta |
| 3 | `src/components/AspectsList.tsx` | Layout vertical em mobile | 🟢 Baixa |
| 4 | `src/components/AstroChart.tsx` | Padding responsivo na legenda | 🟢 Baixa |
| 5 | `src/components/AIReport.tsx` | Ajuste de `max-h` | 🟢 Baixa |
| 6 | `src/components/PlanetTable.tsx` | Ajuste de `min-h` | 🟢 Baixa |
| 7 | `src/components/HousesTable.tsx` | Ajuste de `min-h` (se necessário) | 🟢 Baixa |
| 8 | `src/components/traditional/TraditionalPlanetDrawer.tsx` | Largura full em mobile | 🟡 Média |
| 9 | `src/app/login/page.tsx` | Padding responsivo | 🟢 Baixa |

**Legenda:** 🟢 Baixa (1-5 linhas) · 🟡 Média (5-20 linhas) · 🔴 Alta (20+ linhas)

---

## ⚠️ Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Sidebar drawer quebrar em SSR | Usar `useState` + `useEffect` para controlar visibilidade |
| Framer Motion aumentar bundle | Já está instalado e importado em `TraditionalPlanetDrawer` |
| Toque acidental no drawer | Backdrop `onClick` fecha o drawer |
| Teclado virtual em inputs mobile | `maximum-scale=1` no viewport evita zoom |

---

## 🚀 Próximos Passos (após aprovação)

1. Implementar cada alteração na ordem da tabela acima
2. Executar `npm run lint && npm run build && npm run test`
3. Testar manualmente em viewports: 375px, 768px, 1024px, 1440px
4. Ajustar se necessário
