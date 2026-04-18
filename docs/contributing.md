# Contribuindo — AstroMap

## Guia de Contribuição

Obrigado pelo seu interesse em contribuir com o AstroMap! Este documento fornece diretrizes para garantir que sua contribuição seja útil e consistente com o projeto.

---

## Como Contribuir

### 1. Reportar Bugs

Antes de criar uma issue, verifique se o problema já foi reportado.

**Boas issues de bug incluem:**

- Descrição clara e reprodução do problema
- Passos para reproduzir
- Comportamento esperado vs. comportamento atual
- Screenshots se aplicável
- Ambiente (navegador, SO, Node version)

**Template:**

```markdown
## Descrição
[Descrição curta do problema]

## Passos para Reproduzir
1. Vá para '...'
2. Clique em '...'
3. Insira '...' como data
4. Veja o erro

## Comportamento Esperado
[O que deveria acontecer]

## Comportamento Atual
[O que acontece atualmente]

## Ambiente
- Navegador:
- OS:
- Node version:
```

### 2. Sugerir Funcionalidades

Issues de feature request são bem-vindas!

**Boas sugestões incluem:**

- Problema que a funcionalidade resolve
- Como você imagina a solução
- Alternativas consideradas
- Referências (artigos, bibliotecas, etc.)

### 3. Pull Requests

#### Fluxo de Trabalho

1. **Fork** o repositório
2. **Clone** seu fork localmente:

```bash
git clone https://github.com/seu-usuario/astro-map-app.git
cd astro-map-app
```

3. **Crie uma branch** para sua feature/fix:

```bash
git checkout -b feature/nova-funcionalidade
# ou
git checkout -b fix/correcao-bug
```

4. **Desenvolva** e faça commits com mensagens descritivas:

```bash
git commit -m "feat: adiciona cálculo de Progressão Secundária"
git commit -m "fix: corrige cálculo de Ascendente para latitudes sul"
git commit -m "docs: adiciona documentação de sistemas de casas"
```

5. **Push** para seu fork:

```bash
git push origin feature/nova-funcionalidade
```

6. Abra um **Pull Request** no GitHub

#### Requisitos para Merge

- [ ] Código passa em `npm run lint`
- [ ] Código passa em `npm run build`
- [ ] Testes novos passam em `npm run test`
- [ ] Documentação atualizada se necessário
- [ ] Descrição clara do PR explicando o que foi mudado e por quê

---

## Convenções de Código

### TypeScript

- Use **tipos explícitos** para funções exportadas
- Prefira **interfaces** sobre types para objetos
- Use **type guards** para narrowing

```typescript
// ✅ Bom
export function getDignity(planet: string, sign: ZodiacSign): string {
  // ...
}

// ❌ Evitar
export function getDignity(planet, sign) {
  // ...
}
```

### Nomenclatura

| Elemento | Convenção | Exemplo |
|----------|-----------|---------|
| Arquivos | kebab-case | `birth-form.tsx` |
| Componentes React | PascalCase | `BirthForm.tsx` |
| Funções/Variáveis | camelCase | `calculateNatalChart` |
| Constantes | UPPER_SNAKE | `MAX_TOKENS` |
| Interfaces | PascalCase | `PlanetPosition` |
| Types/Enums | PascalCase | `ZodiacSign` |

### Imports

```typescript
// ✅ Use absolute imports com @
import { PlanetPosition } from '@/types';
import { calculateNatalChart } from '@/lib/ephemeris';

// ❌ Evite relative deep imports
import { PlanetPosition } from '../../../types';
```

### Componentes React

```typescript
// ✅ Componente com tipagem de props
interface BirthFormProps {
  onSubmit: (data: BirthData) => void;
  initialData?: BirthData;
}

export function BirthForm({ onSubmit, initialData }: BirthFormProps) {
  // ...
}

// ❌ Sem tipagem de props
export function BirthForm({ onSubmit }) {
  // ...
}
```

---

## Estrutura de Commits

Use **Conventional Commits** para mensagens de commit:

```
<tipo>(<escopo>): <descrição>

[corpo opcional]

[rodapé opcional]
```

**Tipos:**

| Tipo | Uso |
|------|-----|
| `feat` | Nova funcionalidade |
| `fix` | Correção de bug |
| `docs` | Mudanças em documentação |
| `style` | Formatação, estilo (sem mudança de lógica) |
| `refactor` | Refatoração de código |
| `test` | Adição ou correção de testes |
| `chore` | Tarefas de manutenção, deps |

**Exemplos:**

```
feat(ephemeris): adiciona cálculo de Koch houses
fix(astrology): corrige determinante para signos sul
docs(api): adiciona referência do endpoint /api/report
refactor(aiPrompts): extrai constantes de configuração
test(geocoding): adiciona testes para timezone brasileiro
```

---

## Testes

### Escrita de Testes

```typescript
// src/__tests__/astrology.test.ts
import { describe, it, expect } from 'vitest';
import { getDignity } from '@/lib/astrology';

describe('getDignity', () => {
  it('deve retornar Domicílio para Sol em Leão', () => {
    expect(getDignity('Sol', 'Leão')).toBe('Domicílio');
  });

  it('deve retornar Exílio para Sol em Aquário', () => {
    expect(getDignity('Sol', 'Aquário')).toBe('Exílio');
  });

  it('deve retornar Peregrino para planeta sem dignidade', () => {
    expect(getDignity('Sol', 'Touro')).toBe('Neutro / Peregrino');
  });
});
```

### Executando Testes

```bash
# Todos os testes
npm run test

# Modo watch
npm run test:watch

# Com coverage
npx vitest run --coverage
```

### Áreas que Precisam de Testes

- [ ] Cálculos de efemérides (valores conhecidos vs. esperados)
- [ ] Funções de astrologia (dignidades, regências)
- [ ] Geocoding (cidades brasileiras específicas)
- [ ] Formatação de prompts para IA
- [ ] Cálculo de Lotes Herméticos

---

## Documentação

### Atualizando Documentação

Se sua contribuição muda:

- **APIs** — atualize `docs/api-reference.md`
- **Arquitetura** — atualize `docs/architecture.md`
- **Features** — atualize `docs/usage.md` ou `docs/extensibility.md`
- **Bugs conhecidos** — atualize `README.md` e `docs/troubleshooting.md`

### Estilo de Documentação

- Use **português brasileiro** para documentação em português
- Use **Markdown** com formatação consistente
- Adicione **diagramas Mermaid** quando ajudarem a compreensão
- Inclua **exemplos de código** quando aplicável

---

## Configuração de Desenvolvimento

### Pré-commit Hooks

O projeto usa ESLint para linting. Configure seu editor para:

1. **Format on save** habilitado
2. **ESLint** como default formatter
3. **TypeScript** language server habilitado

### Extensões Recomendadas (VS Code)

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "bradlc.vscode-tailwindcss",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

---

## Recursos

### Links Úteis

- [Documentação Next.js](https://nextjs.org/docs)
- [Documentação astronomy-engine](https://github.com/cosinekitty/astronomy)
- [Guia TypeScript](https://www.typescriptlang.org/docs/)
- [Conventional Commits](https://www.conventionalcommits.org/)

### Canal de Discussão

Para dúvidas sobre desenvolvimento, abra uma issue com a tag `question`.

---

## Licença

Ao contribuir, você concorda que suas contribuições serão licenciadas sob a **MIT License**.

---

## Checklist Pré-PR

- [ ] `npm run lint` passa sem erros
- [ ] `npm run build` gera build com sucesso
- [ ] `npm run test` passa sem falhas
- [ ] Novos testes foram adicionados
- [ ] Documentação foi atualizada
- [ ] Commit messages seguem Conventional Commits
- [ ] branch está atualizada com `main`