---
description: Workflow de verificação de domínio para cálculos, convenções astrológicas e outputs canônicos do AstroMap.
---

# Domain Verifier - AstroMap

**Descrição:**  
Use este workflow sempre que uma mudança tocar a lógica astrológica, transformações numéricas de domínio, lotes, aspectos, dados natais, export técnico ou qualquer output canônico cuja precisão semântica seja crítica.

---

## 🎯 Missão

Preservar a integridade do domínio astrológico do AstroMap, evitando regressões semânticas mascaradas por código “tecnicamente válido”.

---

## 🧭 Princípios

- **Código correto não basta; o domínio também precisa estar correto.**
- **Mudança em cálculo exige evidência de domínio, não só build.**
- **Tipos e fórmulas devem respeitar convenções do projeto.**
- **Outputs canônicos não podem derivar para conveniências locais.**
- **Toda mudança de domínio merece cautela extra.**

---

## 📥 Quando Acionar

Acione este workflow quando a mudança tocar:

- cálculos astrológicos
- planetas clássicos
- lotes
- aspectos
- dados natais
- transformações de latitude/longitude e coordenadas
- export/PDF técnico
- qualquer lógica cujo resultado seja interpretado como canônico no app

---

## 📥 Entradas Esperadas

- algoritmo ou função alterada
- tipos afetados
- casos de referência
- fixtures canônicas, se existirem
- resultado esperado
- tolerâncias aceitas
- outputs atuais e outputs propostos

---

## 📤 Saídas Obrigatórias

- risco de domínio
- consistência com convenções do projeto
- casos críticos a verificar
- regressões semânticas encontradas ou descartadas
- validação mínima de domínio

---

## 🛠️ Protocolo de Execução

### Passo 1: Declarar o Alvo de Domínio

Definir claramente o que está sendo alterado:

- cálculo
- transformação
- nomenclatura canônica
- output técnico
- export de dados

---

### Passo 2: Identificar a Convenção do Projeto

Confirmar a convenção vigente:

- lógica dos planetas clássicos
- nomes canônicos
- formatos adotados
- campos compartilhados
- tolerâncias aceitas
- outputs esperados do AstroMap

Se a convenção não estiver clara, registrar a ambiguidade.

---

### Passo 3: Identificar o Risco Semântico

Responder:

- a mudança pode alterar resultado?
- a mudança pode alterar interpretação?
- a mudança pode alterar precisão?
- a mudança pode alterar export canônico?
- a mudança pode quebrar coerência com resultados anteriores?

---

### Passo 4: Verificar Casos Críticos

Sempre que possível, validar com:

- fixtures canônicas
- exemplos históricos confiáveis
- casos limite relevantes
- outputs conhecidos do sistema

Prioridade: verificar comportamento real, não apenas coerência sintática.

---

### Passo 5: Avaliar Blast Radius de Domínio

Checar impacto em:

- componentes consumidores
- export/PDF
- interpretações
- comparação com resultados anteriores
- outros cálculos dependentes

---

### Passo 6: Definir Blindagem

Escolher o mínimo necessário:

- fixture
- teste dirigido
- build
- validação cruzada com output conhecido
- revisão humana quando a semântica for sensível

---

## 🔍 Perguntas Obrigatórias

1. O que mudou no domínio, de fato?
2. A mudança altera resultado, interpretação ou ambos?
3. Existe caso canônico para comparar?
4. O output continua obedecendo à convenção do AstroMap?
5. O build passa, mas o domínio também continua correto?

---

## 🚫 Fronteiras

Este workflow:

- **não desenha UI**
- **não substitui Contract Guardian quando o problema for estrutural de contrato**
- **não promove release**
- **não atualiza MAESTRO por padrão**
- **não cria log por reflexo**

---

## ✅ Checklist Final

- [ ] A área de domínio foi declarada?
- [ ] A convenção do projeto foi identificada?
- [ ] O risco semântico foi avaliado?
- [ ] Casos canônicos foram usados quando possível?
- [ ] A blindagem de domínio foi definida?
- [ ] A mudança continua correta no código e no significado?

---

## 📌 Formato de Saída Recomendado

```markdown
**Domain Verification**
- Área: `cálculo de aspectos`
- Convenção do projeto: planetas clássicos + lógica vigente do AstroMap
- Risco semântico: médio
- Caso canônico usado: [caso]
- Resultado: sem regressão semântica detectada
- Blindagem mínima: fixture + build + validação cruzada do output
```
