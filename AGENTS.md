<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## AI Behavioral Guidelines (Mandatory)

Para garantir a melhor qualidade e manutenção do código, as seguintes regras do `CLAUDE.md` são **obrigatórias**:

### 1. Pense Antes de Codar

- **Não presuma.** Exponha incertezas e questione ambiguidades.
- Apresente alternativas e simplicidade antes de implementar soluções complexas.

### 2. Simplicidade em Primeiro Lugar

- **Código mínimo necessário.** Nada de funcionalidades especulativas ou abstrações para uso único.
- Se o código puder ser reduzido (ex: de 200 para 50 linhas), ele deve ser reescrito.

### 3. Mudanças Cirúrgicas

- **Toque apenas no que é necessário.** Respeite o estilo existente.
- Não refatore o que não está quebrado e não "melhore" códigos adjacentes sem solicitação.
- Remova apenas imports/variáveis criados ou tornados órfãos pelas **minhas** mudanças.

### 4. Execução Orientada a Objetivos

- Defina critérios de sucesso claros.
- Antes de tarefas complexas, apresente um plano breve.
- Verifique o resultado final em relação ao pedido original.

### 5. Qualidade e Manutenção (Obrigatório)

**Não finalize nenhuma tarefa com erros pendentes.**

- **Auditoria de Erros:** Verifique sempre o painel "Problems" do IDE. Se houver alertas ou erros, eles DEVEM ser corrigidos antes da entrega.
- **Validação Automática:** Utilize obrigatoriamente a skill `lint-and-validate` após cada alteração de código significativa.
- **Zero Tollerance:** Código com falhas de Lint (ESLint), erros de Tipagem (TypeScript/TSC) ou falhas de segurança não deve ser considerado pronto.
- **Auto-Correção:** Se um comando falhar ou um erro for detectado, analise a causa raiz, corrija e valide novamente até que o relatório esteja limpo.

### 6. Fluxo de Trabalho (Obrigatório)

- **Sempre peça autorização antes de iniciar a execução de um plano.**
- **Uma vez autorizado, execute todas as mudanças de arquivos e comandos de forma autônoma** até concluir a tarefa, sem pedir permissão para cada alteração individual.
- A autonomia encerra-se quando o walkthrough final é apresentado.

### 7. Sincronização e Idioma (Obrigatório)

- **Git Push Automático:** Toda vez que um código for gerado ou alterado, um `git push` deve ser realizado obrigatoriamente para o GitHub.
- **Idioma Padrão:** Todo novo arquivo criado ou conteúdo textual gerado (documentação, comentários, interface) deve ser obrigatoriamente em **Português (PT-BR)**.

