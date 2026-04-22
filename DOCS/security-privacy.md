# Segurança e Privacidade — AstroMap

## Visão Geral

O AstroMap foi desenhado com **privacidade do usuário como prioridade**. Entendemos que dados de nascimento são informações pessoais sensíveis, e o aplicativo foi arquitetado para minimizar a exposição desses dados.

---

## Fluxo de Dados

### Sem Configurar API Key no Servidor

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  Browser   │────▶│ OpenRouter │     │  Servidor  │
│ (Frontend) │     │   (IA)     │     │  (Next.js) │
└────────────┘     └────────────┘     └────────────┘
       │                                     │
       │ 1. Envia dados do mapa + API Key    │
       │    diretamente ao OpenRouter        │
       │                                     │
       │ 2. Relatório retorna direto         │
       │    ao browser (sem passar pelo      │
       │    servidor)                        │
       │                                     │
```

**Nota:** Nesse modo, o servidor Next.js **não processa** os dados do mapa. A API Key do cliente é enviada direto ao OpenRouter.

### Com API Key Configurada no Servidor

```
┌────────────┐     ┌────────────┐     ┌────────────┐
│  Browser   │────▶│  Servidor  │────▶│ OpenRouter │
│ (Frontend) │     │  (Next.js) │     │   (IA)     │
└────────────┘     └────────────┘     └────────────┘
                          │
                          │ 1. Envia dados do mapa
                          │    (SEM API Key)
                          │
                          │ 2. Servidor adiciona
                          │    OPENROUTER_API_KEY
                          │    e faz a requisição
                          │
                          │ 3. Relatório retorna
                          │    ao browser
                          │
```

**Nota:** O servidor proxya a requisição, escondendo a API Key. Os dados do mapa passam pelo servidor.

---

## Práticas de Segurança Implementadas

### 1. Separação de Credenciais

- A `OPENROUTER_API_KEY` **nunca** é exposta ao frontend quando configurada no servidor
- Usuários podem optar por inserir sua própria chave, que é usada apenas para a requisição atual e **não é armazenada**

### 2. Arquivo `.env.local` Ignorado

O arquivo `.env.local` está no `.gitignore`, garantindo que:

- Nunca seja commitado acidentalmente
- Não apareça em pull requests
- Permaneça apenas na máquina local/desenvolvimento

### 3. Validação de Entrada

O endpoint `/api/report` valida:

- Presença do objeto `chart` (requerido)
- Presença de `apiKey` (se não houver, tenta usar a do servidor)

### 4. Conexões Seguras

- Todas as comunicações com a OpenRouter usam HTTPS
- Headers incluem `HTTP-Referer` e `X-Title` para identificação do app

### 5. Nenhum Rastro de Dados

- Cálculos são feitos **no cliente** (navegador)
- Mapas salvos ficam no `localStorage` do usuário
- Não há banco de dados externo armazenando mapas
- Não há logs de dados pessoais em produção

---

## O que é Enviado à OpenRouter?

Quando você solicita um relatório, os seguintes dados são enviados:

| Dado | Enviado? | Descrição |
|------|----------|-----------|
| Nome | Sim | Nome fornecido pelo usuário (para personalização) |
| Data de nascimento | Sim | Usada para cálculos astrológicos |
| Hora de nascimento | Sim | Crucial para precisão |
| Local de nascimento | Sim | Cidade/estado + coordenadas geográficas |
| Posições planetárias | Sim | Longitude eclíptica, signo, casa, grau |
| Cúspides | Sim | Ambas系统中Placidus e Whole Signs) |
| Aspectos | Sim | Ângulos entre planetas |
| Lotes Herméticos | Sim | Se configurado |
| API Key | Condicional | Apenas se fornecida pelo cliente |

> **Atenção:** Uma vez enviado à OpenRouter, os dados estão sujeitos à política de privacidade daquela plataforma. Recomendamos revisar os [Termos de Uso da OpenRouter](https://openrouter.ai/terms).

---

## Dados que Permanecem Local

Os seguintes dados **nunca saem do seu navegador**:

- **Configurações de orbs** — salvas no localStorage via Zustand
- **Mapas salvos** —armazenados apenas no localStorage do browser
- **Chave API do servidor** — configurada via `.env.local`, nunca exposta

---

## Riscos e Mitigações

| Risco | Nível | Mitigação |
|-------|-------|-----------|
| Exposição da API Key | Baixo | Uso de variável de ambiente + `.gitignore` |
| Dados pessoais enviados a terceiros | Médio | Transparência total; usuário escolhe quando usar IA |
| Armazenamento no localStorage | Baixo | localStorage é específico do navegador; usuário pode limpar |
| Interceptação de requisições | Baixo | HTTPS obrigatório em todas as comunicações |

---

## Recomendações para Usuários

### 1. Use a chave no servidor quando possível

A configuração via `.env.local` é mais segura que inserir a chave na interface, pois ela nunca passa pelo código do cliente.

### 2. Limpe dados quando necessário

Para limpar todos os dados salvos:

- **Navegador:** Limpe o localStorage do site
- **Mapas salvos:** Acesse a listagem e exclua individualmente

### 3. Não use em navegadores públicos

Evite usar o AstroMap em computadores compartilhados, pois o localStorage persiste entre sessões.

### 4. Monitore uso da API

Acompanhe o consumo de créditos em [openrouter.ai/credits](https://openrouter.ai/credits) para evitar surpresas.

---

## Limitações

- O serviço de geocoding (**Nominatim/OpenStreetMap**) recebe consultas de busca de cidade. Esses dados estão sujeitos à política de privacidade do OpenStreetMap.
- Quando streaming SSE é usado, a conexão permanece aberta por mais tempo, aumentando levemente a janela de exposição potencial.

---

## Contato

Se você identificar qualquer vulnerabilidade ou preocupação de segurança, por favor:

1. **Não** abra uma issue pública
2. Envie um e-mail direto ao mantenedor do projeto
3. Descreva o problema e, se possível, como reproduzi-lo