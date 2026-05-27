# Tarefa 1.0: Implementar backend de listagens sob demanda da coleção

## Visão geral

Criar a base de API e serviço para listar figurinhas da coleção sob demanda, com paginação, filtro opcional por seção e dados de quantidade/status do usuário. Esta entrega remove a necessidade de montar listas extensas no frontend a partir do catálogo completo.

<skills>
### Conformidade com skills

- `nodejs-typescript-conventions`: aplicável aos tipos, serviços e validações TypeScript.
- `express-rest-http`: aplicável ao desenho do endpoint REST-ish, status HTTP, paginação e documentação.
- `repo-folder-structure`: aplicável à separação entre controller, service, repository e cliente Supabase.
- `supabase`: aplicável às consultas via Supabase/PostgreSQL, autenticação e RLS existentes.
- `supabase-postgres-best-practices`: aplicável à eficiência das consultas filtradas por álbum, seção e usuário.
- `vitest-testing`: aplicável aos testes unitários e de integração da API.
- `code-standards-en`: aplicável a nomes de tipos, métodos e variáveis em inglês.
</skills>

<requirements>

- Criar o endpoint `GET /api/v1/albums/:albumId/collection/stickers?sectionId&limit&offset`.
- Retornar uma página de figurinhas da coleção com dados da figurinha, `quantityTotal`, `owned`, `duplicateCount` e `status`.
- Aceitar `sectionId` opcional; ausência de `sectionId` representa a consulta consolidada de "Todas as seções".
- Respeitar paginação `limit`/`offset`, autenticação, autorização, RLS e regras atuais de acesso ao álbum.
- Retornar erro adequado para `sectionId` inválido e manter os contratos existentes de autenticação/autorização.
- Registrar métricas e logs estruturados sem expor tokens.
</requirements>

## Subtarefas

- [x] 1.1 Definir contratos de request/response para `CollectionStickerPage` e `CollectionStickerSummary`.
- [x] 1.2 Implementar validação dos parâmetros `sectionId`, `limit` e `offset`.
- [x] 1.3 Implementar controller para a nova rota de listagem de figurinhas da coleção.
- [x] 1.4 Implementar service para montar quantidades, status, posse e duplicadas por usuário.
- [x] 1.5 Ajustar repository/Supabase client para consultar figurinhas e itens da coleção com filtro opcional por seção.
- [x] 1.6 Adicionar métricas e logs para consultas por seção e consultas consolidadas.
- [x] 1.7 Cobrir service, validação e endpoint com testes unitários e de integração.

## Detalhes de implementação

Seguir `techspec.md`, especialmente as seções "Endpoints da API", "Principais interfaces", "Modelos de dados", "Monitoramento e observabilidade" e a etapa 1 da "Ordem de construção".

## Critérios de sucesso

- O endpoint retorna apenas figurinhas da seção solicitada quando `sectionId` é informado.
- O endpoint retorna visão consolidada paginada quando `sectionId` é omitido.
- Os campos de quantidade/status refletem corretamente a coleção do usuário autenticado.
- Consultas inválidas retornam status HTTP consistente com a API atual.
- Métricas diferenciam `scope=section` e `scope=all`.

## Testes da tarefa

- [x] Testes unitários de validação e mapeamento de `CollectionStickerSummary`.
- [x] Testes unitários de cálculo de `status`, `owned` e `duplicateCount`.
- [x] Testes de integração do endpoint com `sectionId`.
- [x] Testes de integração do endpoint sem `sectionId`.
- [x] Testes de integração de autenticação, autorização e `sectionId` inválido.
- [x] Testes E2E (se aplicável): cobertos na tarefa 4.0.

## Notas de implementação

- Criado `GET /api/v1/albums/:albumId/collection/stickers?sectionId&limit&offset`.
- A listagem usa paginação real em `stickers` e busca `collection_items` apenas para os stickers retornados na página.
- `sectionId` opcional representa a visão consolidada; quando informado, a API valida que a seção pertence ao álbum via Supabase/RLS.
- Adicionadas métricas `collection_sticker_list_total{scope,outcome}` e `collection_sticker_list_duration_seconds{scope,outcome}`.
- Adicionado log estruturado `collection_sticker_list` com `userId`, `albumId`, `sectionId`, paginação, quantidade de itens e duração, sem tokens.

## Verificação

- `pnpm --filter @albumcheio/api test`: 25 arquivos, 85 testes passando.
- `pnpm --filter @albumcheio/api build`: passou.

## Arquivos relevantes

- `tasks/prd-melhorias-usabilidade-performance-colecao/prd.md`
- `tasks/prd-melhorias-usabilidade-performance-colecao/techspec.md`
- `apps/api/src/modules/collections/collections.controller.ts`
- `apps/api/src/modules/collections/collections.service.ts`
- `apps/api/src/modules/collections/collections.types.ts`
- `apps/api/src/modules/collections/collections.validation.ts`
- `apps/api/src/modules/collections/data/collections.repository.ts`
- `apps/api/src/modules/supabase/supabase-client.ts`
- `apps/api/src/modules/observability/metrics.service.ts`
- `apps/api/src/modules/observability/structured-logger.service.ts`
- `apps/api/src/modules/collections/collections.service.test.ts`
- `apps/api/src/modules/collections/collections.validation.test.ts`
- `apps/api/src/modules/collections/collections.integration.test.ts`
- `apps/api/src/modules/supabase/supabase-client.test.ts`
- `apps/api/src/modules/observability/metrics.service.test.ts`
- `apps/api/src/modules/observability/structured-logger.service.test.ts`
