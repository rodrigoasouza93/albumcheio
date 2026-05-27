# Especificação técnica

## Resumo executivo

A melhoria deve transformar a tela de coleção em uma experiência orientada por seleção explícita de seção. O carregamento inicial continuará buscando o detalhe do álbum, as seções e o progresso da coleção, mas deixará de buscar todas as figurinhas, todas as quantidades, faltantes e repetidas antes de uma ação do usuário.

A principal decisão técnica é mover as listagens extensas para consultas sob demanda e paginadas por seção, preservando a visualização de progresso existente. O frontend passará a tratar "nenhuma seção selecionada" como estado inicial dos painéis de quantidade e listas resumidas; a API manterá `sectionId` opcional para suportar "Todas as seções", mas essa opção será renderizada por último e acionada apenas quando escolhida.

## Arquitetura do sistema

### Visão dos componentes

- `AlbumDetailPage`: deixa de carregar todas as figurinhas para todos os perfis no carregamento inicial. Carrega `AlbumDetail` e repassa seções, perfil e token para os componentes filhos. Renderiza `CatalogSummary` somente para administradores.
- `CollectionDashboard`: passa a ser renderizado para usuários comuns e administradores. Mantém o progresso inicial e coordena estados de seleção, carregamento, erro e conteúdo dos painéis de coleção.
- `StickerQuantityList`: muda de filtro local sobre lista completa para painel controlado por `selectedSectionId`, com estado inicial sem seção, mensagem orientativa e dados recebidos após consulta por seção.
- `CollectionSummaryLists`: muda para o mesmo padrão de seleção explícita, carregando faltantes e repetidas somente após escolha de seção.
- `CatalogSummary`: permanece como componente administrativo. Para usuário final, deixa de ser renderizado.
- `apps/web/src/lib/api/http-client.ts`: adiciona cliente para listagem de figurinhas com status da coleção por seção; mantém clientes existentes de progresso, faltantes e repetidas.
- `CollectionsController` e `CollectionsService`: adicionam listagem paginada de figurinhas da coleção com quantidade/status, evitando busca individual por código para montar a lista de edição.
- `CollectionsRepository`/`SupabaseClient`: reutilizam consultas existentes de figurinhas e itens da coleção com filtro opcional por `sectionId`.
- `MetricsService`: registra leituras sob demanda por seção e diferencia consultas consolidadas de "Todas as seções".

Fluxo de dados: ao abrir o álbum, a web carrega detalhe do álbum e progresso. Os seletores começam vazios, com placeholder de ação. Ao selecionar uma seção, o painel de quantidades busca figurinhas daquela seção com status da coleção; o painel de faltantes/repetidas busca as duas listas para a seção. Ao selecionar "Todas as seções", a mesma API é chamada sem `sectionId`, mantendo paginação e estados de carregamento.

## Design de implementação

### Principais interfaces

```ts
export type CollectionSectionSelection = string | null;

export interface CollectionStickerListInput {
  readonly accessToken: string;
  readonly userId: string;
  readonly albumId: string;
  readonly sectionId?: string;
  readonly limit: number;
  readonly offset: number;
}
```

```ts
export interface CollectionStickerSummary extends StickerSummary {
  readonly quantityTotal: number;
  readonly owned: boolean;
  readonly duplicateCount: number;
  readonly status: CollectionSearchStatus;
}
```

```ts
export interface CollectionDashboardProps {
  readonly albumId: string;
  readonly sections: readonly AlbumSectionSummary[];
  readonly token: string;
  readonly isAdmin: boolean;
  readonly onUnauthorized: () => void;
}
```

### Modelos de dados

Não há mudança estrutural de banco. A fonte de verdade continua sendo:

- `stickers`: catálogo compartilhado, filtrado por `album_id` e opcionalmente por `section_id`.
- `collection_items`: quantidades por usuário, consultadas por `user_id` e conjunto de `sticker_id`.
- `profiles.role`: usado no frontend apenas para decidir renderização de `CatalogSummary` e controles administrativos; a autorização segue na API/RLS.

Novos tipos de resposta:

- `CollectionStickerPage`: `items`, `limit`, `offset`, com itens contendo dados da figurinha, `quantityTotal`, `owned`, `duplicateCount` e `status`.
- `SectionPickerOption`: representação derivada no frontend com seções reais primeiro e opção `{ value: 'all', label: 'Todas as seções' }` por último.

O estado inicial dos seletores será `null` ou string vazia, nunca `all`. `all` representa uma consulta consolidada explícita.

### Endpoints da API

- `GET /api/v1/albums/:albumId/progress`: permanece carregado na abertura da coleção para preservar a visualização atual de progresso.
- `GET /api/v1/albums/:albumId/collection/stickers?sectionId&limit&offset`: novo endpoint para listar figurinhas da coleção com quantidade/status. `sectionId` ausente significa "Todas as seções".
- `GET /api/v1/albums/:albumId/missing?sectionId&limit&offset`: endpoint existente mantido, chamado somente após seleção no painel.
- `GET /api/v1/albums/:albumId/duplicates?sectionId&limit&offset`: endpoint existente mantido, chamado somente após seleção no painel.
- `PATCH /api/v1/collection-items/:stickerId`: mantido para edição de quantidade.
- `GET /api/v1/albums/:albumId/stickers?sectionId&limit&offset`: segue disponível para catálogo e administração, mas deixa de ser dependência do carregamento inicial da coleção.

Erros de autenticação continuam `401`; álbum indisponível para o perfil continua `403` ou `404` conforme regra atual; `sectionId` inválido retorna `400`.

## Pontos de integração

Não há novas integrações externas. A mudança usa a API NestJS, Supabase/PostgreSQL e sessão Supabase já existentes. O frontend deve continuar usando `fetch` via `requestApi`, com token bearer, e traduzir falhas por `ApiError`.

## Abordagem de testes

### Testes unitários

- `CollectionDashboard`: renderiza progresso sem carregar listagens; mostra mensagens de "selecione uma seção" antes da seleção; dispara chamadas apenas após alteração do seletor.
- `StickerQuantityList`: mantém seções específicas antes de "Todas as seções"; não renderiza figurinhas quando `selectedSectionId` é nulo; preserva edição de quantidade após dados carregados.
- `CollectionSummaryLists`: cobre estados inicial, carregando, vazio real e conteúdo de faltantes/repetidas.
- `AlbumDetailPage`: usuário comum não vê `CatalogSummary`; admin vê `CatalogSummary` e também consegue acessar coleção sob demanda.
- `CollectionsService`: mapeia `CollectionStickerSummary`, calcula `status`, `owned` e `duplicateCount`, e aplica filtro opcional por seção.

### Testes de integração

- `GET /collection/stickers` retorna apenas a seção solicitada quando `sectionId` é informado.
- O mesmo endpoint retorna visão consolidada paginada quando `sectionId` é omitido.
- `missing` e `duplicates` continuam filtrando por seção e respeitando `limit`/`offset`.
- Usuário comum não acessa álbum não publicado fora das regras atuais; admin mantém acesso ao catálogo.
- Atualização de quantidade invalida ou recarrega os dados da seção atual sem exigir reload de página.

### Testes E2E

Usar Playwright para validar frontend com backend:

- Usuário comum abre um álbum e vê progresso, busca por código e seletores sem listas carregadas.
- Ao selecionar uma seção, o usuário vê somente as figurinhas daquela seção e consegue alterar quantidade.
- Faltantes e repetidas iniciam com mensagem orientativa e carregam após seleção.
- "Todas as seções" aparece por último e carrega a visão consolidada apenas quando selecionada.
- Admin vê `Resumo do catálogo`; usuário comum não vê.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Ajustar contratos e API de `CollectionStickerPage`, porque a lista de quantidades precisa de uma fonte paginada e sem N+1.
2. Atualizar `CollectionsService` e repositório para montar figurinhas com quantidades por usuário e filtro opcional por seção.
3. Alterar `AlbumDetailPage` para remover `listAllStickers` do carregamento inicial da coleção e renderizar `CatalogSummary` somente para admin.
4. Refatorar `CollectionDashboard` para estado inicial sem seleção e carregamento sob demanda dos dois painéis.
5. Ajustar `StickerQuantityList` e `CollectionSummaryLists` para mensagens orientativas, estados de loading/erro e ordenação de opções.
6. Atualizar testes unitários e integração.
7. Validar E2E e revisar acessibilidade em desktop/mobile.

### Dependências técnicas

- Nenhuma nova biblioteca é necessária.
- As migrations atuais de catálogo, coleção, perfis e RLS devem estar aplicadas.
- Seeds de teste precisam ter pelo menos duas seções, figurinhas em ambas, usuário comum e admin.
- A API deve continuar aceitando paginação `limit`/`offset` nos endpoints de listagem.

## Monitoramento e observabilidade

- Adicionar ou reutilizar métricas Prometheus:
  - `collection_sticker_list_total{scope,outcome}` com `scope=section|all`.
  - `collection_sticker_list_duration_seconds{scope,outcome}`.
  - `collection_summary_list_total{kind,scope,outcome}` com `kind=missing|duplicates`.
- Logs estruturados em nível `info` para consultas concluídas com `userId`, `albumId`, `sectionId` quando houver, `limit`, `offset`, `itemsCount` e duração.
- Logs de erro em nível `warn` para validação/autorização e `error` para falhas inesperadas, sem registrar tokens.
- Dashboards Grafana existentes devem acompanhar latência p95 de `progress`, `collection/stickers`, `missing` e `duplicates`, além de volume de consultas `all`.

## Considerações técnicas

### Principais decisões

- Não carregar `all` como estado padrão, porque "Todas as seções" é a operação mais pesada e deve ser escolha explícita.
- Criar listagem de coleção com quantidade/status em vez de continuar buscando status por código para cada figurinha, reduzindo chamadas HTTP e trabalho de renderização.
- Preservar o carregamento de progresso inicial, pois o PRD declara que essa visualização deve continuar em destaque.
- Manter `missing` e `duplicates` como endpoints separados, porque os contratos já existem e atendem bem às listas resumidas.
- Aplicar a visibilidade do `CatalogSummary` no `AlbumDetailPage`, usando `session.user.role`, sem relaxar autorização de backend.

### Riscos conhecidos

- Álbuns muito grandes ainda podem gerar consultas pesadas quando o usuário escolhe "Todas as seções"; mitigar com paginação real no frontend e evitando recursão automática para buscar todas as páginas.
- A tela atual usa helpers recursivos para buscar todas as páginas; eles devem ser removidos ou limitados para não recriar o problema sob outro endpoint.
- Se o admin depender do resumo completo para validação, `CatalogSummary` pode continuar pesado; caso isso apareça em produção, evoluir o resumo administrativo para paginação ou colapso por seção.
- Após editar quantidade, faltantes/repetidas podem ficar defasadas se não houver recarregamento do painel selecionado; mitigar invalidando a seção atual após sucesso do `PATCH`.
- Estados vazios podem ser confundidos com ausência real de figurinhas; separar texto de "selecione uma seção" de "nenhum item encontrado neste filtro".

### Conformidade com rules

- `.claude/rules` não existe no repositório durante a análise. Não há rules locais a aplicar.
- `AGENTS.md`: a criação desta techspec é documentação e não implementação de código; nenhuma branch de implementação foi criada devido a mudanças não commitadas já existentes.

### Conformidade com skills

- `context7`: usado para consultar documentação atual de React sobre `select` controlado e renderização condicional.
- `react-frontend-conventions`: aplicável a componentes React funcionais, estado local, props explícitas e testes de componentes.
- `nodejs-typescript-conventions`: aplicável aos novos tipos e serviços TypeScript sem `any`.
- `express-rest-http`: aplicável aos endpoints REST-ish e status HTTP.
- `repo-folder-structure`: aplicável à separação entre features web e módulos backend.
- `vitest-testing`: aplicável aos testes unitários e de integração; Playwright para E2E.
- `code-standards-en`: aplicável a identificadores em inglês e funções verbais.

### Arquivos relevantes e dependentes

- `tasks/prd-melhorias-usabilidade-performance-colecao/prd.md`
- `tasks/prd-melhorias-usabilidade-performance-colecao/techspec.md`
- `create_techspec.md`
- `apps/web/src/features/albums/components/album-detail-page.tsx`
- `apps/web/src/features/albums/components/catalog-summary.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.tsx`
- `apps/web/src/features/collection/components/sticker-quantity-list.tsx`
- `apps/web/src/features/collection/components/collection-summary-lists.tsx`
- `apps/web/src/features/collection/lib/collection-status.ts`
- `apps/web/src/lib/api/api-types.ts`
- `apps/web/src/lib/api/http-client.ts`
- `apps/api/src/modules/collections/collections.controller.ts`
- `apps/api/src/modules/collections/collections.service.ts`
- `apps/api/src/modules/collections/collections.types.ts`
- `apps/api/src/modules/collections/collections.validation.ts`
- `apps/api/src/modules/collections/data/collections.repository.ts`
- `apps/api/src/modules/supabase/supabase-client.ts`
- `apps/api/src/modules/observability/metrics.service.ts`
