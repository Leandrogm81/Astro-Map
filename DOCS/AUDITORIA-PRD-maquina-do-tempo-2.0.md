# Revisão Crítica do PRD — Máquina do Tempo 2.0

Realizei uma auditoria técnica e de UX no PRD da "Máquina do Tempo 2.0" para o módulo de Eletiva. Abaixo estão os pontos de atenção identificados que podem levar a erros de implementação ou retrabalho.

## Achados da Auditoria

### 1. Ambiguidade Crítica no Layout (Seções 10 e 20)

* **Classificação:** `CRÍTICO`
* **Problema:** A Seção 10 lista o layout do gráfico como um "Ponto de decisão pendente" (Coluna vs Modal), enquanto a Seção 20 instrui o desenvolvedor a "Inserir card com TraditionalChart na coluna da direita". Isso causará confusão no agente de código, que pode optar por não implementar ou implementar de forma inconsistente.
* **Correção Proposta:** Remover a menção de "pendente". Confirmar que o layout padrão será a **Coluna da Direita** (acima da Síntese Astrológica) e atualizar ambas as seções.

### 2. Lógica de Virada de Dia no Ajuste de Hora (Seções 7.2 e 12)

* **Classificação:** `IMPORTANTE`
* **Problema:** O PRD não especifica que a função `adjustTime` deve gerenciar a virada de data. Se o usuário estiver às 23:30 e clicar em `+1h`, a hora mudará para `00:30`, mas se a `targetDateStr` não for incrementada, o cálculo astrológico será de 23 horas no passado.
* **Correção Proposta:** Explicar explicitamente que a lógica deve:
    1. Converter as strings `targetDateStr` + `targetTimeStr` em um objeto `Date` único.
    2. Aplicar o ajuste temporal (`amount`, `unit`).
    3. Formatar os novos valores separadamente para as strings de estado (YYYY-MM-DD e HH:MM).

### 3. Inconsistência do Relatório IA (Seção 7.3)

* **Classificação:** `IMPORTANTE`
* **Problema:** O PRD não diz o que fazer com o relatório já gerado (`magicInsight`) ao navegar no tempo. Se o usuário mudar o horário e o gráfico atualizar, mas o texto do "Conselho do Mestre" permanecer o do horário anterior, haverá uma inconsistência grave de informação.
* **Correção Proposta:** Adicionar uma regra: "Qualquer ajuste manual de tempo via botões de navegação deve limpar o estado `magicInsight` (definir como `null`), invalidando o relatório anterior."

### 4. Botão de Reset (Voltar para Agora)

* **Classificação:** `IMPORTANTE`
* **Problema:** O botão de reset está marcado como funcionalidade secundária (Seção 8). Sem ele, se o usuário navegar para 3 dias no futuro, ele fica "preso" e precisa atualizar a página ou digitar manualmente para voltar ao tempo real. Isso é essencial para a usabilidade.
* **Correção Proposta:** Mover o botão de "Reset / Sincronizar Agora" para o **Escopo do MVP (Seção 5)**.

### 5. Estado do Overlay de Carregamento (Seção 12)

* **Classificação:** `IMPORTANTE`
* **Problema:** O PRD pede um overlay, mas não indica qual variável de estado controla isso. O componente já possui `isCalculatingSky`.
* **Correção Proposta:** Especificar que o overlay deve ser condicionado à variável `isCalculatingSky` já existente no `TraditionalElectivePanel`.

### 6. Responsividade do Gráfico no Mobile (Seção 15)

* **Classificação:** `OPCIONAL`
* **Problema:** O PRD sugere "scroll horizontal" para o gráfico no mobile. Como o gráfico é circular (SVG), o scroll horizontal pode ser uma experiência ruim.
* **Correção Proposta:** Sugerir o uso de `aspect-ratio` ou redimensionamento dinâmico para garantir que o círculo caiba na largura da tela mobile, mantendo o scroll apenas vertical para o painel como um todo.

---

## Veredito Final

O PRD **NÃO está pronto** para virar um plano de implementação imediato.

**Motivo:** A ambiguidade do layout e a falta de clareza na lógica de virada de data/hora podem gerar bugs críticos nos cálculos astrológicos e na interface.

**Recomendação:** Ajustar os pontos acima (especialmente 1, 2 e 3) e republicar o PRD para aprovação final.
