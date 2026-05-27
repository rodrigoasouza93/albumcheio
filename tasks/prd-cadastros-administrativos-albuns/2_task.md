# Tarefa 2.0: Implementar APIs administrativas de catálogo e regras de consumo de álbuns

## Visão geral

Completar a API de catálogo para edição, remoção e publicação/despublicação, protegendo operações administrativas e ajustando leituras para diferenciar admin de usuário comum.

<skills>
### Conformidade com skills

- `express-rest-http`: desenho REST-ish dos endpoints e status HTTP.
- `nodejs-typescript-conventions`: serviços, tipos e validações TypeScript.
- `supabase`: operações PostgREST sob RLS.
- `vitest-testing`: testes unitários e integração da API.
</skills>

<requirements>

- Proteger criação, edição, remoção e status de álbuns, seções e figurinhas com autorização admin.
- Criar endpoints administrativos previstos na Tech Spec.
- Listar apenas álbuns `published` para usuários comuns.
- Permitir que admins vejam álbuns `draft`, `published` e `archived`.
- Preservar acesso de usuários comuns à coleção existente quando um álbum for despublicado.
- Retornar 401 para não autenticado e 403 para autenticado sem permissão.

</requirements>

## Subtarefas

- [x] 2.1 Adicionar validadores para update parcial, status de álbum e IDs de recursos filhos.
- [x] 2.2 Implementar endpoints de edição, remoção/descontinuação e status de álbuns.
- [x] 2.3 Implementar endpoints de edição e remoção/descontinuação de seções.
- [x] 2.4 Implementar endpoints de edição e remoção/descontinuação de figurinhas.
- [x] 2.5 Ajustar serviços e repositórios para diferenciar leituras de admin e usuário comum.
- [x] 2.6 Ajustar endpoints de coleção para manter continuidade após despublicação.
- [x] 2.7 Mapear erros de RLS/autorização para respostas HTTP consistentes.

## Detalhes de implementação

Seguir `techspec.md`, principalmente "Endpoints da API", "Visão dos componentes" e "Riscos conhecidos". Preferir reaproveitar controllers, services, repositories e validadores existentes.

## Critérios de sucesso

- Admin consegue criar, editar, remover/descontinuar, publicar e despublicar catálogo pela API.
- Usuário comum recebe 403 ao tentar qualquer mutação administrativa.
- Usuário comum vê apenas álbuns publicados na listagem.
- Admin vê todos os status de álbum na listagem.
- Usuário comum mantém acesso aos dados de coleção existentes após despublicação.

## Testes da tarefa

- [x] Testes unitários de services e validators.
- [x] Testes unitários de mapeamento de erros de autorização.
- [x] Testes de integração dos endpoints administrativos com usuário admin.
- [x] Testes de integração dos endpoints administrativos com usuário comum.
- [x] Testes de integração das regras de listagem e continuidade de coleção.

## Notas de implementação

- Adicionados validadores de update parcial para álbuns, seções e figurinhas, incluindo normalização de códigos e validação de `status`.
- Adicionados endpoints administrativos `PATCH /albums/:albumId`, `DELETE /albums/:albumId`, `PATCH /albums/:albumId/status`, `PATCH/DELETE /albums/:albumId/sections/:sectionId` e `PATCH/DELETE /albums/:albumId/stickers/:stickerId`.
- `DELETE /albums/:albumId` arquiva o álbum (`status = archived`) para evitar perda de coleção por cascade.
- Leituras de admin versus usuário comum e continuidade após despublicação permanecem aplicadas por `profiles.role`, `AdminGuard`, mapeamento Supabase e políticas RLS da task 1.
- Endpoints de coleção foram preservados para operar sobre os dados visíveis por RLS, incluindo álbuns despublicados já vinculados à coleção do usuário.

## Verificação

- `pnpm --filter @albumcheio/api test`
- `pnpm --filter @albumcheio/api build`
- `git diff --check`

## Arquivos relevantes

- `tasks/prd-cadastros-administrativos-albuns/techspec.md`
- `apps/api/src/modules/albums/albums.controller.ts`
- `apps/api/src/modules/albums/albums.service.ts`
- `apps/api/src/modules/albums/data/albums.repository.ts`
- `apps/api/src/modules/albums/albums.validation.ts`
- `apps/api/src/modules/stickers/stickers.controller.ts`
- `apps/api/src/modules/stickers/stickers.service.ts`
- `apps/api/src/modules/stickers/data/stickers.repository.ts`
- `apps/api/src/modules/collections/collections.controller.ts`
- `apps/api/src/modules/collections/collections.service.ts`
- `apps/api/src/modules/supabase/supabase-client.ts`
