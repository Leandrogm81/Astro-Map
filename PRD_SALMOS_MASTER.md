# PRD — Módulo de Salmos (AstroMap)

## 1. Resumo executivo

O Módulo de Salmos é uma nova área dentro do ecossistema AstroMap, desenvolvida como uma ferramenta prática e independente. Ele permite que os usuários realizem buscas ativas por soluções para problemas cotidianos utilizando salmos bíblicos, seja como forma de oração, benzimento ou ritual. A plataforma integrará inteligência artificial para mapear queixas e intenções em linguagem natural aos salmos mais adequados, além de oferecer recomendações diárias baseadas nos regentes planetários do dia.

## 2. Objetivo do produto

Prover aos usuários um catálogo inteligente de salmos e práticas espirituais que conecte de forma rápida e assertiva a "dor" do usuário à "solução" proposta pelo salmo correspondente, encorajando a prática diária através de um diário pessoal e sistema de favoritos.

## 3. Problema a resolver

Pessoas que buscam suporte espiritual ou magístico frequentemente não sabem qual salmo utilizar para uma situação específica. Além disso, a busca por palavras-chave exatas muitas vezes não retorna resultados úteis se o usuário usar termos descritivos de sentimentos (ex: "estou angustiado", "preciso de ajuda financeira"). O produto resolve essa lacuna de "tradução" do problema humano para a solução ritualística utilizando IA.

## 4. Público-alvo e personas

- **Público em geral:** Pessoas comuns interessadas em espiritualidade, orações ou magia prática, sem a necessidade de conhecimento aprofundado em astrologia, cabala ou alta magia.
- **Praticantes espirituais:** Usuários que já realizam simpatias, benzimentos ou rituais e precisam de um local centralizado para consultar salmos e registrar suas experiências privadas.

## 5. Escopo do MVP

- Rota dedicada e independente no frontend (`/salmos`).
- Funcionalidade "Salmo do Dia" com base no planeta regente do dia da semana.
- Busca textual e Inteligente (via IA - OpenRouter) que mapeia textos livres para salmos do catálogo do banco de dados.
- Página de Detalhes do Salmo (apresentação do texto completo, nome divino, elemento e correspondências astrológicas de modo informativo).
- Sistema de "Favoritos" para salvar salmos mais usados.
- "Diário de Práticas" vinculado a cada salmo para o usuário salvar anotações privadas.
- Acesso aberto e gratuito para todos os usuários (sem barreira de monetização para o MVP).

## 6. Fora de escopo

- Integração ou correlação do Módulo de Salmos com o relatório do Mapa Natal ou Trânsitos (melhoria futura V1).
- Validação em tempo real do céu astrológico (ex: bloquear um salmo ou prática se a lua estiver fora de curso).
- Monetização ou paywall específico para este módulo.
- Compartilhamento social de diários ou publicação pública de anotações.

## 7. Funcionalidades principais

### 7.1. Salmo do Dia

- **Nome:** Salmo do Dia
- **Objetivo:** Engajar o usuário diariamente com uma recomendação relevante logo na home do módulo.
- **Comportamento esperado:** Exibir um hero card na página inicial de `/salmos` contendo um salmo selecionado de acordo com o dia da semana planetário.
- **Regras:**
  - Segunda = Lua, Terça = Marte, Quarta = Mercúrio, Quinta = Júpiter, Sexta = Vênus, Sábado = Saturno, Domingo = Sol.
  - A lógica de seleção deve buscar salmos atrelados ao planeta regente do dia atual e selecionar um de forma randômica ou fixa (ciclo semanal).
- **Critérios de aceite:** Ao acessar a página em uma sexta-feira, o sistema deve exibir um salmo cuja propriedade no banco de dados "planeta regente" seja Vênus.

### 7.2. Busca Ativa Inteligente (AI-Powered)

- **Nome:** Busca Inteligente de Salmos
- **Objetivo:** Encontrar salmos adequados mesmo quando o usuário descreve situações complexas ou sentimentos em linguagem livre.
- **Comportamento esperado:** Usuário digita uma queixa. O sistema tenta buscar por tags/palavras-chave no banco de dados. Se a busca for complexa, aciona a IA, que analisa a intenção e retorna os salmos mais indicados.
- **Regras:**
  - Utilizar o endpoint do OpenRouter para interpretar a intenção.
  - O prompt da IA deve instruir o LLM a retornar apenas os IDs dos salmos que se enquadram na solução.
- **Critérios de aceite:** Buscar por "estou com ansiedade para uma prova" deve retornar salmos de paz mental e sucesso intelectual (ex: Salmo 134, Salmo 119), mesmo que a palavra "prova" não exista no texto do banco.

### 7.3. Página de Detalhes do Salmo

- **Nome:** Detalhes do Salmo
- **Objetivo:** Apresentar o conteúdo do salmo, suas propriedades e instruções mágicas.
- **Comportamento esperado:** Exibir texto completo do salmo, nome divino associado, elemento e atributos astrológicos informativos.
- **Regras:** Dados resgatados diretamente da tabela `salmos` no Supabase via server component.
- **Critérios de aceite:** Propriedades como número, texto, elemento, planeta e intenção devem ser renderizadas com clareza sem quebrar o layout.

### 7.4. Favoritos e Diário de Práticas

- **Nome:** Persistência de Práticas (Favoritos e Diário)
- **Objetivo:** Reter o usuário permitindo customização, acompanhamento de eficácia e jornada espiritual.
- **Comportamento esperado:** Botão toggle de favoritar (coração) no salmo e um campo textarea abaixo do salmo para adicionar registros de prática.
- **Regras:**
  - O usuário precisa estar autenticado para favoritar ou salvar diários. Se não estiver, a interface deve exibir CTA de login.
  - O diário é 100% privado (garantido via RLS no Supabase).
- **Critérios de aceite:** O usuário logado consegue marcar e desmarcar favorito. Consegue escrever, salvar e editar notas do diário atreladas àquele salmo e visualizá-las no próximo acesso.

## 8. Funcionalidades secundárias

- Filtros rápidos na home por categorias (Proteção, Prosperidade, Saúde, Amor, Justiça).
- Lista rápida com o "Histórico do Diário" contendo todas as notas cronológicas do usuário.

## 9. Fluxos de usuário

1. **Fluxo de Descoberta Diária:** Usuário acessa `/salmos` > Lê o "Salmo do Dia" > Clica para ver detalhes > Marca como favorito.
2. **Fluxo de Dor/Solução:** Usuário acessa `/salmos` > Utiliza a barra de busca digitando "Quero proteger minha casa de energias ruins" > Recebe 3 recomendações > Escolhe uma > Acessa detalhes.
3. **Fluxo de Acompanhamento (Diário):** Usuário realiza a oração de um salmo > Acessa a página do salmo > Digita no diário "Acendi vela e fiz a oração, me senti mais calmo" > Clica em "Salvar Anotação".

## 10. Telas e componentes

- **Rota Principal (`/salmos`):**
  - Componente: *Barra de Busca Inteligente* (Input grande, chamativo).
  - Componente: *Hero Card Salmo do Dia* (Destaque visual).
  - Componente: *Grid/Carrossel* de Categorias ou Últimos Acessados.
- **Rota Interna (`/salmos/[id]`):**
  - Componente: *Cabeçalho do Salmo* (Título, número e intenção principal).
  - Componente: *Pills Metadados* (Planeta, Elemento, Nome Divino).
  - Componente: *Corpo do Texto* (Texto do salmo legível com espaçamento apropriado).
  - Componente: *Floating Action / Botões* (Favoritar).
  - Componente: *Área de Prática/Diário* (Formulário e lista de anotações antigas).

## 11. Dados e entidades

Entidades mapeadas para o banco de dados Supabase:

- **`salmos`:** id (uuid), numero (int), texto (text), nome_divino (varchar), planeta (varchar), elemento (varchar), intencao (varchar), tags (text[]).
- **`user_salmos_favoritos`:** id (uuid), user_id (uuid, FK), salmo_id (uuid, FK), created_at (timestamp).
- **`salmos_diario`:** id (uuid), user_id (uuid, FK), salmo_id (uuid, FK), anotacao (text), data_pratica (timestamp), created_at (timestamp).

## 12. Regras de negócio

- Se a IA do OpenRouter falhar ou atingir timeout, a interface deve exibir uma mensagem amigável de erro sem gerar exceções visíveis que quebrem a aplicação ("Não conseguimos analisar sua queixa com IA no momento. Tente usar palavras-chave mais simples.").
- A restrição de visualização das anotações não depende do frontend, deve ser aplicada via políticas RLS (`user_id = auth.uid()`).
- O botão de diário/favoritos só é renderizado/ativo quando há sessão do usuário (`session != null`).

## 13. Permissões e papéis de usuário

- **Usuários Anônimos:** Têm acesso total ao catálogo de salmos e podem realizar buscas inteligentes. Ao tentar usar o diário ou favoritar, recebem redirecionamento para a página de Login/Cadastro.
- **Usuários Autenticados:** Acesso total a favoritar salmos e registrar no diário. Acesso não é influenciado por status de assinatura/plano premium nesta fase do MVP.

## 14. Integrações

- **Banco de Dados (Supabase):** PostgreSQL para persistência e armazenamento das tabelas com RLS via Autenticação do Supabase.
- **API Inteligência Artificial (OpenRouter / LLM):** Integração com endpoint LLM (`/api/salmos/ai-search`) para traduzir intenções do usuário em consultas de mapeamento (retornando arrays de IDs de salmos recomendados).

## 15. Requisitos não funcionais

- **Desempenho:**
  - Server-side rendering (SSR) nas páginas de leitura dos salmos para otimização de SEO e velocidade.
  - A requisição para IA (OpenRouter) deve possuir timeout máximo de 8 segundos.
- **Design UI/UX:**
  - Seguir estritamente a "Estética Infinity" do projeto AstroMap (Glassmorphism avançado, fundos escuros cósmicos, blur em modais e transições fluídas).
- **Manutenibilidade:** Código tipado (TypeScript), com lógica do Supabase isolada em Server Actions (`src/app/actions`).
- **Responsividade:** Interfaces 100% Mobile-first, garantindo que a leitura seja confortável e imersiva.

## 16. Critérios de aceite gerais

- O usuário encontra a aba de Salmos no menu principal de navegação.
- A página principal não quebra e lista corretamente o Salmo do Dia correspondente à regra do planeta regente atual.
- A ferramenta de busca, após receber input de texto livre e ser submetida, direciona o usuário a uma lista de salmos recomendados.
- Usuário logado escreve uma nota no campo de diário, salva, recarrega a página e a anotação continua lá.
- Logs e lints do projeto não exibem erros graves (`npm run lint` e `npm run build` bem-sucedidos).

## 17. Riscos e mitigação

- **Risco Técnico:** Custos da API OpenRouter subindo vertiginosamente se a busca ficar popular.
  - *Mitigação:* Usar caching nativo do Next.js para queries da busca Inteligente. Usar um rate-limiting na rota do servidor (`/api/...`) com verificação do IP ou User.
- **Risco de Produto:** Falta de aderência do usuário à ideia de anotar rituais/diários em um aplicativo astrológico.
  - *Mitigação:* Focar no UX do componente; não obrigar a digitação, torná-lo um recurso sutil, quase um plus para quem deseja.

## 18. Métricas de sucesso

- **T1 (Adoção):** Percentual de DAUs (Daily Active Users) do AstroMap que interagem (buscam ou clicam) na aba `/salmos`.
- **T2 (Engajamento):** Total de registros criados nas tabelas `user_salmos_favoritos` e `salmos_diario` no primeiro mês pós-release.
- **T3 (Eficácia da Busca):** Taxa de cliques em pelo menos um salmo recomendado após uma busca inteligente via IA.

## 19. Pontos de decisão pendentes

- Como o sistema se comportará exatamente quando a requisição ao OpenRouter demorar muito? Vamos implementar um modal com estado "Consultando as estrelas..."?
- Os registros do diário poderão receber upload de imagens ou registro de áudio no futuro, ou manteremos apenas texto simples? (Por enquanto, texto simples).
- Será necessário ter categorias visuais (tags renderizadas no formato de botões filter) na tela home?

## 20. Resumo para o agente de implementação

**Instruções Diretas ao Coder:**

1. Crie tabelas `salmos_diario` e `user_salmos_favoritos` no Supabase, adicionando RLS obrigatório focado em `user_id = auth.uid()`.
2. Implemente Server Actions para CRUD em `src/app/actions/salmos.ts`.
3. Desenvolva o componente `DiarioPraticas.tsx` na rota dinâmica `[id]/page.tsx` para exibição e salvamento da prática.
4. Adicione componente visual de Toggle Favorito.
5. Em `BuscaSalmos.tsx`, aprimore a rota de backend para que, caso a busca no Supabase não retorne um exact match, dispare prompt para API LLM pedindo para retornar IDs de salmos que resolvam a queixa. Use timeout de segurança.
6. Não adicione integrações ou lógicas que não foram pedidas (mantenha tudo focado nas tabelas de Salmos e UI). Sempre valide os lints e builds antes de finalizar.

---

## Checklist de qualidade do PRD

- [x] Escopo claro;
- [x] Regras claras;
- [x] Critérios de aceite claros;
- [x] Telas definidas;
- [x] Dados definidos;
- [x] Riscos mapeados;
- [x] Fora de escopo definido;
- [x] Pronto para virar plano de implementação.
