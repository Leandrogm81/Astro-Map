# Plano de Implementação — Kabbalah Hermética v3.0 (Corrigido)

> **Versão:** 3.0 · **Data:** 2026-05-01 · **Status:** Pronto para execução
> **Baseado em:** PRD v1.0 (`prd_kabbalah_sephirotic.md`) + Auditoria Técnica (`audit_plan_v2.md`)

---

## 1. Premissas

- O Popover será renderizado via **React Portal** (`createPortal`) fora do SVG, no `document.body`.
- O portal só deve montar no client — usar guard `typeof window !== 'undefined'` ou `useEffect` (padrão de `KabbalahPDF.tsx` L148).
- Os datasets `goldenDawn.ts`, `sephiroth.ts`, `shem72.ts` e `types.ts` são fontes de verdade e **NÃO devem ser alterados**.
- Daath mapeia para Plutão; Malkuth mapeia para Ascendente (confirmado em `sephiroth.ts` L163-174).
- Valores `'-'` em `GOLDEN_DAWN_CORRESPONDENCES` devem ser **omitidos** da UI (não renderizar traços).
- `MalkuthMapping` não possui `planetName`, `planetSymbol` nem `retrograde` — usar type narrowing (`'planetName' in mapping`).
- `framer-motion` v12.38.0 já está instalado (`package.json` L20).
- O tema visual é Infinity: dark mode, glassmorphism, gold accents, `rounded-2xl`, `tracking-[0.3em]`.

---

## 2. Visão geral das sprints

| Sprint | Objetivo | Arquivos tocados |
|--------|----------|------------------|
| **0** | Leitura, baseline e verificação | Nenhum (read-only) |
| **1** | Criar `SephirahPopover.tsx` isolado | 1 arquivo novo |
| **2** | Integrar popover no `SephiroticTree.tsx` + atualizar testes | 2 arquivos modificados |
| **3** | Enriquecer `KabbalahPDF.tsx` | 1 arquivo modificado |
| **4** | Acessibilidade, polish e validação final | 1-2 arquivos modificados |
| **5** | Módulo de Pontuação (Lógica) | 1 arquivo novo |
| **6** | Visualização de Poder (Halos e Ranking) | 2-3 arquivos modificados |

---

## 3. Sprint 0 — Preparação e leitura

**Objetivo:** Confirmar que o ambiente está limpo e que o agente compreende a estrutura antes de tocar qualquer arquivo.

### Arquivos a inspecionar (todos em `src/lib/kabbalah/`)

- `types.ts` — Interfaces `SephirothPlanetMapping`, `MalkuthMapping`, `Angel72`, `SephirahDefinition`
- `sephiroth.ts` — `MAPPING_ORDER`, `mapChartToSephiroth()`, `getSephirahDefinition()`
- `goldenDawn.ts` — `GOLDEN_DAWN_CORRESPONDENCES` (verificar campos `'-'` em Daath)
- `constants.ts` — `SEPHIROTH_COORDS`, `SEPHIRAH_RADIUS` (coordenadas SVG do viewBox 400×600)

### Arquivos a inspecionar (em `src/components/kabbalah/`)

- `SephiroticTree.tsx` — Estrutura SVG, eventos atuais, bloco inline L139-151
- `KabbalahPDF.tsx` — Estrutura de estilos e layout do PDF
- `KabbalahView.tsx` — Footer com texto a atualizar (L103-110)

### Teste a inspecionar

- `src/__tests__/kabbalah/ui-interaction.test.tsx` — L230-239 testa o bloco inline que será removido

### Comandos iniciais (confirmar baseline limpo)

```bash
npm run lint
npm run build
npm run test
```

### Critérios de aceite da Sprint 0

- [ ] Todos os 3 comandos passam sem erros
- [ ] O agente entende a diferença entre `SephirothPlanetMapping` e `MalkuthMapping`
- [ ] O agente identificou os campos `'-'` em `GOLDEN_DAWN_CORRESPONDENCES.Daath`

### Riscos

- Se `npm run test` já falha antes de começar, parar e diagnosticar antes de prosseguir.

---

## 4. Sprint 1 — Componente SephirahPopover

**Objetivo:** Criar o componente visual isolado, renderizado via Portal, com sanitização e SSR guard.

### Arquivo a criar

- `src/components/kabbalah/SephirahPopover.tsx` [NEW]

### Props do componente

```typescript
interface SephirahPopoverProps {
  readonly sephirahName: SephirahName;
  readonly mapping: SephirothMapping;
  readonly anchorRect: DOMRect | null;  // Coordenadas de viewport via getBoundingClientRect()
  readonly onClose: () => void;
}
```

### Campos a renderizar (nesta ordem exata)

1. **Cabeçalho:** `definition.name` + `definition.hebrew` + `definition.meaning` — accent color: `definition.color`
2. **Nome Divino:** `goldenDawn.divineName.hebrew` + `goldenDawn.divineName.transliteration` — omitir se `'-'`
3. **Arcanjo:** `goldenDawn.archangel.hebrew` + `goldenDawn.archangel.transliteration` — omitir se `'-'`
4. **Coro Angélico:** `goldenDawn.choir.pt` — omitir se `'-'`
5. **Planeta:** usar type narrowing: `'planetName' in mapping ? mapping.planetName : 'Ascendente'` e `'planetSymbol' in mapping ? mapping.planetSymbol : 'ASC'` — incluir signo, grau, casa
6. **Anjo do Shemhamphorash:** `mapping.angel.name` + `mapping.angel.hebrew` + `mapping.angel.hierarchy`
7. **Versículo do Salmo:** `mapping.angel.psalm` + `mapping.angel.psalmText` — com scroll interno se longo
8. **Virtude / Vício:** `goldenDawn.virtue` + `goldenDawn.vice` — omitir se `'-'`
9. **Experiência Espiritual:** `goldenDawn.spiritualExperience`

### Regras de sanitização

- Se um campo contém `'-'`, **não renderizar** a linha inteira (nem label nem valor).
- Se todas as linhas de uma seção forem omitidas, omitir o heading da seção.
- Usar helper: `const isValid = (value: string) => value !== '-' && value.trim() !== '';`

### SSR Guard (OBRIGATÓRIO)

O portal deve montar apenas no client. Usar `useState` + `useEffect`:

```
const [mounted, setMounted] = useState(false);
useEffect(() => { setMounted(true); }, []);
if (!mounted || !anchorRect) return null;
return createPortal(/* popover */, document.body);
```

### Posicionamento

- Usar `position: fixed` com `top` e `left` calculados a partir de `anchorRect`.
- Posição padrão: à direita do círculo (`left: anchorRect.right + 12`).
- Se ultrapassar viewport à direita: posicionar à esquerda (`right: window.innerWidth - anchorRect.left + 12`).
- Se ultrapassar viewport abaixo: alinhar pela base (`bottom: 12`).
- `max-width: min(90vw, 380px)` e `max-height: 70vh` com `overflow-y: auto`.

### Visual

- Container: `bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl`
- Animação `framer-motion`: `initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}` duração 200ms
- Usar `<AnimatePresence>` para animação de saída
- Botão fechar (X): sempre visível, ícone `X` do `lucide-react`, canto superior direito, `w-6 h-6`
- Accent color da Sephirah: borda superior ou badge colorido

### Fechar popover

- Click no botão X → `onClose()`
- Tecla Escape → `onClose()` (via `useEffect` com `keydown` listener)
- Click fora do popover → `onClose()` (via click listener no `document`, verificar `event.target`)

### Critérios de aceite

- [ ] Componente renderiza os 9 campos com dados reais de qualquer Sephirah
- [ ] Malkuth renderiza "Ascendente" sem crash
- [ ] Daath omite Arcanjo e Coro (campos `'-'`) sem layout quebrado
- [ ] `backdrop-blur` visível sobre fundo escuro
- [ ] Scroll interno funciona em versículos longos
- [ ] `aria-live="polite"` presente no container
- [ ] `npm run lint` passa

### O que NÃO deve ser alterado

- Nenhum arquivo existente nesta sprint

---

## 5. Sprint 2 — Integração e Interatividade

**Objetivo:** Conectar o SVG ao Popover, implementar hover bridge, e atualizar o teste quebrado.

### Arquivos a modificar

- `src/components/kabbalah/SephiroticTree.tsx` [MODIFY]
- `src/__tests__/kabbalah/ui-interaction.test.tsx` [MODIFY]

### Tarefas em ordem

#### T1 — Refs para os círculos SVG

- Criar `const circleRefs = useRef<Map<SephirahName, SVGCircleElement>>(new Map());`
- No render do `<circle>`, adicionar `ref` callback: `ref={(el) => { if (el) circleRefs.current.set(name, el); }}`

#### T2 — Estado de ancoragem

- Adicionar state: `const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);`
- Quando `selectedSephirah` muda, calcular: `setAnchorRect(circleRefs.current.get(name)?.getBoundingClientRect() ?? null);`

#### T3 — Detecção hover vs click

- Criar constante: `const HOVER_DELAY_MS = 150;`
- Criar ref para timeout: `const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout>>();`
- Detectar capacidade: `const supportsHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;`

#### T4 — Eventos nos círculos SVG

- **Se `supportsHover`:**
  - `onMouseEnter`: limpar timeout anterior, setar novo timeout de `HOVER_DELAY_MS` para abrir popover
  - `onMouseLeave`: setar timeout de `HOVER_DELAY_MS` para fechar popover (hover bridge)
- **Senão (touch):**
  - `onClick`: toggle — se já selecionada, fechar; senão, abrir

#### T5 — Hover bridge no popover

- O `SephirahPopover` deve receber `onMouseEnter` e `onMouseLeave` no container root
- `onMouseEnter` do popover: cancela o timeout de fechamento (`clearTimeout(hoverTimeoutRef)`)
- `onMouseLeave` do popover: reinicia o timeout de fechamento
- Isso evita que o popover feche ao mover o mouse do círculo SVG para o popover

#### T6 — Remover bloco inline antigo

- Deletar linhas ~139-151 (o bloco `{selectedMapping && selectedDefinition && (...)}`)
- Importar `SephirahPopover` e renderizá-lo condicionalmente fora do `<svg>`, passando `anchorRect`

#### T7 — Manter eventos de teclado

- Os handlers `onKeyDown` (Enter/Space) nos circles já existem — mantê-los
- O Escape handler já vai estar no `SephirahPopover`

#### T8 — Atualizar teste existente ⚠️

- Em `src/__tests__/kabbalah/ui-interaction.test.tsx`, o teste `'switches between the gematria and tree tabs'` (L213-249):
  - L237: `expect(container.textContent).toContain('Detalhe da Sephirah')` → Substituir por assertion que verifica a presença do popover (ex: verificar se o portal renderizou conteúdo do anjo/sephirah)
  - L239: `expect(container.textContent).toContain('Anjo regente')` → Adaptar à nova estrutura
  - **Nota:** Como o popover usa Portal para `document.body`, as assertions devem buscar em `document.body` ao invés de `container`

### Critérios de aceite

- [ ] Hover em Sephirah (desktop) abre popover após ~150ms
- [ ] Mover mouse do SVG para o popover NÃO fecha o popover (hover bridge)
- [ ] Click em Sephirah (mobile/touch) abre/fecha popover
- [ ] Escape fecha o popover
- [ ] Click fora fecha o popover
- [ ] Apenas 1 popover aberto por vez
- [ ] Grid de cards de resumo abaixo do SVG preservado intacto
- [ ] `npm run lint` passa
- [ ] `npm run test` passa (incluindo o teste atualizado)

### O que NÃO deve ser alterado

- O grid de cards inferiores (L153-191)
- As cores dos círculos SVG (Queen Scale)
- As linhas conectoras (TREE_PATHS)
- O estado vazio (placeholder quando `chart` é null)
- `GematriaCalculator.tsx`, `GematriaResult.tsx`, `KabbalahView.tsx` (exceto o que está na Sprint 4)

---

## 6. Sprint 3 — PDF Enriquecido

**Objetivo:** Adicionar seção de correspondências da Golden Dawn ao PDF exportável.

### Arquivo a modificar

- `src/components/kabbalah/KabbalahPDF.tsx` [MODIFY]

### Tarefas em ordem

#### T1 — Importar dados

- Adicionar: `import { GOLDEN_DAWN_CORRESPONDENCES } from '@/lib/kabbalah/goldenDawn';`
- Adicionar: `import type { SephirahName } from '@/lib/kabbalah/types';`
- Adicionar: `import { getSephirahDefinition } from '@/lib/kabbalah/sephiroth';`

#### T2 — Criar estilos para a seção de detalhes

- Adicionar ao `StyleSheet.create`:
  - `detailCard`: bordas, padding, marginBottom, `minPresenceAhead: 50` (evita corte entre páginas)
  - `detailLabel`: fontSize 8, color cinza
  - `detailValue`: fontSize 9, color escuro, bold

#### T3 — Renderizar seção de correspondências

- Após a tabela de mapeamentos existente (L127-141), adicionar:
  - Título: "Correspondências da Golden Dawn"
  - Para cada mapping no array `mappings`:
    - Buscar `sephirahName` do mapping
    - Buscar `goldenDawn = GOLDEN_DAWN_CORRESPONDENCES[sephirahName]`
    - Renderizar card com: Nome Divino, Arcanjo, Coro, Anjo, Versículo completo, Virtude/Vício
    - Aplicar sanitização de `'-'` (mesma lógica do popover)

#### T4 — Type narrowing para Malkuth

- Usar `'planetName' in mapping ? mapping.planetName : 'Ascendente'` nos textos do PDF
- Mesmo padrão já usado na tabela existente (L137)

### Critérios de aceite

- [ ] PDF gerado contém a tabela resumo original intacta
- [ ] PDF contém nova seção "Correspondências da Golden Dawn" com 11 cards
- [ ] Cada card mostra: Nome Divino, Arcanjo, Coro, Anjo, Versículo, Virtude/Vício
- [ ] Daath omite campos `'-'` sem quebrar layout
- [ ] Caracteres hebraicos renderizam corretamente (fonte `DejaVu Sans`)
- [ ] PDF não quebra cards entre páginas (usar `minPresenceAhead`)
- [ ] Botão "Exportar PDF Kabbalah" continua funcional
- [ ] `npm run lint` passa

### O que NÃO deve ser alterado

- A tabela resumo existente (L128-141)
- O registro de fontes (L9-15)
- A interface e o botão de download (L147-184)

---

## 7. Sprint 4 — Acessibilidade, polish e validação final

**Objetivo:** Verificar acessibilidade, corrigir textos defasados e validar tudo.

### Arquivos a modificar

- `src/components/kabbalah/KabbalahView.tsx` [MODIFY] — atualizar footer

### Tarefas concretas

#### T1 — Atualizar footer do KabbalahView

- Linha 107: substituir o texto "A projeção visual completa da árvore será refinada no próximo sprint. O núcleo atual já entrega dados, tradução e leitura gemátrica prontos para integração." por algo como: "Passe o mouse sobre cada Sephirah para ver as correspondências rituais da Golden Dawn personalizadas pelo seu mapa natal."

#### T2 — Verificação de acessibilidade

- Confirmar `aria-live="polite"` no container do popover
- Confirmar `aria-label` em todos os 11 círculos SVG (já existem)
- Testar navegação: Tab entre círculos → Enter abre popover → Escape fecha
- Confirmar que o botão X do popover é focável e possui `aria-label="Fechar"`

#### T3 — Testes de viewport

- Teste visual 320px width (mobile): popover não ultrapassa tela
- Teste visual 1920px width (desktop): popover posiciona corretamente ao lado
- Teste visual Kether (topo): popover não ultrapassa topo da tela
- Teste visual Malkuth (base): popover não ultrapassa base da tela

#### T4 — Validação final completa

```bash
npm run lint
npm run build
npm run test
```

### Critérios de aceite

- [ ] Todos os 3 comandos passam sem erros
- [ ] Footer atualizado
- [ ] Navegação por teclado funciona no fluxo completo
- [ ] Popover respeita viewport em todos os extremos

---

## 8. Sprint 5 — Módulo de Pontuação (Lógica)

**Objetivo:** Implementar o algoritmo de "Poder Planetário Moderno" (11 planetas + Ascendente).

### Arquivo a criar

- `src/lib/kabbalah/scoring.ts` [NEW]

### Tarefas

#### T1 — Definir Constantes de Pontuação
- `BASE_SCORE = 50`
- `SIGN_DIGNITIES = { DOMICILE: 20, EXALTATION: 15, DETRIMENT: -15, FALL: -20 }`
- `ASPECT_MODIFIERS = { CONJUNCTION: 10, TRINE: 8, SEXTILE: 5, SQUARE: -8, OPPOSITION: -10 }`

#### T2 — Implementar Função `calculatePlanetaryScore`
- Entrada: `planet`, `sign`, `degree`, `aspects`.
- Lógica: Soma base + dignidade + modificadores de aspectos.
- Garantir que o score fique entre 0 e 100 (clamp).

#### T3 — Lógica do Ascendente (Malkuth)
- O Ascendente deve ser tratado como um ponto de pontuação.
- O regente do Ascendente ganha bônus de +10.

#### T4 — Persistência
- Criar hook `useSephirothScores` que calcula e armazena no `localStorage` ou `Zustand`.

### Critérios de Aceite
- [ ] Testes unitários validam cálculos para planetas em domicílio vs exílio.
- [ ] Aspectos alteram o score conforme especificado.
- [ ] Pontuação do Ascendente influencia Malkuth corretamente.

---

## 9. Sprint 6 — Visualização de Poder (Halos e Ranking)

**Objetivo:** Refletir o poder visualmente no SVG e criar o painel de ranking.

### Arquivos a modificar

- `src/components/kabbalah/SephiroticTree.tsx` [MODIFY]
- `src/components/kabbalah/SephirahPopover.tsx` [MODIFY]
- `src/components/kabbalah/ScoringRanking.tsx` [NEW]

### Tarefas

#### T1 — Halos de Energia no SVG
- No `SephiroticTree`, adicionar círculos concêntricos atrás das Sephiroth.
- Usar `stroke-opacity` proporcional ao score.
- Se score > 80, adicionar filtro de `glow` (definir em `<defs>`).
- Se score < 20, usar halo tênue/tracejado.

#### T2 — Destaque "Mais Forte" e "Mais Fraco"
- Identificar dinamicamente as Sephiroth nos extremos.
- Adicionar um elemento visual extra (ex: ícone de coroa ou brilho pulsante) para a mais forte.

#### T3 — Atualizar Popover
- Adicionar barra de progresso (0-100) na seção de detalhes.
- Listar justificativas: "Marte em Áries (+20)", "Trígono com Júpiter (+8)".

#### T4 — Criar Componente Ranking
- Criar `ScoringRanking.tsx` com lista ordenada.
- Incluir toggle para ligar/desligar halos no mapa.

### Critérios de Aceite
- [ ] Árvore exibe intensidades visuais sem mudar a cor original das esferas.
- [ ] Popover detalha o "porquê" da pontuação.
- [ ] Ranking ordena corretamente do maior para o menor.
- [ ] Usuário pode ocultar a visualização de pontuação.

---

## 10. Ordem de execução recomendada

```
Sprint 0 (read-only)
   ↓
Sprint 1 (SephirahPopover.tsx — componente isolado, sem dependência de outros)
   ↓
Sprint 2 (SephiroticTree.tsx + teste — integra Sprint 1, maior risco)
   ↓
Sprint 3 (KabbalahPDF.tsx — independente da Sprint 2, pode ser paralelizada)
   ↓
Sprint 4 (Polish — só após Sprint 2 estar funcional)
```

**Ponto de checkpoint:** Após Sprint 2, rodar `npm run lint && npm run build && npm run test`. Se qualquer um falhar, corrigir antes de prosseguir.

---

## 9. Checklist de validação geral

- [ ] `npm run lint` sem erros
- [ ] `npm run build` sem erros  
- [ ] `npm run test` sem regressões (incluindo teste atualizado)
- [ ] Popover abre em desktop (hover) e mobile (click)
- [ ] Hover bridge funciona (mouse move do SVG para popover não fecha)
- [ ] Escape fecha popover
- [ ] Click fora fecha popover
- [ ] Malkuth renderiza "Ascendente" sem crash
- [ ] Daath omite campos `'-'` sem layout quebrado
- [ ] PDF exporta com correspondências completas
- [ ] Hebraico renderiza corretamente no popover e no PDF
- [ ] Nenhum `any` no TypeScript
- [ ] Nenhuma importação não utilizada
- [ ] Footer do KabbalahView atualizado

---

## 10. O que NÃO deve ser alterado (lista completa)

| Arquivo | Razão |
|---------|-------|
| `src/lib/kabbalah/types.ts` | Interfaces são fonte de verdade |
| `src/lib/kabbalah/sephiroth.ts` | Dados e lógica de mapeamento estáveis |
| `src/lib/kabbalah/goldenDawn.ts` | Dataset da Golden Dawn aprovado |
| `src/lib/kabbalah/shem72.ts` | Dataset dos 72 anjos aprovado |
| `src/lib/kabbalah/constants.ts` | Coordenadas SVG e valores hebraicos |
| `src/lib/kabbalah/gematria.ts` | Lógica de Gematria (outra feature) |
| `src/lib/kabbalah/translateClient.ts` | Cliente de tradução (outra feature) |
| `src/components/kabbalah/GematriaCalculator.tsx` | Componente de outra aba |
| `src/components/kabbalah/GematriaResult.tsx` | Componente de outra aba |

---

## 11. Pontos que exigem modelo mais forte

| Tarefa | Complexidade | Razão |
|--------|-------------|-------|
| Cálculo de ancoragem SVG→viewport | Alta | `getBoundingClientRect()` em SVG com viewBox escalado requer entendimento de como o browser transforma coordenadas |
| Hover bridge (setTimeout + clearTimeout) | Média | Race conditions entre eventos de mouse em elementos disjuntos (SVG circle vs Portal div) |
| Atualização do teste `ui-interaction.test.tsx` | Média | Portal renderiza em `document.body`, não no `container` do render — assertions precisam buscar no lugar certo |
| Layout PDF com `minPresenceAhead` | Média | `@react-pdf/renderer` é sensível a combinações de props de layout |

---

## 12. Correções da Auditoria Incorporadas

| ID | Achado | Correção aplicada |
|----|--------|-------------------|
| C1 | Teste `ui-interaction.test.tsx` vai quebrar | Sprint 2 inclui tarefa T8 explícita |
| C2 | Receita de ancoragem ausente | Sprint 1 especifica `anchorRect: DOMRect`, Sprint 2 detalha `getBoundingClientRect()` + refs |
| C3 | `MalkuthMapping` sem `planetName` | Type narrowing especificado em Sprint 1 (campo 5) e Sprint 3 (T4) |
| I1 | `constants.ts` não inspecionado | Adicionado à Sprint 0 |
| I2 | Sprint 4 vazia | Preenchida com 4 tarefas concretas |
| I3 | SSR guard ausente | SSR guard obrigatório documentado na Sprint 1 |
| I4 | Hover bridge não especificado | Sprint 2, tarefa T5, com padrão setTimeout/clearTimeout |
| I5 | 9 campos não enumerados no plano | Lista completa na Sprint 1 com fontes de dados |
| O1 | Arquivos "não tocar" incompleto | Seção 10 com lista completa |
| O2 | Footer defasado | Sprint 4, tarefa T1 |
| O3 | Debounce de 50ms insuficiente | Atualizado para 150ms como `HOVER_DELAY_MS` |
