# Tarefa 3.0: Atualizar frontend para separar experiência de admin e usuário comum

## Visão geral

Atualizar a interface para que administradores tenham acesso aos controles de catálogo e usuários comuns tenham uma experiência focada apenas em consumo de álbuns ativos e atualização da própria coleção.

<skills>
### Conformidade com skills

- `react-frontend-conventions`: componentes funcionais, estado local e testes de componentes.
- `ui-ux-pro-max`: separação clara de experiência, acessibilidade e usabilidade.
- `nodejs-typescript-conventions`: contratos TypeScript compartilhados.
- `vitest-testing`: testes de componentes React.
</skills>

<requirements>

- Expor `role` no contrato usado pelo frontend.
- Exibir formulários e ações administrativas apenas para admin.
- Ocultar controles administrativos de usuários comuns.
- Mostrar status de publicação para administradores com texto claro.
- Permitir publicar/despublicar álbuns pela interface de admin.
- Manter a experiência de coleção simples para usuários comuns.
- Exibir mensagens adequadas para acesso indisponível ou negado.

</requirements>

## Subtarefas

- [x] 3.1 Atualizar tipos e client HTTP para role e novos endpoints administrativos.
- [x] 3.2 Ajustar contexto/sessão autenticada para disponibilizar role.
- [x] 3.3 Atualizar página de listagem de álbuns para comportamento por perfil.
- [x] 3.4 Atualizar página de detalhes para ocultar/exibir formulários de catálogo por role.
- [x] 3.5 Adicionar controles de publicação/despublicação para admin.
- [x] 3.6 Ajustar mensagens e estados de erro para álbuns indisponíveis ou acesso negado.
- [x] 3.7 Revisar acessibilidade dos controles administrativos e estados de status.

## Detalhes de implementação

Seguir `techspec.md`, principalmente "Visão dos componentes", "Endpoints da API" e "Principais decisões". Não criar tela de gestão de usuários/admins.

## Critérios de sucesso

- Admin vê e usa controles de cadastro, edição e publicação.
- Usuário comum não vê botões ou formulários administrativos.
- Usuário comum vê apenas álbuns ativos na listagem.
- Status ativo/inativo aparece com texto claro para admin.
- Fluxos de coleção existentes permanecem funcionais para usuário comum.

## Testes da tarefa

- [x] Testes unitários/componentes para renderização admin.
- [x] Testes unitários/componentes para renderização usuário comum.
- [x] Testes de client HTTP para novos endpoints administrativos.
- [x] Testes de acessibilidade dos controles principais quando aplicável.
- [x] Testes de integração frontend com mocks de API para estados 401/403/404.

## Notas de implementação

- `UserProfile` agora expõe `role`, e álbuns usam `AlbumStatus` tipado como `draft`, `published` ou `archived`.
- A listagem renderiza criação e status somente para admins; usuários comuns veem apenas a experiência de consumo retornada pela API.
- O detalhe do álbum exibe status textual e botões de publicar/despublicar para admins, mantendo a coleção focada para usuários comuns.
- Mensagens 403/404 no detalhe e 403 na listagem foram ajustadas para indicar acesso indisponível ou negado sem expor detalhes internos.

## Verificação

- `pnpm --filter @albumcheio/web test`
- `pnpm --filter @albumcheio/web build`

## Arquivos relevantes

- `tasks/prd-cadastros-administrativos-albuns/techspec.md`
- `apps/web/src/lib/api/api-types.ts`
- `apps/web/src/lib/api/http-client.ts`
- `apps/web/src/features/auth/hooks/session-context.tsx`
- `apps/web/src/features/auth/components/authenticated-shell.tsx`
- `apps/web/src/features/albums/components/albums-page.tsx`
- `apps/web/src/features/albums/components/album-detail-page.tsx`
- `apps/web/src/features/albums/components/create-album-form.tsx`
- `apps/web/src/features/albums/components/create-section-form.tsx`
- `apps/web/src/features/albums/components/create-sticker-form.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.tsx`
- `apps/web/src/lib/api/http-client.test.ts`
- `apps/web/src/features/albums/components/albums-page.test.tsx`
- `apps/web/src/features/albums/components/album-detail-page.test.tsx`
- `apps/web/src/features/auth/components/auth-form.test.tsx`
