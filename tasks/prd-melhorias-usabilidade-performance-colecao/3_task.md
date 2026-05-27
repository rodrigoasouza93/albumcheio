# Tarefa 3.0: Refatorar painéis da coleção para seleção explícita de seção

## Visão geral

Refatorar os painéis de quantidades, faltantes e repetidas para iniciar sem dados carregados, mostrar mensagem orientativa e buscar listas apenas após o usuário selecionar uma seção ou escolher explicitamente "Todas as seções".

<skills>
### Conformidade com skills

- `react-frontend-conventions`: aplicável ao estado local, hooks, props explícitas e testes de componentes.
- `ui-ux-pro-max`: aplicável aos estados de vazio, carregamento, erro, responsividade e acessibilidade visual.
- `nodejs-typescript-conventions`: aplicável aos tipos e funções auxiliares TypeScript.
- `vitest-testing`: aplicável aos testes unitários dos componentes e interações.
- `code-standards-en`: aplicável a identificadores em inglês.
</skills>

<requirements>

- `CollectionDashboard` deve coordenar seleção de seção, estados de carregamento, erro e conteúdo dos painéis.
- `StickerQuantityList` deve iniciar sem figurinhas renderizadas e com mensagem para seleção de seção.
- `CollectionSummaryLists` deve iniciar sem listas de faltantes/repetidas e com mensagem para seleção de seção.
- Seções específicas devem aparecer antes da opção "Todas as seções".
- "Todas as seções" deve permanecer disponível, mas apenas como escolha explícita.
- A edição de quantidade deve continuar funcionando para os dados carregados da seção atual.
- Após edição de quantidade, os dados relevantes da seção atual devem ser invalidados ou recarregados.
- Estados de vazio inicial, vazio real, carregamento e erro devem ser textualmente claros e acessíveis.
</requirements>

## Subtarefas

- [x] 3.1 Modelar o estado inicial sem seção selecionada no dashboard e nos painéis.
- [x] 3.2 Criar opções de seção com seções reais primeiro e "Todas as seções" por último.
- [x] 3.3 Ajustar `StickerQuantityList` para buscar e renderizar figurinhas somente após seleção.
- [x] 3.4 Ajustar `CollectionSummaryLists` para buscar faltantes e repetidas somente após seleção.
- [x] 3.5 Implementar estados de carregamento, erro, vazio orientativo e vazio real.
- [x] 3.6 Preservar edição de quantidade e recarregar ou invalidar dados da seção atual após sucesso.
- [x] 3.7 Validar navegação por teclado, rótulos de seletores e mensagens para tecnologias assistivas.
- [x] 3.8 Cobrir os componentes com testes unitários e de interação.

## Detalhes de implementação

Seguir `techspec.md`, especialmente as seções "Visão dos componentes", "Modelos de dados", "Considerações de UI/UX", "Riscos conhecidos" e as etapas 4 e 5 da "Ordem de construção".

## Critérios de sucesso

- Nenhum painel carrega listas no estado inicial sem seleção.
- Selecionar uma seção carrega apenas os dados daquela seção.
- Selecionar "Todas as seções" carrega a visão consolidada apenas após escolha explícita.
- Mensagens distinguem claramente "selecione uma seção" de "nenhum item encontrado".
- A edição de quantidade continua funcionando sem recarregar a página.
- Faltantes e repetidas refletem a seção atual após atualização relevante.

## Testes da tarefa

- [x] Testes unitários de `CollectionDashboard` para estado inicial sem chamadas de listagem.
- [x] Testes unitários de ordenação das opções de seção.
- [x] Testes unitários de `StickerQuantityList` para vazio inicial, carregamento, conteúdo e edição.
- [x] Testes unitários de `CollectionSummaryLists` para vazio inicial, vazio real, carregamento, erro e conteúdo.
- [x] Testes de integração frontend/API usando mocks para seleção por seção e "Todas as seções".
- [x] Testes E2E (se aplicável): cobertos na tarefa 4.0.

## Notas de implementação

- `CollectionDashboard` mantém estado inicial sem seção selecionada e não dispara listagens de figurinhas, faltantes ou repetidas até seleção explícita.
- `StickerQuantityList` exibe vazio orientativo, loading acessível com `role="status"` e vazio real separado quando o filtro não retorna itens.
- `CollectionSummaryLists` mantém o mesmo padrão de seleção explícita para faltantes e repetidas.
- As opções de seção são ordenadas por `sortOrder` e nome, com "Todas as seções" por último.
- A seleção "Todas as seções" chama os endpoints sem `sectionId`, preservando a semântica consolidada como escolha explícita.
- Após alteração de quantidade, os dados do painel de resumo selecionado são recarregados; sem painel selecionado, o progresso é atualizado.

## Verificação

- `pnpm --filter @albumcheio/web test -- collection-dashboard.test.tsx` passou com 6 arquivos e 19 testes.
- `pnpm --filter @albumcheio/web build` passou com compilação Next.js e TypeScript.

## Arquivos relevantes

- `tasks/prd-melhorias-usabilidade-performance-colecao/prd.md`
- `tasks/prd-melhorias-usabilidade-performance-colecao/techspec.md`
- `apps/web/src/features/collection/components/collection-dashboard.tsx`
- `apps/web/src/features/collection/components/sticker-quantity-list.tsx`
- `apps/web/src/features/collection/components/collection-summary-lists.tsx`
- `apps/web/src/features/collection/lib/collection-status.ts`
- `apps/web/src/lib/api/api-types.ts`
- `apps/web/src/lib/api/http-client.ts`
