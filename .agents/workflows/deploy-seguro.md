---
description: Esse workflow estabelece um processo rigoroso de validação antes de qualquer envio ao GitHub.
---

# 🚀 Workflow: Deploy Seguro e Validação (AstroMap)

Este workflow garante que nenhuma alteração seja enviada ao repositório sem passar por uma bateria rigorosa de testes, linting e validação de build. Além disso, mantém um histórico de atualizações para rastreabilidade.

---

## 📋 Pré-requisitos

Para o funcionamento correto, o agente deve seguir este protocolo rigorosamente.

## 🔄 Passos do Workflow

### Passo 0: Consulta de Contexto de Atualizações

1. Liste os arquivos na pasta `log/updates/`.
2. Leia o conteúdo do log mais recente (`update_YYYY_MM_DD_HH.md`) para entender quais foram as últimas melhorias ou mudanças estruturais feitas no projeto.

### 1. Preparação e Limpeza

- **Ação**: Garantir que as dependências estão atualizadas e o ambiente limpo.
- **Comando**: `npm install`

### 2. Qualidade de Código (Linting)

- **Ação**: Validar regras de estilo e evitar erros comuns de TypeScript.
- **Comando**: `npm run lint`
- **Falha**: Se falhar, o workflow para. Corrija os avisos antes de prosseguir.

### 3. Testes Unitários e de Integração

- **Ação**: Executar a suíte de testes Vitest.
- **Comando**: `npm run test`
- **Verificação**: 100% de sucesso é obrigatório.

### 4. Validação de Build

- **Ação**: Compilar o projeto Next.js para garantir que não há erros de tipagem ou de renderização estática.
- **Comando**: `npm run build`
- **Nota**: Este passo é crucial para detectar erros que o linting pode não pegar.

### 5. Execução em Desenvolvimento (Opcional - Verificação Humana)

- **Ação**: Se houver mudanças visuais críticas, rodar o servidor e inspecionar.
- **Comando**: `npm run dev` (Aguardar inicialização e validar manualmente).

### 6. Registro de Atualização (Log de Update)

- **Ação**: Criar um registro detalhado das alterações atuais.
- **Local**: `log/updates/`
- **Nomenclatura**: `update_YYYY_MM_DD_HH.md` (Ano_Mês_Dia_Hora).
- **Conteúdo**: Resumo das modificações, arquivos afetados e motivo da mudança.

### 7. Commit e Push

- **Ação**: Só após todos os passos acima (incluindo a criação do log de update) passarem com sucesso.
- **Protocolo**:
  1. `git add .`
  2. `git commit -m "feat/fix: descrição clara seguindo Conventional Commits"`
  3. `git push`

---

## 🛠️ Automação para o Agente (Prompt)

Use este prompt para executar o ciclo completo:

```markdown
"Execute o workflow de Deploy Seguro:
1. Consulte o último log em `log/updates/`.
2. Instale dependências: `npm install`
3. Verifique linting: `npm run lint`
4. Execute testes: `npm run test`
5. Valide o build: `npm run build`
6. Gere o log: `log/updates/update_YYYY_MM_DD_HH.md` com o resumo das mudanças.
7. Se tudo passar, faça o commit com a mensagem '[mensagem]' e o push."
```

---

## ✅ Checklist de Segurança

- [ ] O histórico de updates anterior foi consultado (Passo 0)?
- [ ] Linting passou sem erros?
- [ ] Todos os testes Vitest passaram?
- [ ] `npm run build` completou sem falhas?
- [ ] O arquivo `log/updates/update_YYYY_MM_DD_HH.md` foi criado?
- [ ] Mensagem de commit segue o padrão?

---

### Rodapé Informativo

*Este workflow prioriza a estabilidade do AstroMap acima da velocidade de entrega.*
