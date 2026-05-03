# Revisão Crítica do PRD — Grimório Vivo

Atuando como **Reviewer Crítico**, realizei uma auditoria detalhada no documento `DOCS/PRD-grimorio-vivo.md` cruzando-o com o estado atual do código (`src/lib/traditional/elective.ts` e `magic-correspondences.ts`).

## Resumo da avaliação

O PRD está **muito bem estruturado** em termos de visão de produto e escopo de dados. No entanto, existem **lacunas críticas de lógica técnica** que, se não resolvidas antes da implementação, causarão retrabalho imediato para um "Coder Agent". O maior problema reside na disparidade entre a escala de pontuação desejada pelo produto e a escala técnica atual do motor de eletivas.

**Veredito:** O PRD **NÃO** está pronto para virar plano de implementação imediato. Recomendo resolver os achados Críticos abaixo primeiro.

---

## Achados Críticos (Bloqueantes)

### 1. Desvio de Escala de Pontuação (Ambiguidade Técnica)

* **Problema:** O PRD (Seção 7.3) define o limiar de remédios como `score < 70` (escala 0-100). No entanto, o motor atual em `elective.ts` usa uma escala de pontos tradicional (Lily/Bonatti) onde um valor `>= 7` já é considerado "Propício".
* **Risco:** Se o Coder implementar `score < 70` sem uma função de normalização, o sistema sugerirá remédios para **todos** os cenários (já que a pontuação máxima raramente passa de 30-40 na lógica atual).
* **Proposta de Correção:** Definir explicitamente no PRD se devemos:
    1. Criar uma função `normalizeScore(points: number): number` (ex: `points * 4` ou algo similar para mapear para 0-100).
    2. Ou mudar o limiar do PRD para a escala real do motor (ex: `points < 3`).

### 2. Indefinição do Algoritmo "Anjo do Dia/Hora" (Regra de Negócio Incompleta)

* **Problema:** O PRD solicita a inclusão do "Anjo do Dia/Hora" (Seção 7.4), mas não define qual tradição seguir. Existem pelo menos três formas comuns:
    1. Anjos das 12 Horas Planetárias (ex: Samael, Michael).
    2. Anjos de Shemhamphorash (72 anjos) divididos por quinários (5°) ou períodos de 20 min.
    3. Anjo do Dia da semana (Michael para Domingo, etc.).
* **Risco:** Implementação de uma fonte de dados inconsistente com o módulo de Kabbalah já existente.
* **Proposta de Correção:** Especificar que o Anjo deve ser consultado a partir de uma tabela de lookup baseada na hora planetária calculada (Anjos das Horas) OU na posição zodiacal do Ascendente/Sol (Shemhamphorash).

### 3. Profundidade do Uso de `NatalChart` (Ambiguidade de Escopo)

* **Problema:** O PRD diz que o `NatalChart` deve "enriquecer o contexto", mas não define se isso altera a pontuação técnica ou apenas adiciona texto descritivo.
* **Risco:** Um modelo de IA pode tentar calcular aspectos natais complexos sem ter funções de suporte prontas, gerando alucinações técnicas.
* **Proposta de Correção:** Definir se o MVP apenas passará os dados natais como "Contexto Adicional" para a IA interpretar, ou se o motor de `elective.ts` deve validar conjunções com planetas natais (o que exigiria novos testes de integração).

---

## Achados Importantes (Alto Risco)

### 4. Integração do `@react-pdf/renderer` em Next.js 15+ (Risco Técnico)

* **Problema:** O PRD menciona o uso da biblioteca, mas não cita a necessidade de renderização no lado do cliente (`client-only`) via `dynamic` import.
* **Risco:** Erros de "Document is not defined" durante o build ou execução no servidor (SSR).
* **Proposta de Correção:** Adicionar uma nota técnica nos requisitos não funcionais sobre a necessidade de renderização asíncrona no cliente para o componente `ElectiveGrimoirePDF.tsx`.

### 5. Lógica de Seleção de Remédios (Ambiguidade)

* **Problema:** O PRD diz "exibir card de remédios" se o score for baixo. No entanto, para Saturno (exemplo), o sistema deve sugerir remédios para *fortalecer* Saturno ou para *mitigar* Saturno?
* **Risco:** Exibição de uma lista genérica que pode confundir o usuário (ex: sugerir pedras de Saturno para alguém que já está sofrendo com um Saturno forte e maléfico).
* **Proposta de Correção:** Especificar que os remédios exibidos são para **compensação/fortalecimento do regente da intenção** quando este estiver debilitado.

---

## Achados Opcionais (Melhoria)

### 6. Disclaimer de Segurança (Legal)

* **Problema:** O PRD menciona "sem alegrias médicas", mas não define um texto padrão.
* **Proposta:** Adicionar um campo "Legal Disclaimer" obrigatório no rodapé do PDF e da UI.

### 7. Checklist de Materiais (UI)

* **Problema:** O PRD pede um "checklist de materiais". Seria útil definir se o usuário pode marcar os itens (estado local) ou se é apenas uma lista visual.

---

### Conclusão do Revisor

O PRD tem uma excelente base de dados e visão, mas precisa de "blindagem técnica" nessas 5 áreas antes de ser passado para a codificação.

**Data da Revisão:** 2026-05-03
**Revisor:** Antigravity AI (Reviewer Mode)
