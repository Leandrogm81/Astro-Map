# PRD Consolidado - Módulo de Salmos (AstroMap)

## 1. Resumo executivo

O Módulo de Salmos é uma área independente dentro do ecossistema AstroMap. Ele permite que o usuário descubra, consulte e salve salmos bíblicos a partir de uma necessidade prática, usando busca textual e apoio de IA para traduzir linguagem livre em recomendações úteis.

O módulo também oferece um "Salmo do Dia" baseado no planeta regente do dia da semana, além de favoritos e diário privado para registrar práticas pessoais.

## 2. Objetivo do produto

Prover um catálogo inteligente de salmos para consulta rápida, descoberta diária e registro privado de práticas, com navegação simples e leitura clara, sem depender do mapa natal ou de outros módulos do AstroMap.

## 3. Problema a resolver

Usuários que buscam apoio espiritual, ritualístico ou devocional muitas vezes não sabem qual salmo consultar para uma situação específica. A busca por palavras exatas também falha quando a necessidade é descrita em linguagem emocional ou indireta.

O módulo resolve essa lacuna ao combinar:

- navegação por salmo específico;
- busca por palavras-chave;
- busca inteligente com IA;
- recomendação diária baseada no planeta regente do dia;
- registro privado de favoritos e diário.

## 4. Público-alvo

- Público geral interessado em espiritualidade, oração ou prática ritualística.
- Praticantes que já utilizam salmos em rotinas pessoais e desejam um local centralizado para consulta e anotações privadas.

## 5. Escopo do MVP

- Rota dedicada `/salmos`.
- Página de detalhe de salmo em `/salmos/[number]`.
- Salmo do Dia na home do módulo.
- Busca textual com fallback inteligente via IA.
- Favoritar salmos.
- Diário privado por salmo.
- Acesso aberto ao catálogo.

## 6. Fora de escopo

- Integração com mapa natal, trânsitos ou qualquer outro módulo astrológico do AstroMap.
- Bloqueio de conteúdo por condições astrológicas em tempo real.
- Monetização, paywall ou assinatura.
- Compartilhamento público de diário.
- Upload de imagem ou áudio no diário.
- Qualquer nova categoria de conteúdo que não exista no catálogo de salmos.

## 7. Definições canônicas

### 7.1. Chave pública do salmo

- A navegação pública usa `number` como identificador canônico.
- A rota pública é `/salmos/[number]`.
- `number` deve ser único e variar de 1 a 150.
- `id` continua existindo como UUID interno para relacionamentos e FKs.

### 7.2. Regra de identificação

- Se o usuário abrir `/salmos/23`, o sistema deve tratar isso como o Salmo 23.
- Se a interface precisar referenciar relacionamento interno, deve usar `id` sem expor isso na URL.
- Resultados de busca e links de navegação devem apontar para `number`, não para UUID.

## 8. Modelo de dados

### 8.1. Tabela `salmos`

Campos mínimos:

- `id` UUID, chave primária.
- `number` inteiro, único, obrigatório.
- `title` texto, obrigatório.
- `texto` texto, obrigatório.
- `nome_divino` texto, opcional.
- `nome_divino_hebraico` texto, opcional.
- `planeta` texto, obrigatório.
- `elemento` texto, obrigatório.
- `intencao` texto, obrigatório.
- `tags` array de texto, opcional.

### 8.2. Tabela `salmos_propositos`

- Relaciona um salmo a um ou mais propósitos.
- Campos mínimos: `id`, `salmo_id`, `nome`, `evidencia` opcional.
- Cardinalidade: um salmo pode ter vários propósitos.

### 8.3. Tabela `salmos_elementos`

- Relaciona um salmo aos elementos associados.
- Campos mínimos: `id`, `salmo_id`, `nome`.
- Cardinalidade: um salmo pode ter vários elementos.

### 8.4. Tabela `salmos_fontes`

- Guarda referências bibliográficas ou fontes de curadoria.
- Campos mínimos: `id`, `salmo_id`, `nome_fonte`.
- Cardinalidade: um salmo pode ter várias fontes.

### 8.5. Tabela `salmos_condicoes_astro`

- Guarda condições favoráveis ou observações astrais informativas.
- Campos mínimos: `id`, `salmo_id`, `descricao`.
- Cardinalidade: um salmo pode ter várias condições.

### 8.6. Tabela `user_salmos_favoritos`

- Campos mínimos: `id`, `user_id`, `salmo_id`, `created_at`.
- Regra de unicidade: apenas um favorito por par `user_id + salmo_id`.
- Representa uma relação de toggle, não um histórico.

### 8.7. Tabela `salmos_diario`

- Campos mínimos: `id`, `user_id`, `salmo_id`, `anotacao`, `data_pratica`, `created_at`.
- Cardinalidade: um usuário pode criar várias anotações para o mesmo salmo ao longo do tempo.
- Cada salvamento cria uma linha nova.
- A edição atua sobre a linha escolhida pelo usuário, sem gerar um novo tipo de entidade.
- A lista de anotações deve ser exibida em ordem cronológica decrescente por `created_at`.

## 9. Funcionalidades principais

### 9.1. Salmo do Dia

#### Objetivo

Exibir na home do módulo um salmo destacado para incentivar o uso diário.

#### Regra de negócio

- Segunda-feira: Lua.
- Terça-feira: Marte.
- Quarta-feira: Mercúrio.
- Quinta-feira: Júpiter.
- Sexta-feira: Vênus.
- Sábado: Saturno.
- Domingo: Sol.

#### Seleção

- O sistema deve buscar salmos cujo campo `planeta` corresponda ao regente do dia.
- Se houver mais de um resultado, a ordenação deve ser determinística por `number` crescente.
- O primeiro resultado da ordenação deve ser o card principal.
- Se não houver correspondência, o sistema deve cair para o primeiro salmo disponível no catálogo, também por `number` crescente.

#### Estados

- Loading: mostrar card de carregamento.
- Erro: mostrar mensagem curta e manter a página funcional.
- Ausência de match: usar o fallback definido acima.

#### Critério de aceite

- Ao abrir `/salmos` em uma sexta-feira, o Salmo do Dia deve ser um salmo com `planeta = Vênus`.

### 9.2. Busca textual e inteligente

#### Objetivo

Encontrar salmos adequados mesmo quando o usuário escreve dor, necessidade ou intenção em linguagem livre.

#### Pipeline de busca

1. Normalizar a query com `trim`.
2. Se a query for um número entre 1 e 150, buscar primeiro pelo `number` exato.
3. Buscar localmente no catálogo por correspondência em `tags`, `intencao`, `title` e `salmos_propositos.nome`.
4. Remover duplicados.
5. Ordenar resultados de forma previsível por `number`.
6. Se a busca local não produzir resultado suficiente para a intenção do usuário, acionar a IA como fallback.

#### Contrato da IA

- A IA não decide a navegação final sozinha.
- O modelo deve retornar apenas os `number` dos salmos recomendados.
- Formato de resposta esperado da IA: JSON com a chave `salmo_numbers`.
- Quantidade máxima de recomendações: 3.
- O backend deve validar os números recebidos antes de exibir qualquer resultado.
- IDs duplicados devem ser ignorados.

#### Contrato da rota/ação de IA

Request:

```json
{
  "query": "estou com ansiedade para uma prova",
  "limit": 3
}
```

Response de sucesso:

```json
{
  "salmo_numbers": [119, 134]
}
```

Response de erro:

```json
{
  "message": "Não foi possível consultar a IA neste momento."
}
```

#### Fallback

- Se a IA falhar, estourar timeout ou retornar JSON inválido, a interface deve exibir uma mensagem amigável.
- Quando houver resultados locais, eles devem continuar visíveis mesmo se a IA falhar.
- Se não houver nenhum resultado, exibir estado vazio com sugestão de refinar a busca.

#### Tempo limite

- A chamada à IA deve respeitar timeout máximo de 8 segundos.

#### Critérios de aceite

- Buscar por uma frase emocional ou indireta deve retornar salmos úteis.
- Uma busca por número deve abrir o salmo correto.
- O usuário nunca deve ver exceção crua na interface por falha da IA.

### 9.3. Página de detalhes do salmo

#### Objetivo

Exibir o conteúdo completo do salmo e suas relações de apoio.

#### Regras

- A página deve ser renderizada no servidor.
- O conteúdo principal deve vir da tabela `salmos`.
- As relações com propósitos, elementos, fontes e condições astrais devem ser carregadas junto com o salmo.
- Se o número da rota for inválido, a página deve responder com `404`.

#### Conteúdo mínimo da página

- Número do salmo.
- Título.
- Texto completo.
- Nome divino.
- Nome divino hebraico, quando existir.
- Propósitos.
- Elementos.
- Condições astrais.
- Fontes.

#### Critério de aceite

- A página de detalhes deve renderizar sem quebrar em qualquer salmo válido do catálogo.

### 9.4. Favoritos

#### Objetivo

Permitir que o usuário salve salmos usados com frequência.

#### Regras

- Favoritos são privados por usuário.
- Apenas usuários autenticados podem favoritar ou desfavoritar.
- Usuário anônimo deve ver CTA de login.
- O toggle deve representar o estado real persistido.
- Não pode existir duplicidade de favorito para o mesmo salmo e usuário.

#### Critério de aceite

- Usuário autenticado consegue favoritar e remover favorito no mesmo salmo sem duplicar registros.

### 9.5. Diário de práticas

#### Objetivo

Permitir que o usuário registre observações pessoais ligadas a um salmo específico.

#### Regras

- Diário é privado.
- Apenas usuários autenticados podem criar, editar e visualizar suas notas.
- O usuário pode salvar múltiplas notas para o mesmo salmo.
- Cada nota salva vira uma linha própria em `salmos_diario`.
- A lista deve exibir as notas do usuário em ordem decrescente de criação.
- O conteúdo é texto simples.
- O módulo não inclui imagem, áudio ou compartilhamento.

#### Critério de aceite

- Usuário autenticado salva uma nota, recarrega a página e encontra a nota novamente.
- Usuário autenticado consegue editar uma nota já existente sem perder o vínculo com o salmo.

## 10. Fluxos de usuário

### 10.1. Descoberta diária

1. Usuário acessa `/salmos`.
2. Lê o Salmo do Dia.
3. Abre os detalhes.
4. Marca como favorito, se estiver autenticado.

### 10.2. Busca por necessidade

1. Usuário acessa `/salmos`.
2. Digita uma necessidade em linguagem livre.
3. Recebe resultados locais ou via IA.
4. Abre um salmo recomendado.

### 10.3. Registro de prática

1. Usuário abre o detalhe de um salmo.
2. Escreve uma nota privada.
3. Salva a anotação.
4. Recarrega a página e vê a nota persistida.

## 11. Telas e componentes

### 11.1. Rota `/salmos`

- Barra de busca inteligente.
- Hero card do Salmo do Dia.
- Lista ou grid de salmos recomendados.
- Filtros rápidos por categoria, se houver espaço de interface e sem criar nova regra de negócio.

### 11.2. Rota `/salmos/[number]`

- Cabeçalho do salmo.
- Blocos de metadados.
- Texto completo legível.
- Toggle de favorito.
- Área de diário.
- Histórico das anotações do usuário.

## 12. Regras de negócio

- Leitura do catálogo é pública.
- Favoritos e diário exigem autenticação.
- RLS deve proteger `user_salmos_favoritos` e `salmos_diario` com `user_id = auth.uid()`.
- O frontend não pode ser a única barreira de segurança.
- A interface não deve quebrar se a IA falhar.
- Busca local tem precedência sobre IA.
- O contrato público da navegação é sempre `number`.

## 13. Autenticação e permissões

- Usuário anônimo:
  - pode ler salmos;
  - pode buscar;
  - não pode favoritar;
  - não pode registrar diário.
- Usuário autenticado:
  - pode ler;
  - pode buscar;
  - pode favoritar;
  - pode registrar e editar diário.

### 13.1. UX de bloqueio

- Ao tentar favoritar ou salvar diário sem sessão, mostrar CTA de login.
- A leitura do conteúdo do salmo não deve ser bloqueada.

## 14. Integrações

### 14.1. Supabase

- Persistência do catálogo.
- Relações do salmo.
- Favoritos.
- Diário.
- RLS obrigatório.

### 14.2. OpenRouter

- Usado apenas como fallback de interpretação de intenção.
- Deve operar atrás de rota ou ação server-side.
- Não expor chave no frontend.

## 15. Requisitos não funcionais

### 15.1. Desempenho

- Página de detalhe renderizada no servidor.
- Busca deve responder de forma progressiva e previsível.
- Timeout da IA: 8 segundos.

### 15.2. Segurança

- Não expor credenciais no frontend.
- Validar entrada do usuário.
- Proteger dados privados com RLS.

### 15.3. UX/UI

- Seguir a estética visual do AstroMap.
- Ser mobile-first.
- Leitura deve permanecer confortável.

### 15.4. Manutenibilidade

- TypeScript estrito.
- Lógica de acesso a dados centralizada em server actions ou equivalente server-side.

## 16. Estados obrigatórios da interface

- Loading da busca.
- Loading do Salmo do Dia.
- Estado vazio de busca.
- Erro de IA.
- 404 de salmo inválido.
- CTA de login para ações privadas.

## 17. Critérios de aceite gerais

- O usuário encontra a aba de Salmos na navegação principal.
- `/salmos` carrega sem quebrar.
- O Salmo do Dia respeita o planeta regente do dia.
- A busca por número abre o salmo correto.
- A busca por linguagem livre retorna resultados úteis.
- O detalhe do salmo exibe texto e metadados sem quebrar layout.
- Favoritos funcionam somente com sessão válida.
- Diário salva, recarrega e mantém as notas privadas.
- A IA falha de forma elegante, sem travar a página.
- `npm run lint` e `npm run build` devem passar na entrega da implementação.

## 18. Riscos e mitigação

- Custo da IA.
  - Mitigação: fallback local, timeout curto e limite de resultados.
- Ambiguidade de navegação.
  - Mitigação: usar `number` como chave pública e manter `id` apenas interno.
- Inconsistência do diário.
  - Mitigação: tratar cada salvamento como linha independente e ordenar por criação.
- Falha de segurança em dados privados.
  - Mitigação: RLS em favoritos e diário.

## 19. Métricas de sucesso

- Acesso à aba `/salmos`.
- Cliques no Salmo do Dia.
- Uso da busca inteligente.
- Criação de favoritos.
- Criação de registros no diário.

## 20. Pendências que ainda exigem decisão humana

- Qual rota exata de login/cadastro deve ser usada no CTA de autenticação.
- Os filtros rápidos da home entram no MVP visual ou ficam como evolução posterior.
- O fallback visual do Salmo do Dia deve permanecer como "primeiro resultado por número" ou receber curadoria editorial em uma próxima versão.

## 21. Observações para implementação

- Não criar integração com o mapa natal.
- Não adicionar mídia ao diário.
- Não alterar o contrato público do salmo para UUID.
- Não substituir a busca local por IA; a IA é fallback, não fonte primária.
- Não permitir registros privados sem RLS.
