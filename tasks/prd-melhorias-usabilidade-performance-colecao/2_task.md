# Tarefa 2.0: Simplificar carregamento inicial e visibilidade do resumo do catálogo

## Visão geral

Ajustar a tela de detalhe do álbum para preservar o progresso inicial, remover o carregamento automático de listagens extensas e exibir o resumo do catálogo apenas para administradores.

<skills>
### Conformidade com skills

- `react-frontend-conventions`: aplicável a componentes funcionais, estado local e props explícitas.
- `repo-folder-structure`: aplicável à organização das features de álbum e coleção.
- `nodejs-typescript-conventions`: aplicável aos tipos compartilhados e clientes de API.
- `vitest-testing`: aplicável aos testes de componentes e fluxos de carregamento.
- `code-standards-en`: aplicável a identificadores e funções em inglês.
</skills>

<requirements>

- A tela inicial deve continuar carregando detalhe do álbum, seções e progresso da coleção.
- A tela inicial não deve carregar todas as figurinhas, faltantes ou repetidas antes de seleção explícita.
- `CatalogSummary` deve ser renderizado para administradores e ocultado para usuários finais.
- A visualização de progresso atual deve permanecer disponível e sem alteração na lógica de cálculo.
- A busca por código e os controles principais existentes devem continuar acessíveis conforme comportamento atual.
</requirements>

## Subtarefas

- [x] 2.1 Remover do carregamento inicial da coleção as chamadas que buscam listas completas de figurinhas.
- [x] 2.2 Manter o carregamento inicial de detalhe do álbum, seções e progresso.
- [x] 2.3 Condicionar a renderização de `CatalogSummary` ao perfil administrativo.
- [x] 2.4 Atualizar o cliente HTTP web para consumir a nova listagem sob demanda quando necessário.
- [x] 2.5 Garantir que `CollectionDashboard` receba apenas os dados necessários para coordenar os painéis.
- [x] 2.6 Cobrir a visibilidade do resumo e a ausência de listagens iniciais com testes de componente.

## Detalhes de implementação

Seguir `techspec.md`, especialmente as seções "Visão dos componentes", "Endpoints da API", "Principais decisões" e a etapa 3 da "Ordem de construção".

## Critérios de sucesso

- Usuário final não vê a seção "Resumo do catálogo".
- Administrador continua vendo a seção "Resumo do catálogo".
- O progresso da coleção segue visível no primeiro carregamento.
- Nenhuma listagem extensa é buscada automaticamente na abertura da tela de coleção.
- A tela inicial fica funcional em desktop e mobile sem depender de recarregamento manual.

## Testes da tarefa

- [x] Testes unitários de `AlbumDetailPage` para usuário final sem `CatalogSummary`.
- [x] Testes unitários de `AlbumDetailPage` para administrador com `CatalogSummary`.
- [x] Testes unitários garantindo que progresso continue renderizado.
- [x] Testes de integração ou mocks de API garantindo ausência de chamadas iniciais para listas extensas.
- [x] Testes E2E (se aplicável): cobertos na tarefa 4.0.

## Notas de implementação

- `AlbumDetailPage` agora carrega detalhe do álbum e progresso no carregamento inicial.
- Usuário comum não dispara `GET /albums/:albumId/stickers` ao abrir a tela; o catálogo completo fica restrito ao fluxo administrativo.
- `CatalogSummary` passou a ser renderizado apenas para administradores.
- `CollectionDashboard` recebe `initialProgress` e inicia sem buscar figurinhas, faltantes ou repetidas automaticamente.
- Adicionado cliente `listCollectionStickers` para consumir `GET /albums/:albumId/collection/stickers` sob demanda.
- Os seletores de seção iniciam sem seleção e carregam dados somente após escolha explícita.

## Verificação

- `pnpm --filter @albumcheio/web test`: 6 arquivos, 18 testes passando.
- `pnpm --filter @albumcheio/web build`: passou.

## Arquivos relevantes

- `tasks/prd-melhorias-usabilidade-performance-colecao/prd.md`
- `tasks/prd-melhorias-usabilidade-performance-colecao/techspec.md`
- `apps/web/src/features/albums/components/album-detail-page.tsx`
- `apps/web/src/features/albums/components/catalog-summary.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.tsx`
- `apps/web/src/lib/api/api-types.ts`
- `apps/web/src/lib/api/http-client.ts`
