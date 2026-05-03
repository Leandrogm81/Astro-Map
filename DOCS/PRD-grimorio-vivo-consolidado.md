# PRD Consolidado — Grimório Vivo (Módulo AstroMap)

## 1. Resumo Executivo

O **Grimório Vivo** é a evolução do módulo de Eletiva Mágica do AstroMap. Ele transforma o veredito técnico atual em um **Protocolo Ritualístico Prático**, integrando astrologia tradicional, correspondências herméticas, cabala, hierarquias angélicas e exportação documental em PDF com estética de grimório antigo.

O foco é a transição da leitura técnica do céu para um guia operacional "passo-a-passo" que orienta o usuário sobre o que invocar, quais materiais usar e como compensar debilidades planetárias via remédios astrológicos.

---

## 2. Objetivo do Produto

Expandir o módulo de eletivas para uma ferramenta de operações mágicas guiadas, mantendo a precisão técnica e adicionando uma camada ritualística rica e exportável.

### Principais Entregas

- **Veredito Ritualístico:** Integração de `NatalChart` (opcional) e `SkyData`.
- **Correspondências Herméticas:** Lookup automático de Espíritos Olímpicos, Sephiroth, Anjos e Hinos Órficos.
- **Remédios Astrológicos:** Prescrição de pedras, plantas e banhos para compensar debilidades (Scores baixos).
- **Protocolo Ritual via IA:** Geração de guia estruturado em 5 blocos (Veredito, Preparação, Invocação, Ação, Finalização).
- **Exportação PDF Premium:** Documento estilizado como grimório antigo para uso prático.

---

## 3. Escopo e Limites (MVP)

### Inclui

1. **Motor de Eletiva 2.0:** Suporte opcional a `NatalChart` para contexto descritivo.
2. **Camada de Dados:** Uso integral de `src/lib/traditional/magic-correspondences.ts`.
3. **Remédios:** Lógica de exibição baseada em score (Threshold: Score < 70 normalizado ou Pontos < 3 tradicional).
4. **Prompts de IA:** Atualização do prompt `ELECTIVE_MAGIC` para output estruturado (JSON ou Markdown rígido).
5. **Interface:** Atualização do `TraditionalElectivePanel.tsx` com novos cards e checklist.
6. **PDF:** Implementação de `ElectiveGrimoirePDF.tsx` usando `@react-pdf/renderer`.

### Fora de Escopo

- Redesenho total da UI Infinity (apenas expansão).
- Marketplace ou links externos para compra de materiais.
- Agenda/Calendário ritual automático.
- Banco de dados persistente para protocolos (exportação é a persistência).

---

## 4. Definições Técnicas e Regras de Negócio

### 4.1 Normalização de Score (Correção Crítica)

O motor atual (`elective.ts`) utiliza a escala Lily/Bonatti (valores típicos entre -20 e +20). O sistema deve:

- **Internamente:** Manter a pontuação tradicional para precisão.
- **UI/IA:** Normalizar para escala 0-100 para facilitar a compreensão do usuário.
- **Lógica de Remédios:** O card de remédios deve aparecer quando o **Score Normalizado for < 70** (equivalente a aprox. **< 3 pontos** na escala tradicional).

### 4.2 Hierarquia Angélica e lookup (Correção Crítica)

Para evitar ambiguidades, o sistema seguirá esta regra:

1. **Anjo Planetário:** Lookup direto via `PLANETARY_CORRESPONDENCES` (ex: Michael para Sol).
2. **Anjo da Hora:** Identificado pelo planeta regente da Hora Planetária calculada.
3. **Integração Kabbalah:** Exibir a **Sephirah** correspondente ao planeta regente da intenção (ex: Jupiter -> Chesed).

### 4.3 Uso do Mapa Natal (Ambuidade de Escopo)

O `NatalChart` é **opcional**.

- **Se fornecido:** O sistema envia as posições natais para a IA como "Contexto Adicional" para que o protocolo mencione ressonâncias pessoais (ex: "Como seu Júpiter natal está em Câncer...").
- **Lógica Técnica:** O motor de eletiva NÃO deve alterar a pontuação técnica baseada no mapa natal no MVP (evitar alucinações e complexidade excessiva de aspectos).

### 4.4 Remédios Astrológicos (Ambiguidade)

- **Finalidade:** Os remédios sugeridos (pedras, plantas, banhos) são para **fortalecer/compensar o planeta regente da intenção** quando este estiver em condição desafiadora.
- **Segurança:** Exibir obrigatoriamente o disclaimer: *"Estas recomendações são de caráter simbólico e tradicional. Não substituem aconselhamento médico ou terapêutico profissional."*

---

## 5. Funcionalidades Principais

### 5.1 Protocolo Ritualístico (IA)

O prompt `ELECTIVE_MAGIC` deve ser instruído a gerar obrigatoriamente 5 blocos:

1. **Veredito Técnico:** Resumo das dignidades e seita.
2. **Preparação:** Materiais, cores e remédios (se score baixo).
3. **Invocação:** Nomes sagrados, Anjos e Hinos Orficos.
4. **Ação Mágica:** Passos práticos sugeridos.
5. **Finalização:** Licença para partir e caridade planetária.

### 5.2 Painel UI (Checklist e Correspondências)

- **Códice Hermético:** Agora inclui um checklist interativo (estado local) para o usuário marcar os materiais (Cores, Metais, Incensos) antes de começar.
- **Card de Remédios:** Visível apenas se `score < threshold`.

### 5.3 Exportação PDF

- **Tecnologia:** `@react-pdf/renderer` com renderização asíncrona no cliente (`dynamic` import em Next.js).
- **Estética:** Fontes serifadas elegantes, bordas sutis, tons creme/papel antigo, preservando a legibilidade premium.

---

## 6. Critérios de Aceite (Fortalecidos)

1. **Consistência de Dados:** O sistema não "inventa" anjos ou remédios; usa estritamente `magic-correspondences.ts`.
2. **Fallback:** Se um dado (ex: Espírito Olímpico) estiver ausente na base, a UI/PDF deve omitir o campo ou mostrar "N/A" graciosamente, sem erros de runtime.
3. **Score:** O threshold de remédios deve disparar corretamente conforme a lógica de normalização definida na seção 4.1.
4. **Segurança de Chaves:** Nenhuma API Key do OpenRouter ou similar deve vazar para o cliente.
5. **Build:** O projeto deve passar em `lint`, `test` e `build` com o novo componente PDF.

---

## 7. Riscos e Mitigações

| Risco | Mitigação |
| :--- | :--- |
| **PDF SSR Error** | Utilizar `dynamic(() => import(...), { ssr: false })` para o componente de PDF. |
| **IA Alucinar Dados** | Reforçar no System Prompt: "Use apenas as correspondências fornecidas no contexto JSON". |
| **Remédios Confusos** | Texto explícito indicando que a sugestão é para fortalecimento do regente. |

---

## 8. Pontos de Decisão Pendentes (Humano)

1. **Nome Público:** Confirmar se o selo na interface será "Grimório Vivo" ou manter "Eletiva Mágica".
2. **Checklist Persistente:** O checklist de materiais deve ser salvo no navegador (localStorage) ou pode ser resetado ao fechar a aba? (Recomendado: Reset/Local State para MVP).
3. **Profundidade do PDF:** No MVP, o PDF terá 1 página (estilo folha de grimório) ou múltiplas páginas? (Recomendado: 1 página bem diagramada).

---
*Versão 1.1 — Consolidada e Revisada por Antigravity AI*
