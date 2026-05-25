# Tarefa 4.0: Implementar API de catálogo de álbuns, seções e figurinhas

## Visão geral

Implementar os endpoints e regras de domínio para criação, consulta e listagem do catálogo compartilhado de álbuns, seções e figurinhas.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de NestJS, validação e Supabase/PostgreSQL.
- `.agents/skills/nodejs-typescript-conventions`: manter DTOs, services e repositories em TypeScript tipado.
- `.agents/skills/repo-folder-structure`: preservar fluxo `controllers -> services -> data`.
- `.agents/skills/vitest-testing`: cobrir regras de catálogo e endpoints de integração.
- `.agents/skills/code-standards-en`: manter nomes e arquivos em inglês.
</skills>

<requirements>

- Permitir criar álbuns com nome, edição e descrição.
- Permitir criar seções vinculadas a álbuns.
- Permitir criar figurinhas vinculadas a álbum e seção.
- Normalizar códigos com `trim` e uppercase antes de validação e busca.
- Impedir ambiguidade de código dentro do mesmo álbum.
- Permitir listar álbuns e consultar detalhes com seções resumidas.
- Permitir listar ou filtrar figurinhas por seção e código.
</requirements>

## Subtarefas

- [x] 4.1 Criar `AlbumsModule` com endpoints de listagem, criação e detalhe.
- [x] 4.2 Criar suporte a seções de álbum com `kind`, código e ordenação.
- [x] 4.3 Criar `StickersModule` ou submódulo equivalente para cadastro e listagem de figurinhas.
- [x] 4.4 Implementar normalização e validação de códigos de figurinhas.
- [x] 4.5 Mapear conflito de código por álbum para status `409`.
- [x] 4.6 Implementar paginação `limit` e `offset` nas listagens.
- [x] 4.7 Garantir que endpoints de escrita exigem usuário autenticado.
- [x] 4.8 Retornar DTOs adequados para telas de lista e detalhe.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Modelos de dados", "Endpoints da API", "Principais interfaces" e "Considerações técnicas".

### Notas de implementação

- Criados `AlbumsModule` e `StickersModule` em `apps/api/src/modules`, registrados no `AppModule`.
- Endpoints implementados sob `/api/v1/albums` e `/api/v1/albums/:albumId/stickers`, protegidos por `SupabaseAuthGuard`.
- `controllers -> services -> data` preservado com repositories que encapsulam o client Supabase REST.
- Códigos de seções e figurinhas são normalizados com `trim` e uppercase antes de inserção e filtro.
- Erros PostgreSQL `23505` são mapeados para `409 Conflict`, cobrindo a constraint `unique(album_id, code)` de figurinhas e seções.
- Listagens retornam `{ items, limit, offset }` para consumo previsível no frontend.

## Critérios de sucesso

- Usuário autenticado consegue criar álbum, seção e figurinha manualmente.
- Códigos duplicados no mesmo álbum são recusados.
- Listagens paginadas retornam dados consistentes para o frontend.
- Catálogo permanece compartilhado sem misturar dados privados de coleção.

## Testes da tarefa

- [x] Testes unitários: normalização de código, validações de DTOs e regras de conflito.
- [x] Testes de integração: criar álbum, seção, figurinha, consultar detalhe e listar figurinhas com filtros.
- [x] Testes E2E: não obrigatório nesta tarefa; fluxo completo será coberto na tarefa 9.

### Verificação

- `pnpm --filter @albumcheio/api test` - 14 arquivos, 41 testes passando.
- `pnpm --filter @albumcheio/api build` - build NestJS concluído com sucesso.

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/api/src/modules/albums/**`
- `apps/api/src/modules/stickers/**`
- `apps/api/src/modules/supabase/supabase-client.ts`
- `apps/api/src/modules/supabase/supabase.types.ts`
- `apps/api/src/modules/auth/supabase-error.mapper.ts`
