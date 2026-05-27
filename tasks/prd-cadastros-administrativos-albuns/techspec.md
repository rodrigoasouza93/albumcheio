# Especificação técnica

## Resumo executivo

A solução adiciona autorização administrativa explícita ao catálogo compartilhado, mantendo a coleção pessoal isolada por usuário. O papel administrativo será persistido em `profiles.role`, com `user` como padrão e `admin` como valor privilegiado. A API NestJS passará a carregar esse perfil na autenticação ou em um guard dedicado, expondo operações administrativas somente para admins.

No banco, RLS continuará sendo a barreira final: usuários comuns podem ler catálogos publicados e suas próprias coleções; admins podem ler e alterar catálogos em qualquer status. `albums.status = 'published'` representa álbum ativo, enquanto `draft` e `archived` são inativos para consumo comum. Mesmo após despublicação, usuários comuns continuam podendo consultar e atualizar a coleção já existente por endpoints de coleção, sem receber o álbum inativo na listagem pública.

## Arquitetura do sistema

### Visão dos componentes

- `profiles`: acrescenta `role` para representar autorização de produto. Mantido diretamente no banco, sem UI de gestão.
- `SupabaseAuthGuard`: continua validando o JWT e deve enriquecer `request.user` com dados mínimos de perfil, incluindo `role`, ou delegar essa leitura para um `AdminGuard`.
- `AdminGuard`: novo guard para rotas de catálogo mutáveis. Retorna 403 quando o usuário autenticado não for admin.
- `AlbumsController` e `AlbumsService`: passam a suportar edição, remoção/descontinuação, publicação e despublicação de álbuns.
- `StickersController` e serviço: passam a suportar edição e remoção/descontinuação de figurinhas, protegidos por admin.
- `Album sections`: fluxo atual de criação será complementado com edição e remoção/descontinuação, protegido por admin.
- `CollectionsController` e serviço: continuam usando identidade do usuário comum para coleção própria; devem validar acesso ao catálogo de forma compatível com álbuns despublicados já usados em coleções.
- `SupabaseClient`: adiciona operações REST para update/delete/patch de álbuns, seções, figurinhas e leitura de perfil com role.
- `apps/web` páginas de álbum: renderizam formulários de catálogo apenas para admin; usuário comum vê catálogo publicado e coleção.
- `Observability`: adiciona métricas para bloqueios de autorização e mutações administrativas.

Fluxo de dados: o usuário autentica, a API valida token, obtém `profiles.role`, aplica guards por rota, chama serviços e repositórios, e o Supabase aplica RLS nas tabelas. O frontend usa o perfil retornado pela sessão/me para decidir quais controles exibir, mas a segurança real permanece na API e no banco.

## Design de implementação

### Principais interfaces

```ts
export type ProfileRole = 'user' | 'admin';

export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string | null;
  readonly name: string | null;
  readonly role: ProfileRole;
  readonly accessToken: string;
}
```

```ts
export interface CatalogAuthorizationService {
  requireAdmin(user: AuthenticatedUser): void;
  canConsumeAlbum(input: {
    readonly userId: string;
    readonly albumId: string;
  }): Promise<boolean>;
}
```

```ts
export interface UpdateAlbumStatusInput {
  readonly albumId: string;
  readonly status: 'draft' | 'published' | 'archived';
  readonly accessToken: string;
}
```

### Modelos de dados

- `profiles.role text not null default 'user'`: constraint `role in ('user', 'admin')`.
- `albums.status`: manter constraint existente `draft | published | archived`; `published` é ativo.
- `AlbumSummary.status`: tipar como `AlbumStatus` em API e web.
- `UserProfile.role`: incluir role no contrato retornado por login, registro e `/me`.
- `collection_items`: sem mudança estrutural; isolamento por `user_id` permanece.

RLS proposta:

- `profiles`: usuário lê/atualiza somente dados próprios, mas não deve conseguir alterar `role`. A coluna deve ser protegida por política, trigger ou separação de operação para impedir autopromoção.
- `albums select`: admins veem todos; usuários comuns veem `status = 'published'` ou álbuns ligados à própria coleção quando a rota de coleção exigir continuidade após despublicação.
- `albums insert/update/delete`: somente admin.
- `album_sections` e `stickers select`: admins veem todos; usuários comuns veem registros de álbuns publicados ou necessários para coleções próprias existentes.
- `album_sections` e `stickers insert/update/delete`: somente admin.
- `collection_items`: usuário opera apenas `user_id = auth.uid()`. Mutação de coleção continua permitida para stickers já vinculadas à coleção do usuário, mesmo se o álbum for despublicado.

Usar função estável de autorização no banco, por exemplo `public.is_admin()`, baseada em `profiles.role`. A documentação Supabase recomenda RLS em tabelas expostas, `to authenticated`, `(select auth.uid())` para performance e evitar dados editáveis pelo usuário para autorização; por isso `profiles.role` precisa ser protegido contra escrita comum.

### Endpoints da API

- `GET /api/v1/albums`: lista `published` para usuário comum; lista todos para admin.
- `POST /api/v1/albums`: cria álbum em `draft`; admin only.
- `GET /api/v1/albums/:albumId`: retorna álbum se admin, se `published`, ou se usuário tiver coleção relacionada.
- `PATCH /api/v1/albums/:albumId`: edita metadados; admin only.
- `DELETE /api/v1/albums/:albumId`: remove ou arquiva conforme decisão de serviço; admin only.
- `PATCH /api/v1/albums/:albumId/status`: publica/despublica definindo `published`, `draft` ou `archived`; admin only.
- `POST /api/v1/albums/:albumId/sections`: cria seção; admin only.
- `PATCH /api/v1/albums/:albumId/sections/:sectionId`: edita seção; admin only.
- `DELETE /api/v1/albums/:albumId/sections/:sectionId`: remove/descontinua seção; admin only.
- `POST /api/v1/albums/:albumId/stickers`: cria figurinha; admin only.
- `PATCH /api/v1/albums/:albumId/stickers/:stickerId`: edita figurinha; admin only.
- `DELETE /api/v1/albums/:albumId/stickers/:stickerId`: remove/descontinua figurinha; admin only.
- Endpoints existentes de coleção (`PATCH /collection-items/:stickerId`, busca, progresso, faltantes e repetidas): continuam autenticados e próprios do usuário.

Formatos seguem os validadores existentes, com novos parsers para status, update parcial e UUIDs de recursos filhos.

## Pontos de integração

Não há novas integrações externas. A funcionalidade depende de Supabase Auth, PostgREST e RLS já existentes. Erros de autorização devem mapear para 403 na API, enquanto falhas de autenticação continuam 401. Erros de RLS vindos do Supabase devem ser traduzidos sem expor detalhes internos.

## Abordagem de testes

### Testes unitários

- `SupabaseAuthGuard` ou `AdminGuard`: usuário admin permitido, usuário comum bloqueado, ausência de perfil tratada.
- Serviços de álbuns/seções/figurinhas: publish/unpublish, update/delete, mapeamento de status e propagação de 403.
- Validadores: `AlbumStatus`, updates parciais, IDs de seção/figurinha.
- Componentes React: formulários administrativos aparecem para admin e não aparecem para usuário comum.

### Testes de integração

- Migrations e RLS: usuário comum não insere/atualiza/remove catálogo; admin consegue.
- Listagem de álbuns: comum vê apenas `published`; admin vê `draft`, `published`, `archived`.
- Álbum despublicado: comum não vê na listagem, mas mantém acesso aos endpoints de coleção relacionados à própria coleção.
- Coleção: usuário comum não altera coleção de outro usuário.
- API de catálogo: endpoints administrativos retornam 403 para comum e sucesso para admin.

### Testes E2E

Usar Playwright para validar frontend junto com backend:

- Admin cria álbum em draft, cadastra seção/figurinha, publica e vê status atualizado.
- Usuário comum vê álbum publicado e atualiza coleção.
- Admin despublica álbum; usuário comum não vê na listagem, mas consegue acessar sua coleção existente por rota/fluxo suportado.
- Usuário comum não vê controles administrativos.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Migration de `profiles.role`, função `is_admin()` e políticas RLS, porque a segurança do catálogo depende disso.
2. Tipos compartilhados e perfil autenticado com `role`, porque API e web precisam do contrato.
3. `AdminGuard` e proteção de rotas mutáveis existentes, para fechar a brecha atual.
4. Endpoints de update/delete/status para álbuns, seções e figurinhas.
5. Ajustes de leitura para `published` versus admin e continuidade de coleção após despublicação.
6. Frontend condicional por role e controles de publicar/despublicar.
7. Testes unitários, integração, E2E e revisão de observabilidade.

### Dependências técnicas

- Supabase local/remoto com migrations aplicadas.
- Usuários de teste com `profiles.role = 'admin'` e `profiles.role = 'user'`.
- Dados seed cobrindo álbuns `draft`, `published` e `archived`.
- Nenhuma nova biblioteca é necessária.

## Monitoramento e observabilidade

Adicionar métricas Prometheus na infraestrutura existente:

- `catalog_admin_mutations_total{resource,action,outcome}` para create/update/delete/status.
- `catalog_authorization_denials_total{resource,action,role}` para bloqueios 403.
- `catalog_album_reads_total{status,role,outcome}` para leitura/listagem.
- Reusar logs estruturados com `userId`, `role`, `albumId`, `resource`, `action` e `outcome`, evitando payloads sensíveis.
- Dashboards Grafana existentes devem acompanhar aumento de 403, falhas de RLS e latência dos endpoints de catálogo.

## Considerações técnicas

### Principais decisões

- Usar `profiles.role` por preferência de produto e simplicidade operacional.
- Manter `published` como único status ativo; `draft` e `archived` ficam inativos para consumo comum.
- Aplicar autorização em camadas: frontend para UX, API para resposta explícita e RLS para defesa em profundidade.
- Não usar `user_metadata` para autorização, pois pode ser editável pelo usuário; usar dado protegido no banco.
- Manter coleção acessível após despublicação para não apagar valor já registrado pelo usuário.

### Riscos conhecidos

- Autopromoção por atualização de `profiles.role`: mitigar bloqueando escrita comum nessa coluna por RLS, trigger ou endpoint controlado.
- Políticas RLS com joins podem afetar performance: mitigar com função estável, índices em `profiles(id, role)`, `albums(status)` e consultas com `(select auth.uid())`.
- Remoção física de seções/figurinhas pode apagar histórico de coleção por cascade: preferir arquivamento/descontinuação quando houver dados relacionados, ou documentar delete destrutivo.
- JWT/perfil em cache pode deixar frontend defasado após alteração manual de role: `/me` deve ser fonte de verdade ao iniciar sessão.

### Conformidade com rules

- `.claude/rules` não existe no repositório durante a análise. Não há rules locais a aplicar.

### Conformidade com skills

- `context7`: usado para consultar documentação atual de Supabase/RLS.
- `supabase`: aplicável a migrations, Auth, RLS e políticas.
- `supabase-postgres-best-practices`: aplicável a RLS, índices e funções estáveis.
- `express-rest-http`: aplicável aos endpoints REST-ish da API NestJS.
- `nodejs-typescript-conventions`: aplicável aos tipos e serviços TypeScript.
- `react-frontend-conventions`: aplicável ao frontend React/Next.
- `vitest-testing`: aplicável a testes unitários e integração.

### Arquivos relevantes e dependentes

- `tasks/prd-cadastros-administrativos-albuns/prd.md`
- `supabase/migrations/20260525120000_create_album_catalog_and_collections.sql`
- `supabase/migrations/20260525183025_tighten_catalog_rls_and_function_search_path.sql`
- `apps/api/src/modules/auth/supabase-auth.guard.ts`
- `apps/api/src/modules/auth/auth.types.ts`
- `apps/api/src/modules/profiles/profiles.service.ts`
- `apps/api/src/modules/albums/albums.controller.ts`
- `apps/api/src/modules/albums/albums.service.ts`
- `apps/api/src/modules/albums/data/albums.repository.ts`
- `apps/api/src/modules/stickers/stickers.controller.ts`
- `apps/api/src/modules/stickers/stickers.service.ts`
- `apps/api/src/modules/collections/collections.controller.ts`
- `apps/api/src/modules/collections/collections.service.ts`
- `apps/api/src/modules/supabase/supabase-client.ts`
- `apps/api/src/modules/supabase/supabase.types.ts`
- `apps/web/src/lib/api/api-types.ts`
- `apps/web/src/lib/api/http-client.ts`
- `apps/web/src/features/albums/components/albums-page.tsx`
- `apps/web/src/features/albums/components/album-detail-page.tsx`
- `apps/web/src/features/auth/hooks/session-context.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.tsx`
