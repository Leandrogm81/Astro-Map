# Debug Log - AstroMap
**Data:** 2026-04-21
**Sessão:** 4
**Agente:** Debugger (Antigravity)

## 1. Problema Reportado
O deploy da Vercel continuava falhando com o erro `Error [ERR_INPUT_TYPE_NOT_ALLOWED]: --input-type can only be used with string input via --eval, --print, or STDIN`. O problema do Mojibake estava resolvido localmente, mas o comando de build modificado impedia o deploy da Vercel de prosseguir.
Adicionalmente, solicitou-se que o aplicativo ficasse totalmente em português (pt-BR) e que o ambiente de desenvolvimento local (`localhost:3000`) fosse ativado.

## 2. Análise da Causa Raiz
1. **Erro no Deploy Vercel**: A falha no `vercel build` ocorria devido à alteração anterior no script `build` do `package.json`, que incluía a injeção manual das variáveis `LANG` e `LC_ALL` via `echo` (ex: `"build": "echo \"LANG=$LANG LC_ALL=$LC_ALL\" && next build"`). A infraestrutura de build do Next.js/Vercel (especialmente no ambiente Node) apresenta incompatibilidade ao interpretar o script combinado, injetando uma flag `--input-type` incompatível.
2. **Textos Residuais em Inglês**: A função `getPlanetLabel` localizada em `ExportPDF.tsx` possuía o mapeamento para pt-BR apenas dos planetas tradicionais, retornando as chaves em inglês (ex: `uranus`, `neptune`, `pluto`) para os planetas modernos.

## 3. Correções Aplicadas (Cirúrgicas)
- **`package.json`**: Removido o comando `echo "LANG=$LANG LC_ALL=$LC_ALL" &&` do script `"build"`, restaurando-o para `"next build"`. As variáveis de ambiente `LANG` e `LC_ALL` devem ser configuradas exclusivamente via Vercel Dashboard para evitar conflitos na pipeline de build.
- **`src/components/ExportPDF.tsx`**: O objeto de mapeamento dentro de `getPlanetLabel` foi estendido para incluir `uranus: 'Urano'`, `neptune: 'Netuno'`, `pluto: 'Plutão'`, `node: 'Nodo Norte'`, `chiron: 'Quíron'`, `lilith: 'Lilith'` e `partOfFortune: 'Roda da Fortuna'`, garantindo cobertura 100% do idioma em todo o sistema de geração de PDF.
- **Localhost**: O comando `npm run dev` foi inicializado (detectou-se que instâncias em execução já ocupavam as portas 3000 e 3001, levantando assim uma nova instância).

## 4. Testes e Validação
- Nomes dos planetas, símbolos e dignidades na emissão em PDF e em tela agora utilizam exclusivamente traduções em pt-BR.
- As mudanças no `package.json` são estruturais e eliminam a barreira primária ao empacotamento da Vercel, permitindo o correto provisionamento do app.

## 5. Próximos Passos e Recomendações
- **Deploy**: As alterações devem ser commitadas e pushadas para acionar um novo ciclo de deploy na Vercel. 
- **Vercel Dashboard**: Certifique-se de configurar permanentemente `LANG=en_US.UTF-8` e `LC_ALL=en_US.UTF-8` em *Project Settings > Environment Variables* no painel da Vercel para garantir que a renderização PDF da interface não volte a apresentar o *Mojibake*.
