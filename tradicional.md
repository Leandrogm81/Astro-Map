# Plano de Implementação – Módulo Tradicional do AstroMap

## Visão geral
Este documento descreve o caminho completo para transformar a aba **“Lotes/Tradicional”** em um módulo **Autônomo de Astrologia Tradicional**, paralela ao modo moderno já existente.

## 1. Estrutura de Pastas
```
src/
├─ lib/
│   └─ traditional/
│       ├─ rulers.ts
│       ├─ dignities.ts
│       ├─ sect.ts
│       ├─ lots.ts
│       ├─ receptions.ts
│       ├─ aspects.ts
│       ├─ scoring.ts
│       ├─ synthesis.ts
│       ├─ hyleg.ts
│       ├─ almuten.ts
│       ├─ alcocoden.ts
│       └─ types.ts
├─ components/
│   └─ traditional/
│       ├─ TraditionalChart.tsx
│       ├─ TraditionalSummary.tsx
│       ├─ TraditionalPlanetTable.tsx
│       ├─ TraditionalPlanetDrawer.tsx
│       ├─ TraditionalAspectTable.tsx
│       ├─ TraditionalLotsPanel.tsx
│       ├─ TraditionalRulershipPanel.tsx
│       └─ TraditionalAIReport.tsx
└─ app/
    └─ page.tsx   (renomeia aba)
```

## 2. Etapas de desenvolvimento
1. **Renomear aba** – mudar o label para “Tradicional”.
2. **Criar namespace `src/lib/traditional`** com os arquivos listados.
3. **Implementar lógica base** (regências, dignidades essenciais, sect, lotes Fortuna & Espírito).
4. **Atualizar tipos** (`TraditionalAssessment`, `TraditionalStatus`, campos em `NatalChart`).
5. **Desenvolver UI** usando os componentes dentro de `src/components/traditional`.
6. **Integrar IA tradicional** (prompt separado, componente `TraditionalAIReport`).
7. **Estender exportação PDF** para gerar um documento próprio de astrologia tradicional.
8. **Escrever testes unitários e de integração** cobrindo cálculo, UI e fluxo de PDF.
9. **Documentar** no `README.md` e gerar este `tradicional.md`.
10. **CI & Merge** – garantir que tudo passe nos pipelines antes do PR.

## 3. Prioridades (Fase 1 → Fase 2 → Fase 3)

| Fase | Escopo |
|------|--------|
| **Fase 1 – Núcleo mínimo** | Renomear aba, criar `TraditionalChart`, `TraditionalPlanetTable`, implementar regências, dignidades essenciais, sect, lotes Fortuna/Espírito, resumo técnico simples. |
| **Fase 2 – IA & PDF** | Prompt tradicional, `TraditionalAIReport`, integração completa ao `ExportPDF`, geração de PDF tradicional com todas as seções listadas. |
| **Fase 3 – Profundidade avançada** | Dignidades acidentais completas, faces/decanos, recepção avançada, Hyleg/Almuten/Alcocoden reais, score configurável, tooltips detalhados. |

## 4. Testes críticos
- Mapas diurnos e noturnos (verificação de sect).
- Fortuna diurna vs. noturna (cálculo correto).
- Dignidades (domicílio/exaltação).
- UI: presença da roda tradicional e da tabela planetária.
- PDF: número de páginas ≥ 20, presença das seções principais.

## 5. Notas de Implementação
- Reusar o cálculo de casas (`calculateWholeSignsHouses`) já existente.
- Utilizar a tabela `PLANETS` para regências.
- O código deve permanecer **não‑destrutivo**: nenhuma lógica moderna será alterada; apenas será adicionada a camada paralela.
- Todos os novos arquivos devem exportar explicitamente suas funções e tipos para facilitar testes.

---

**Próximo passo:** *Aguardando sua confirmação para iniciar a implementação conforme o plano acima.*