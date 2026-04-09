import { NextRequest, NextResponse } from 'next/server';
import { NatalChart, AIReport } from '@/types';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// Modelos disponíveis com custos reais
export const AVAILABLE_MODELS = [
  { id: 'openai/gpt-oss-120b', name: 'GPT-OSS 120B', description: 'Open source da OpenAI (131K context)', cost: '~$0.63/relatório' },
  { id: 'deepseek/deepseek-v3.2', name: 'DeepSeek V3.2', description: 'Excelente em PT-BR (164K context)', cost: '~$1.53/relatório' },
  { id: 'x-ai/grok-4.1-fast', name: 'Grok 4.1 Fast', description: 'Rápido da xAI (2M context)', cost: '~$1.80/relatório' },
  { id: 'google/gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite', description: 'Econômico do Google (1M context)', cost: '~$1.35/relatório' },
  { id: 'xiaomi/mimo-v2-flash', name: 'MiMo V2 Flash', description: 'Modelo rápido da Xiaomi (262K context)', cost: '~$1.00/relatório' },
  { id: 'meta-llama/llama-3.1-8b-instruct', name: 'Llama 3.1 8B', description: 'Open source da Meta (16K context)', cost: '~$0.18/relatório' },
  { id: 'nvidia/nemotron-3-super-120b-a12b:free', name: 'Nemotron 3 Super', description: 'Modelo NVIDIA (256K context)', cost: '~$0.53/relatório' },
  { id: 'qwen/qwen3.5-flash-02-23', name: 'Qwen 3.5 Flash', description: 'Modelo Qwen (1M context)', cost: '~$0.88/relatório' },
  { id: 'qwen/qwen3-235b-a22b-2507', name: 'Qwen 3 235B', description: 'Modelo grande Qwen (262K context)', cost: '~$0.41/relatório' },
  { id: 'google/gemma-4-26b-a4b-it:free', name: 'Gemma 4 26B', description: 'Modelo gratuito do Google (262K context)', cost: 'Grátis' },
  { id: 'arcee-ai/trinity-large-preview:free', name: 'Arcee Trinity', description: 'Modelo gratuito (131K context)', cost: 'Grátis' },
  { id: 'z-ai/glm-4.5-air:free', name: 'GLM 4.5 Air', description: 'Modelo gratuito Z-AI (131K context)', cost: 'Grátis' },
];

interface OpenRouterMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export async function POST(request: NextRequest) {
  try {
    const { chart, model = 'google/gemini-2.5-flash', apiKey: clientApiKey, solarRevolution, solarYear } = await request.json();

    if (!chart) {
      return NextResponse.json(
        { error: 'Dados do mapa astral não fornecidos' },
        { status: 400 }
      );
    }

    // Usa a chave fornecida pelo cliente ou a variável de ambiente
    const apiKey = clientApiKey || process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Chave API não fornecida. Insira sua chave da OpenRouter ou configure OPENROUTER_API_KEY no servidor.' },
        { status: 500 }
      );
    }

    // Se temos revolução solar, gerar relatório comparativo
    let messages: OpenRouterMessage[];
    
    if (solarRevolution && solarYear) {
      messages = buildSolarReturnPrompt(chart, solarRevolution, solarYear);
    } else {
      messages = buildNatalPrompt(chart);
    }

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://astro-map.app',
        'X-Title': 'AstroMap',
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.8,
        max_tokens: 4000,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.error?.message || `Erro na API: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.error) {
      return NextResponse.json(
        { error: data.error.message },
        { status: 500 }
      );
    }

    const content = data.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: 'Resposta vazia da IA' },
        { status: 500 }
      );
    }

    const report = parseAIReport(content);
    
    return NextResponse.json({ 
      report, 
      modelUsed: model,
      type: solarRevolution ? 'solar-return' : 'natal'
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

function buildNatalPrompt(chart: NatalChart): OpenRouterMessage[] {
  return [
    {
      role: 'system',
      content: `Você é um astrólogo profissional com décadas de experiência em interpretação de mapas astrais. 
Você escreve relatórios completos, detalhados e empáticos em português brasileiro.

Sua tarefa é analisar os dados astronômicos fornecidos e criar um relatório astrológico completo com as seguintes seções, organizadas em áreas temáticas:

🌟 IDENTIDADE CENTRAL
1. **Sol, Lua e Ascendente** - A tríade da personalidade: essência (Sol), emoções (Lua) e aparência social (Ascendente). Como esses três pontos se combinam para formar a identidade.
2. **Regente do Ascendente** - Qual planeta rege o signo ascendente, onde está posicionado e o que isso revela sobre a motivação central da pessoa.
3. **Elementos e Modalidades** - Distribuição de Fogo/Terra/Ar/Água e Cardinal/Fixo/Mutável. O que isso diz sobre o temperamento e estilo de ação.

💫 PLANETAS NOS SIGNOS
4. **Planetas Pessoais** - Sol, Lua, Mercúrio, Vênus e Marte nos signos. Como cada um se expressa na personalidade.
5. **Planetas Sociais e Transpessoais** - Júpiter, Saturno, Urano, Netuno e Plutão nos signos. Visão de mundo, lições, transformações e desafios coletivos.

🏠 CASAS ASTROLÓGICAS
6. **Casas 1 a 6 (Vida Pessoal)** - Personalidade, valores, Comunicação, lar, prazer e saúde. Como a pessoa se relaciona consigo mesma e com o dia a dia.
7. **Casas 7 a 12 (Vida Coletiva)** - Relações, transformação, expansão, carreira, comunidade e espiritualidade. Como a pessoa se relaciona com o mundo.

🔗 ASPECTOS E PADRÕES
8. **Aspectos Harmoniosos** - Trígnos, sextis e conjunções leves. Onde a vida flui com mais facilidade e naturalidade.
9. **Aspectos Desafiadores** - Quadraturas, oposições e conjunções tensas. Onde há tensão, conflito e oportunidades de crescimento.
10. **Padrões Especiais** - Identifique se há configurações como Grande Tríno, T-Square, Cruz Cósmica, etc. e o que significam.

🔮 INTERPRETAÇÕES ESPECÍFICAS
11. **Nodos Lunares** - Nodo Norte: propósito de vida e direção evolutiva. Nodo Sul: padrões do passado e zona de conforto. Como integrar ambos.
12. **Quíron: A Ferida Curadora** - Onde está a ferida mais profunda e como transformá-la em fonte de sabedoria e cura para os outros.
13. **Vocação e Carreira** - Casas 2, 6 e 10, regente do Meio do Céu e planetas nessas casas. Indicações profissionais e de propósito.

🌱 SÍNTESE E ORIENTAÇÕES
14. **Pontos Fortes e Desafios** - Resumo dos principais talentos e áreas que pedem atenção e desenvolvimento.
15. **Conselhos Práticos** - Orientações para o dia a dia baseadas no mapa, incluindo autocuidado, relacionamentos e propósito de vida.

REGRAS IMPORTANTES:
- Cada seção deve ter um emoji no título e um parágrafo conciso (3-5 frases).
- Use linguagem acessível mas com profundidade astrológica.
- Seja específico sobre signos, casas e aspectos mencionados.
- Inclua insights psicológicos e práticos em cada seção.
- Finalize cada seção com uma frase de conselho prático.`,
    },
    {
      role: 'user',
      content: formatChartForAI(chart),
    },
  ];
}

function buildSolarReturnPrompt(natalChart: NatalChart, solarReturn: NatalChart, year: number): OpenRouterMessage[] {
  return [
    {
      role: 'system',
      content: `Você é um astrólogo profissional especializado em revoluções solares e previsões anuais.
Você escreve análises detalhadas e práticas em português brasileiro.

Sua tarefa é comparar o mapa natal com a revolução solar e criar uma análise completa do ano com as seguintes seções, organizadas em áreas temáticas:

🌟 VISÃO GERAL DO ANO
1. **Tema Central do Ano** - O que este ano representa na jornada da pessoa. Palavra-chave e resumo do foco principal.
2. **Ascendente da Revolução** - Novo signo ascendente e como difere do natal. Tom e energia do ano.

☀️ O SOL NA REVOLUÇÃO
3. **Casa do Sol** - Área de vida que ganha destaque, vitalidade e luz neste ano. Onde brilhar.
4. **Aspectos do Sol** - Desafios e oportunidades ligados à identidade, propósito e autoexpressão.

🌙 LUA E EMOÇÕES
5. **Lua na Revolução** - Tom emocional do ano, necessidades afetivas e instintos ativados.
6. **Casa da Lua** - Onde as emoções serão mais intensas e o que pedirão cuidado.

🔄 PLANETAS E DINÂMICAS
7. **Planetas Retrógrados** - Áreas que pedem reflexão, revisão e pacência. Onde NÃO avançar às pressas.
8. **Aspectos Harmoniosos** - Trígnos e sextis na revolução. Onde haverá fluidez, facilidades e oportunidades.
9. **Aspectos Desafiadores** - Quadraturas e oposições na revolução. Onde haverá tensão, conflito e necessidade de mudança.
10. **Planetas nas Casas** - Como cada planeta atua neste ano específico e em qual área da vida.

📋 ORIENTAÇÕES
11. **Comparação Natal × Revolução** - Pontos de convergência e divergência entre os dois mapas. O que muda e o que se mantém.
12. **Conselhos Práticos para o Ano** - Orientações mês a mês (trimestres) e cuidados especiais para aproveitar ao máximo as energias do ano.

REGRAS IMPORTANTES:
- Cada seção deve ter um emoji no título e um parágrafo conciso (3-5 frases).
- Seja específico e prático. Compare sempre com o mapa natal quando relevante.
- Use linguagem acessível e inclua insights úteis para o dia a dia.
- Destaque tendências e períodos favoráveis e desafiadores ao longo do ano.
- Finalize cada seção com uma dica prática.`,
    },
    {
      role: 'user',
      content: `Analise minha Revolução Solar para ${year} comparando com meu Mapa Natal:

=== MAPA NATAL ===
${formatChartForAI(natalChart)}

=== REVOLUÇÃO SOLAR ${year} ===
${formatChartForAI(solarReturn)}

Data exata do retorno solar: ${solarReturn.birthData.date} às ${solarReturn.birthData.time} UTC

Por favor, forneça uma análise completa comparando os dois mapas e indicando as tendências para o ano ${year}.`,
    },
  ];
}

export async function GET() {
  // Retorna lista de modelos disponíveis
  return NextResponse.json({ models: AVAILABLE_MODELS });
}

function formatChartForAI(chart: NatalChart): string {
  const { birthData, planets, housesPlacidus, aspects, ascendant, mc } = chart;
  
  let result = `DADOS DO MAPA ASTRAL\n`;
  result += `====================\n\n`;
  result += `NOME: ${birthData.name}\n`;
  result += `DATA: ${birthData.date}\n`;
  result += `HORA: ${birthData.time}\n`;
  result += `LOCAL: ${birthData.location}\n`;
  result += `COORDENADAS: ${birthData.latitude.toFixed(4)}°, ${birthData.longitude.toFixed(4)}°\n\n`;
  
  result += `POSIÇÕES PLANETÁRIAS:\n`;
  result += `-`.repeat(50) + '\n';
  
  for (const planet of planets) {
    const retro = planet.retrograde ? ' (R)' : '';
    const degree = `${Math.floor(planet.degree)}°${Math.floor((planet.degree % 1) * 60)}'`;
    result += `${planet.name}: ${planet.sign} ${degree} (Casa ${planet.house})${retro}\n`;
  }
  
  result += `\nÂNGULOS PRINCIPAIS:\n`;
  result += `-`.repeat(50) + '\n';
  result += `Ascendente: ${getZodiacSign(ascendant)} ${formatDegree(ascendant % 30)}\n`;
  result += `Meio do Céu (MC): ${getZodiacSign(mc)} ${formatDegree(mc % 30)}\n`;
  
  result += `\nCÚSPIDES DAS CASAS (Sistema Placidus):\n`;
  result += `-`.repeat(50) + '\n';
  
  for (const house of housesPlacidus) {
    const degree = `${Math.floor(house.degree)}°${Math.floor((house.degree % 1) * 60)}'`;
    result += `Casa ${house.number}: ${house.sign} ${degree}\n`;
  }
  
  result += `\nASPECTOS PRINCIPAIS (órbita ≤ 8°):\n`;
  result += `-`.repeat(50) + '\n';
  
  const majorAspects = aspects.filter(a => 
    ['conjunction', 'sextile', 'square', 'trine', 'opposition'].includes(a.type)
  ).slice(0, 15);
  
  for (const aspect of majorAspects) {
    const applying = aspect.applying ? ' aplicando' : ' separando';
    result += `${aspect.planet1} ${aspect.type} ${aspect.planet2} (órbita: ${aspect.orb.toFixed(1)}°${applying})\n`;
  }
  
  result += `\nPor favor, gere um relatório astrológico completo e detalhado baseado nestes dados.`;
  
  return result;
}

function parseAIReport(content: string): AIReport {
  const sections: { title: string; content: string }[] = [];
  
  const lines = content.split('\n');
  let currentTitle = '';
  let currentContent: string[] = [];
  
  for (const line of lines) {
    const headerMatch = line.match(/^(#{1,3}\s*)(.+)$/);
    
    if (headerMatch) {
      if (currentTitle && currentContent.length > 0) {
        sections.push({
          title: currentTitle,
          content: currentContent.join('\n').trim(),
        });
      }
      currentTitle = headerMatch[2].trim();
      currentContent = [];
    } else if (line.trim()) {
      currentContent.push(line);
    }
  }
  
  if (currentTitle && currentContent.length > 0) {
    sections.push({
      title: currentTitle,
      content: currentContent.join('\n').trim(),
    });
  }
  
  if (sections.length === 0) {
    sections.push({
      title: 'Relatório Astrológico',
      content: content.trim(),
    });
  }
  
  return {
    sections,
    summary: sections[0]?.content.slice(0, 200) + '...' || content.slice(0, 200) + '...',
    generatedAt: new Date().toISOString(),
  };
}

function getZodiacSign(longitude: number): string {
  const signs = ['Áries', 'Touro', 'Gêmeos', 'Câncer', 'Leão', 'Virgem', 'Libra', 'Escorpião', 'Sagitário', 'Capricórnio', 'Aquário', 'Peixes'];
  return signs[Math.floor(longitude / 30) % 12];
}

function formatDegree(degree: number): string {
  const d = Math.floor(degree);
  const m = Math.floor((degree - d) * 60);
  return `${d}°${m}'`;
}
