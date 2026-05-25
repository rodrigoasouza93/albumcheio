# Tarefa 5.0: Implementar API de coleção, busca por código, progresso, faltantes e repetidas

## Visão geral

Implementar os endpoints privados de coleção para registrar quantidade total por figurinha, consultar status por código e calcular progresso geral, progresso por seção, faltantes e repetidas.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de NestJS, Supabase/PostgreSQL e agregações.
- `.agents/skills/nodejs-typescript-conventions`: manter services e DTOs em TypeScript tipado.
- `.agents/skills/repo-folder-structure`: manter regras de domínio nos services e persistência na camada data.
- `.agents/skills/vitest-testing`: cobrir cálculo de progresso, repetidas e endpoints multiusuário.
- `.agents/skills/code-standards-en`: manter nomes de domínio claros em inglês.
  </skills>

<requirements>

- Permitir definir `quantity_total` por usuário e figurinha.
- Considerar figurinha possuída quando `quantity_total > 0`.
- Calcular repetidas como `max(quantity_total - 1, 0)`.
- Permitir corrigir ou remover posse ajustando quantidade.
- Pesquisar figurinha por código dentro de um álbum para o usuário autenticado.
- Diferenciar figurinha inexistente de figurinha cadastrada mas não possuída.
- Calcular progresso geral e por seção sob demanda.
- Listar faltantes e repetidas com paginação e filtro por seção.
- Garantir isolamento entre usuários em todos os endpoints.
  </requirements>

## Subtarefas

- [x] 5.1 Criar `CollectionsModule` e service de coleção.
- [x] 5.2 Implementar `PATCH /api/v1/collection-items/:stickerId`.
- [x] 5.3 Implementar busca privada por código no álbum.
- [x] 5.4 Implementar cálculo de progresso geral com total, possuídas, faltantes e percentual.
- [x] 5.5 Implementar cálculo de progresso por seção.
- [x] 5.6 Implementar listagem paginada de faltantes.
- [x] 5.7 Implementar listagem paginada de repetidas com `duplicate_count` derivado.
- [x] 5.8 Validar quantidade negativa, figurinha inexistente e acesso multiusuário.
- [x] 5.9 Medir pontos necessários para métricas futuras de busca, atualização e progresso.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Principais interfaces", "Modelos de dados", "Endpoints da API", "Abordagem de testes", "Monitoramento e observabilidade" e "Riscos conhecidos".

## Critérios de sucesso

- Usuário autenticado registra, corrige e remove quantidade de figurinha.
- Busca por código retorna status de possuída, faltante, repetida ou inexistente.
- Progresso geral e por seção é calculado a partir de `quantity_total`, sem persistir percentuais como fonte primária.
- Faltantes e repetidas respeitam usuário autenticado, álbum, seção e paginação.

## Testes da tarefa

- [x] Testes unitários: quantidade, repetidas, posse, progresso, normalização de código e erros de domínio.
- [x] Testes de integração: atualizar quantidade, buscar código, listar faltantes/repetidas e validar isolamento multiusuário.
- [x] Testes E2E: não obrigatório nesta tarefa; fluxo completo será coberto na tarefa 9.

## Implementação

- Criado `CollectionsModule` com controller, service, repository, validações e tipos de resposta.
- Adicionados endpoints privados `PATCH /api/v1/collection-items/:stickerId`, `GET /api/v1/albums/:albumId/collection/search`, `GET /api/v1/albums/:albumId/progress`, `GET /api/v1/albums/:albumId/missing` e `GET /api/v1/albums/:albumId/duplicates`.
- `quantity_total` é persistido por usuário e figurinha via upsert em `collection_items`; posse e repetidas são derivadas de `quantity_total`.
- Busca por código normaliza `trim` e uppercase e diferencia `not_found`, `missing`, `owned` e `duplicate`.
- Progresso geral e por seção é calculado sob demanda a partir de figurinhas do álbum e itens de coleção do usuário autenticado.
- Faltantes e repetidas aplicam filtro opcional por seção e paginação após o cálculo de status.
- Pontos para métricas futuras ficam concentrados em `setStickerQuantity`, `searchSticker`, `getAlbumProgress`, `listMissing` e `listDuplicates`, alinhados às métricas previstas em `techspec.md`.

## Verificação

- `pnpm --filter @albumcheio/api test`
- `pnpm --filter @albumcheio/api build`
- `pnpm run lint`

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/api/src/modules/collections/**`
- `apps/api/src/modules/supabase/supabase-client.ts`
- `apps/api/src/modules/supabase/supabase.types.ts`
- `apps/api/src/modules/app.module.ts`
