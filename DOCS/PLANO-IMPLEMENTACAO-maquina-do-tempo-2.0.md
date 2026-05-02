# Plano de Implementação — Máquina do Tempo 2.0

> Baseado no PRD `DOCS/PRD-maquina-do-tempo-2.0.md`

---

## 1. Premissas

- O componente `TraditionalChart` já existe em `src/components/traditional/TraditionalChart.tsx` e **não será modificado**
- O `TraditionalElectivePanel` já possui estados `targetDateStr`, `targetTimeStr`, `isRealTime`, `isCalculatingSky`, `magicInsight`, `skyChart`
- O modo `sky_plus_natal` já existe no código (seletor na linha ~858, lógica de cruzamento nas linhas 313-333) — **não requer implementação**
- A recalc do `skyChart` já ocorre via `useEffect` quando `targetDateStr`, `targetTimeStr`, `targetLat`, `targetLon` mudam
- O layout usa `grid grid-cols-1 lg:grid-cols-12` com coluna esquerda (`lg:col-span-4`) e direita (`lg:col-span-8`)
- Comandos de validação: `npm run lint`, `npm run build`, `npm run test`

---

## 2. Visão Geral das Sprints

| Sprint | Nome | Objetivo | Complexidade |
|--------|------|----------|--------------|
| Sprint 0 | Preparação e Leitura | Mapear código, entender estados e efeitos | Baixa |
| Sprint 1 | Integração do TraditionalChart | Renderizar mandala na coluna direita | Média |
| Sprint 2 | Botões de Navegação Temporal | Implementar ajustes -1d/-1h/+1h/+1d | Média |
| Sprint 3 | Sincronização e Estados | Overlay, aviso de relatório desatualizado, reset | Média |
| Sprint 4 | Validação e Ajustes Finais | Testes manuais, performance, regressão | Baixa |

---

## 3. Sprint 0 — Preparação e Leitura do Projeto

### Objetivo
Mapear a estrutura existente para evitar quebra de funcionalidades.

### Arquivos a Inspecionar

```
src/components/traditional/TraditionalElectivePanel.tsx   (arquivo principal)
src/components/traditional/TraditionalChart.tsx           (componente a reutilizar)
src/lib/traditional/elective.ts                          (engine de cálculo)
src/lib/traditional/types.ts                             (tipos TypeScript)
```

### Estrutura a Mapear

1. **Estados do Time Machine** (linhas ~128-130):
   - `isRealTime`, `targetDateStr`, `targetTimeStr`
   - Como são inicializados?
   - Quem os modifica hoje?

2. **Efeito de recálculo do skyChart**:
   - Qual `useEffect` observa `targetDateStr`/`targetTimeStr`?
   - Ele já seta `isCalculatingSky` corretamente?

3. **Layout da coluna direita** (linha ~748):
   - Onde exatamente inserir o card do `TraditionalChart`?
   - Deve ficar **acima** do painel "Sintonia Celeste" (linha 751)

4. **Estado `magicInsight`**:
   - Onde é setado? Onde é exibido?
   - Como adicionar um banner condicional?

### Dependências a Verificar

- `TraditionalChart` aceita prop `chart: NatalChart` — `skyChart` é do tipo `NatalChart | null`, então precisa de guarda `skyChart ? <TraditionalChart chart={skyChart} /> : null`

### Comandos Iniciais

```bash
npm run lint          # verificar estado atual do projeto
npm run test          # garantir que testes existentes passam
```

### Riscos

- O arquivo `TraditionalElectivePanel.tsx` tem **1039 linhas** — é grande. Qualquer mudança requer cuidado para não quebrar lógica existente.
- Estados podem estar interligados de formas não óbvias.

### O Que NÃO Deve Ser Alterado Nesta Sprint

- Nenhuma alteração de código ainda. Apenas leitura e mapeamento.

---

## 4. Sprint 1 — Integração do TraditionalChart

### Objetivo
Renderizar o componente `TraditionalChart` na coluna direita do painel, acima da "Sintonia Celeste".

### Arquivos Prováveis

- `src/components/traditional/TraditionalElectivePanel.tsx` (modificar)

### Tarefas em Ordem

1. **Importar `TraditionalChart`** no topo do arquivo
2. **Localizar a coluna direita** no JSX (aprox. linha 748: `lg:col-span-8`)
3. **Inserir card** com `TraditionalChart` como **primeiro filho** da coluna direita, acima do painel "Sintonia Celeste"
4. **Condicionar renderização**: só renderizar quando `skyChart` existir e `!isCalculatingSky`
5. **Aplicar estilos** consistentes com o painel (bg, rounded, border, padding)

### Layout Esperado (aproximação)

```
Coluna Direita (lg:col-span-8)
├── [NOVO] Card: TraditionalChart (skyChart)
├── Painel: Sintonia Celeste (veredito, hora planetária, etc.)
└── Painel: Relatório IA (magicInsight)
```

### Critérios de Aceite

- [ ] A mandala aparece na coluna direita quando `skyChart` está calculado
- [ ] A mandala não aparece enquanto `isCalculatingSky` é true
- [ ] O layout não quebra em desktop (lg) e mobile
- [ ] Estética "Infinity" preservada (bordas, cores, espaçamento)

### Comandos de Validação

```bash
npm run lint
npm run build
npm run test
```

### Testes Necessários

- **Manual**: Acessar módulo de eletiva, verificar se a mandala aparece
- **Manual**: Verificar que a mandala some durante carregamento

### Riscos

- Inserir o card no lugar errado pode quebrar o grid ou empurrar conteúdo
- `TraditionalChart` pode ser pesado — se `skyChart` mudar com frequência, pode causar flicker

### O Que NÃO Deve Ser Alterado

- Não modificar `TraditionalChart.tsx`
- Não alterar a lógica de cálculo do `skyChart`
- Não alterar estados que não sejam necessários para a renderização condicional

---

## 5. Sprint 2 — Botões de Navegação Temporal

### Objetivo
Implementar controles de ajuste rápido (-1d, -1h, +1h, +1d) e a função `adjustTime`.

### Arquivos Prováveis

- `src/components/traditional/TraditionalElectivePanel.tsx` (modificar)

### Tarefas em Ordem

1. **Localizar a seção "Máquina do Tempo"** no JSX da coluna esquerda
2. **Implementar função `adjustTime(amount, unit)`**:
   ```typescript
   // Lógica obrigatória (PRD R7):
   // 1. Criar Date a partir de targetDateStr + targetTimeStr
   // 2. Aplicar ajuste (setHours/setDate)
   // 3. Reformatar para YYYY-MM-DD e HH:MM
   // 4. Setar isRealTime = false
   ```
3. **Adicionar 4 botões** na seção "Máquina do Tempo":
   - `-1d` (unit: 'day', amount: -1)
   - `-1h` (unit: 'hour', amount: -1)
   - `+1h` (unit: 'hour', amount: +1)
   - `+1d` (unit: 'day', amount: +1)
4. **Estilizar botões** com estética Infinity (bordas, cores, hover states)
5. **Garantir que o efeito de recálculo** do `skyChart` dispare após a mudança de estado

### Critérios de Aceite

- [ ] Cada botão ajusta corretamente a data/hora
- [ ] Cruzamento de meia-noite (23:30 + 1h → 00:30 do dia seguinte) funciona
- [ ] Cruzamento de mês/ano (31/01 + 1d → 01/02) funciona
- [ ] `isRealTime` muda para `false` após qualquer clique
- [ ] Os botões estão desabilitados enquanto `isCalculatingSky` é true

### Comandos de Validação

```bash
npm run lint
npm run build
npm run test
```

### Testes Necessários

- **Manual**: Clicar em +1h às 23:30 e verificar se data avança
- **Manual**: Clicar em -1h às 00:30 e verificar se data volta
- **Manual**: Verificar se `isRealTime` muda para false
- **Manual**: Verificar se `skyChart` recalcula automaticamente

### Riscos

- **Virada de dia/mês/ano**: se usar apenas split de string em vez de objeto Date, vai quebrar em bordas (ex: 31/01 + 1d)
- **Loop infinito**: se `adjustTime` for chamado dentro de um efeito que observa as mesmas variáveis

### O Que NÃO Deve Ser Alterado

- Não alterar a lógica de cálculo do `skyChart` (apenas disparar mudança de estado)
- Não adicionar debounce/ throttle extra — o efeito existente já lida com isso
- Não adicionar botões além dos 4 especificados

---

## 6. Sprint 3 — Sincronização, Overlay e Avisos

### Objetivo
Implementar overlay de carregamento, banner de aviso de relatório desatualizado, e botão de reset "Agora".

### Arquivos Prováveis

- `src/components/traditional/TraditionalElectivePanel.tsx` (modificar)

### Tarefas em Ordem

1. **Overlay de carregamento** sobre o `TraditionalChart`:
   - Condicionado a `isCalculatingSky`
   - Usar spinner/loader da estética Infinity
   - Garantir que não bloqueie interação com outros elementos

2. **Banner de aviso de relatório desatualizado**:
   - Exibir condicionalmente quando `magicInsight && !isRealTime`
   - Texto: "Este relatório é referente ao momento anterior. Gere um novo relatório para o momento atual."
   - Estilo: banner amarelo/laranja discreto (não bloqueante)
   - Posicionar acima ou abaixo do relatório existente

3. **Botão de reset "Agora"**:
   - Posicionar próximo aos botões de navegação ou na seção "Máquina do Tempo"
   - Ao clicar: `setIsRealTime(true)`, resetar `targetDateStr`/`targetTimeStr` para data/hora atual
   - O `skyChart` deve recalcular automaticamente para o momento atual

### Critérios de Aceite

- [ ] Overlay aparece sobre a mandala durante `isCalculatingSky`
- [ ] Overlay desaparece após recálculo
- [ ] Banner de aviso aparece quando há `magicInsight` e o tempo foi ajustado manualmente
- [ ] Banner some quando o usuário gera novo relatório
- [ ] Botão "Agora" reativa `isRealTime` e retorna ao momento atual
- [ ] Botão "Agora" está desabilitado quando `isRealTime` já é true

### Comandos de Validação

```bash
npm run lint
npm run build
npm run test
```

### Testes Necessários

- **Manual**: Navegar no tempo, verificar se banner aparece
- **Manual**: Gerar relatório, navegar no tempo, verificar se banner persiste
- **Manual**: Clicar "Agora" e verificar se volta ao tempo real
- **Manual**: Clicar "Agora" quando já está em tempo real — deve estar desabilitado

### Riscos

- **Sincronização do banner**: se `magicInsight` for limpo por outra razão, o banner pode sumir inesperadamente
- **Performance**: overlay condicional pode causar re-renderizações desnecessárias do SVG

### O Que NÃO Deve Ser Alterado

- Não limpar `magicInsight` ao navegar no tempo (diferente da versão anterior do PRD)
- Não alterar a lógica de geração do relatório IA
- Não modificar o `TraditionalChart`

---

## 7. Sprint 4 — Validação e Ajustes Finais

### Objetivo
Garantir qualidade, performance e ausência de regressões.

### Tarefas em Ordem

1. **Executar lint e build**:
   ```bash
   npm run lint
   npm run build
   ```

2. **Executar testes existentes**:
   ```bash
   npm run test
   ```

3. **Teste de fluxo completo (manual)**:
   - Abrir módulo de eletiva
   - Verificar se mandala aparece
   - Clicar +1h, observar atualização
   - Clicar +1d, observar atualização
   - Clicar -1h, observar atualização
   - Clicar -1d, observar atualização
   - Cruzar meia-noite com +1h
   - Verificar banner de aviso quando magicInsight existe
   - Clicar "Agora" para resetar
   - Verificar responsividade em mobile (redimensionar janela)

4. **Verificar performance**:
   - Usar React DevTools Profiler durante navegação temporal
   - Confirmar que renderização do SVG não excede 100ms

5. **Verificar acessibilidade**:
   - Tab navigation nos botões de navegação
   - Labels/aria-labels nos botões

### Critérios de Aceite

- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` passa sem erros
- [ ] `npm run test` passa sem falhas
- [ ] Fluxo manual completo funciona conforme PRD §9
- [ ] Layout responsivo em mobile
- [ ] Nenhuma regressão nas funcionalidades existentes (salvar eletiva, gerar relatório, etc.)

### Riscos

- Testes existentes podem quebrar se houver mudanças inesperadas
- Performance pode degradar em dispositivos lentos

### O Que NÃO Deve Ser Alterado

- Não alterar testes existentes a menos que seja para ajustar selectors
- Não adicionar novas dependências
- Não alterar configurações de build/lint

---

## 8. Ordem de Execução Recomendada

```
Sprint 0 → Sprint 1 → Sprint 2 → Sprint 3 → Sprint 4
   ↓          ↓          ↓          ↓          ↓
Leitura   Render     Botões    Overlay/   Validação
          Mandala    Nav       Aviso/
                               Reset
```

**Por que esta ordem?**
1. **Sprint 0** minimiza risco de quebra ao mapear antes de tocar
2. **Sprint 1** entrega valor visual imediato (mandala visível)
3. **Sprint 2** adiciona interatividade (botões)
4. **Sprint 3** pol UX (overlay, avisos, reset)
5. **Sprint 4** garante qualidade antes de entregar

---

## 9. Checklist de Validação Geral

### Automatizado

```bash
npm run lint          # ESLint strict — zero erros
npm run build         # Next.js build — zero erros
npm run test          # Vitest — todos passam
```

### Manual — Funcional

- [ ] Mandala aparece para momento atual
- [ ] Mandala atualiza ao navegar no tempo
- [ ] Botões -1d, -1h, +1h, +1d funcionam
- [ ] Virada de dia/mês/ano funciona corretamente
- [ ] Botão "Agora" retorna ao momento atual
- [ ] Overlay aparece durante recálculo
- [ ] Banner de aviso aparece quando relatório é desatualizado
- [ ] `isRealTime` muda para false ao navegar
- [ ] `skyChart` recalcula automaticamente

### Manual — Não Funcional

- [ ] Layout responsivo (desktop + mobile)
- [ ] Performance SVG < 100ms por render
- [ ] Acessibilidade: tab navigation funciona
- [ ] Estética Infinity preservada

### Regressão

- [ ] Salvar eletiva funciona
- [ ] Carregar eletiva salva funciona
- [ ] Gerar relatório IA funciona (ambos modos)
- [ ] Seletor de intenções funciona
- [ ] Geocoding funciona
- [ ] Modo sky_plus_natal funciona

---

## 10. Pontos que Exigem Modelo Mais Forte

| Tarefa | Motivo |
|--------|--------|
| **Implementar `adjustTime` com objeto Date** | Requer entendimento de timezone, UTC, e viradas de dia/mês/ano. Bug aqui quebra todo o cálculo astrológico. |
| **Posicionamento do card do TraditionalChart** | Requer entendimento do layout grid existente. Erro pode quebrar responsividade. |
| **Sincronização de estado com efeitos existentes** | Requer leitura cuidadosa dos `useEffect` existentes para evitar loops infinitos ou falta de triggers. |

**Recomendação**: Estas 3 tarefas devem ser executadas por um modelo com boa capacidade de leitura de código e raciocínio de estado React. Tarefas de estilização pura (botões, overlay visual) podem ser delegadas a modelo mais leve.

---

## 11. Arquivos que NÃO Devem Ser Modificados

```
src/components/traditional/TraditionalChart.tsx      (reutilizar sem alterações)
src/lib/traditional/elective.ts                     (engine existente)
src/lib/traditional/types.ts                        (tipos existentes)
src/lib/traditional/scoring.ts                      (lógica de pontuação)
src/lib/traditional/magic-correspondences.ts        (dados de correspondências)
src/lib/ephemeris.ts                                (cálculos astronômicos)
src/app/api/report/route.ts                         (endpoint de IA)
```
