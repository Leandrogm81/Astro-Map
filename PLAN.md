# Plano de Implementação – Lot de Árabe (Hermetic Lots) + Pontos Tradicionais

## 1️⃣  Objetivo geral

Adicionar ao cálculo do mapa natal:

* **7 Hermetic Lots (Arabic Parts)**
  * Fortuna (Part of Fortune) – 🝴
  * Espírito (Lot of Spirit) – ✦
  * Eros – ♥
  * Necessidade – ⚖
  * Coragem – ⚔
  * Vitória – 🏆
  * Nêmesis – ⚡

* **4 pontos clássicos**
  * Senhor da Natividade (Chart Ruler)
  * Almuten Figuris
  * Hyleg
  * Alcocoden

Esses pontos serão calculados a partir do Ascendente, Sol, Lua e demais planetas já existentes e incluídos no objeto `NatalChart`. Será criada uma interface para os pontos tradicionais (armazenando o nome do planeta que é o governante de cada ponto).

---

## 2️⃣  Etapas detalhadas (todo list)

| # | Etapa | Sub‑tarefas | Status |
| :---: | :--- | :--- | :---: |
| **1** | **Pesquisa & documentação** | • Levantar fórmulas dos 7 Hermetic Lots; • Documentar regras de seita e casas; • Anotar links em `implementation_plan.md`. | Concluído |
| **2** | **Extensão dos tipos TypeScript** | • Interface `LotPosition`; • Atualizar `NatalChart`; • Const `HERMETIC_LOTS`; • Remover `partOfFortune` de `PLANETS`. | Concluído |
| **3** | **Cálculo dos Lots (ephemeris.ts)** | • Função `calculateLotLongitude`; • Identificar seita; • Funções para pontos tradicionais; • Inserir no `calculateNatalChart`. | Concluído |
| **4** | **Atualização da UI** | • Componente `LotTable.tsx`; • Inserir `LotTable` no `page.tsx`; • Exibição de Pontos Tradicionais. | Concluído |
| **5** | **Testes unitários** | • Testar cálculos com Vitest. | Em Progresso |
| **6** | **Documentação** | • Atualizar README; • JSDoc nas funções. | Pendente |
| **7** | **Verificação final & CI** | • Rodar Vitest e Lint; • Ajustes finais. | Pendente |
| **8** | **Commit & PR** | • Criar branch; • Push para GitHub. | Em Progresso |

---

## 3️⃣  Breve explicação dos quatro pontos tradicionais

| Ponto | O que é | Como influencia o mapa |
| :--- | :--- | :--- |
| **Senhor da Natividade** (Chart Ruler) | Regente do signo do Ascendente (ex.: Ascendente em Áries → regente = Marte). | Indica a “personalidade exterior”, a maneira como o nativo se apresenta ao mundo e o impulso de vida principal. |
| **Almuten Figuris** | Regente do signo que rege o **Senhor da Natividade** (ou, em algumas tradições, o signo oposto ao Ascendente). | Representa a “force interior” ou “destino” do nativo – energia que sustenta o objetivo de vida. |
| **Hyleg** | “Portador da vida”. Escolhido entre Sol, Lua, Ascendente (e, se necessário, Mercúrio, Vênus, Marte) com a maior dignidade essencial. | Reflete vitalidade, longevidade e ponto de partida de ciclos preditivos. |
| **Alcocoden** | Ponto usado para medir o “diurnal arc” (distância percorrida pelo Sol entre nascer e pôr‑sol). | Serve como referência em técnicas de prognóstico (ex.: “diurnal arc”, casas diurnas). |

---

## 4️⃣  Perguntas antes de iniciar

1. **Qual variante das fórmulas prefere?** Ex.: Paulo Alexandrinus vs. Vettius Valens para os Lots.
2. **Como deseja exibir os Lots na UI?** Dentro do `PlanetTable` ou como um bloco/tabela separado (`LotTable`)?
3. **Símbolos/nomes** – Algum símbolo específico para algum Lot que queira trocar?
4. **Aspectos com os Lots** – Deseja que os Lots participem dos cálculos de aspectos já na primeira entrega ou deixar para iteração futura?  

Aguardo sua confirmação ou ajustes. Quando estiver tudo ok, criarei a branch, iniciarei as mudanças e abrirei o Pull Request.
