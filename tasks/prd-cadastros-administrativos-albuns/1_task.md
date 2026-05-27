# Tarefa 1.0: Implementar autorização administrativa, role em profiles e RLS do catálogo

## Visão geral

Adicionar a base de autorização administrativa no banco e na autenticação, garantindo que o catálogo compartilhado seja protegido por RLS e que o papel do usuário fique disponível para API e frontend.

<skills>
### Conformidade com skills

- `supabase`: migrations, Auth, RLS e políticas.
- `supabase-postgres-best-practices`: índices, funções estáveis e performance de RLS.
- `nodejs-typescript-conventions`: contratos TypeScript para role e usuário autenticado.
- `vitest-testing`: testes unitários e de integração.
</skills>

<requirements>

- Adicionar `profiles.role` com valores permitidos `user` e `admin`.
- Garantir que `user` seja o papel padrão.
- Impedir autopromoção de usuários comuns.
- Criar autorização de admin reutilizável no banco e na API.
- Ajustar RLS para restringir mutações de catálogo a administradores.
- Preservar isolamento de `collection_items` por usuário.
- Manter admins definidos diretamente na base de dados.

</requirements>

## Subtarefas

- [x] 1.1 Criar migration para `profiles.role`, constraint, padrão e dados existentes.
- [x] 1.2 Criar função/política de autorização administrativa conforme `techspec.md`.
- [x] 1.3 Atualizar políticas RLS de `albums`, `album_sections` e `stickers`.
- [x] 1.4 Garantir que usuários comuns não consigam alterar `profiles.role`.
- [x] 1.5 Atualizar tipos de Supabase/API para incluir role do perfil.
- [x] 1.6 Ajustar autenticação ou guard dedicado para disponibilizar `role` em `AuthenticatedUser`.
- [x] 1.7 Atualizar seeds ou fixtures para usuários admin e comum.

## Detalhes de implementação

Seguir `techspec.md`, principalmente as seções "Modelos de dados", "Principais interfaces" e "Principais decisões". Não criar tela de gestão de administradores.

## Critérios de sucesso

- Usuários comuns não criam, editam, removem, publicam ou despublicam catálogo por acesso direto ao banco/API.
- Administradores definidos em `profiles.role = 'admin'` conseguem operar catálogo.
- `profiles.role` não pode ser alterado pelo próprio usuário comum.
- Coleções continuam isoladas por `user_id`.

## Testes da tarefa

- [x] Testes unitários para guard/autorização administrativa.
- [x] Testes de integração das migrations e RLS.
- [x] Testes de integração para bloqueio de mutações de catálogo por usuário comum.
- [x] Testes de integração para permissão de mutações por admin.

## Notas de implementação

- Criada a migration `supabase/migrations/20260527013818_add_admin_role_and_catalog_rls.sql` com `profiles.role`, default `user`, constraint `user | admin`, índice de apoio, função `public.is_admin()` e trigger para impedir autopromoção por usuários comuns.
- RLS de `albums`, `album_sections` e `stickers` passou a permitir mutações somente via `public.is_admin()`. Leituras comuns ficam restritas a álbuns publicados ou catálogo já vinculado à própria coleção.
- `AuthenticatedUser`, `UserProfile` e `SupabaseProfileRow` agora incluem `role`. `SupabaseAuthGuard` lê o perfil no banco e preenche `request.user.role`.
- Adicionado `AdminGuard` para proteção reutilizável de rotas mutáveis de catálogo já existentes.
- Fixtures de testes foram atualizadas com usuários `admin` e `user`. O `seed.sql` não cria perfis porque `profiles.id` referencia `auth.users(id)`; administradores continuam definidos diretamente no banco.

## Verificação

- `pnpm --filter @albumcheio/api test`

## Arquivos relevantes

- `tasks/prd-cadastros-administrativos-albuns/techspec.md`
- `supabase/migrations/20260525120000_create_album_catalog_and_collections.sql`
- `supabase/migrations/20260525183025_tighten_catalog_rls_and_function_search_path.sql`
- `apps/api/src/modules/auth/supabase-auth.guard.ts`
- `apps/api/src/modules/auth/admin.guard.ts`
- `apps/api/src/modules/auth/auth.types.ts`
- `apps/api/src/modules/profiles/profiles.service.ts`
- `apps/api/src/modules/supabase/supabase.types.ts`
- `apps/api/src/integration/supabase-schema.test.ts`
- `supabase/migrations/20260527013818_add_admin_role_and_catalog_rls.sql`
