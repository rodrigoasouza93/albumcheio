# Especificação técnica

## Resumo executivo

A solução será estruturada como uma aplicação web em Next.js com React, TypeScript e Tailwind, consumindo uma API NestJS em TypeScript. O Supabase será usado como plataforma inicial de autenticação por e-mail/senha e banco PostgreSQL, mantendo o caminho aberto para PostgreSQL gerenciado fora do Supabase no futuro.

O domínio será dividido entre catálogo compartilhado de álbuns, seções e figurinhas, e registros privados de coleção por usuário. O progresso não será persistido como dado primário: será calculado a partir das quantidades registradas, reduzindo inconsistência entre posse, faltantes, repetidas e percentuais.

## Arquitetura do sistema

### Visão dos componentes

- `apps/web`: frontend Next.js App Router com páginas protegidas, formulários de cadastro/login, listagem de álbuns, detalhe do álbum, busca por código, faltantes e repetidas.
- `features/auth`: UI e hooks para cadastro, login, logout e sessão autenticada.
- `features/albums`: UI de catálogo para criação de álbuns, seções e figurinhas.
- `features/collection`: UI para marcar posse, alterar quantidade, consultar código e visualizar progresso.
- `apps/api`: API NestJS com módulos `AuthModule`, `ProfilesModule`, `AlbumsModule`, `StickersModule`, `CollectionsModule` e `SupabaseModule`.
- `SupabaseModule`: encapsula clientes Supabase, separando cliente com JWT do usuário para dados protegidos e cliente administrativo apenas para operações inevitáveis de autenticação.
- PostgreSQL/Supabase: guarda catálogo, perfis e coleções; aplica constraints, índices e Row Level Security para dados por usuário.

Fluxo principal: o usuário autentica no frontend, o backend valida a sessão Supabase, executa regras de domínio nos services NestJS, persiste no PostgreSQL e retorna DTOs otimizados para as telas. O frontend nunca calcula autorização; ele apenas reflete permissões e erros vindos da API.

## Design de implementação

### Principais interfaces

```ts
export interface AuthService {
  register(input: RegisterUserInput): Promise<AuthSession>;
  login(input: LoginInput): Promise<AuthSession>;
  getProfile(userId: string): Promise<UserProfile>;
}

export interface AlbumCatalogService {
  createAlbum(userId: string, input: CreateAlbumInput): Promise<Album>;
  createSection(userId: string, input: CreateSectionInput): Promise<AlbumSection>;
  createSticker(userId: string, input: CreateStickerInput): Promise<Sticker>;
  searchSticker(input: SearchStickerInput): Promise<StickerSearchResult>;
}

export interface CollectionService {
  setStickerQuantity(userId: string, input: SetStickerQuantityInput): Promise<CollectionItem>;
  getAlbumProgress(userId: string, albumId: string): Promise<AlbumProgress>;
  listMissing(userId: string, albumId: string, query: PageQuery): Promise<StickerPage>;
  listDuplicates(userId: string, albumId: string, query: PageQuery): Promise<DuplicatePage>;
}
```

### Modelos de dados

- `profiles`: `id` UUID referenciando `auth.users`, `name`, `created_at`, `updated_at`.
- `albums`: `id`, `name`, `edition`, `description`, `created_by`, `status`, timestamps.
- `album_sections`: `id`, `album_id`, `name`, `code`, `kind` (`tournament`, `team`, `custom`), `sort_order`.
- `stickers`: `id`, `album_id`, `section_id`, `code`, `number`, `title`, `sort_order`, timestamps. Constraint principal: `unique(album_id, code)`.
- `collection_items`: `id`, `user_id`, `sticker_id`, `quantity_total`, timestamps. Constraints: `unique(user_id, sticker_id)` e `quantity_total >= 0`.

`duplicate_count` será derivado como `max(quantity_total - 1, 0)`. Uma figurinha é considerada possuída quando `quantity_total > 0`. Códigos serão normalizados com `trim` e uppercase antes de validação e busca.

### Endpoints da API

- `POST /api/v1/auth/register`: cadastra usuário por nome, e-mail e senha.
- `POST /api/v1/auth/login`: autentica usuário por e-mail e senha.
- `POST /api/v1/auth/logout`: encerra a sessão atual.
- `GET /api/v1/me`: retorna perfil do usuário autenticado.
- `GET /api/v1/albums?limit&offset`: lista álbuns cadastrados.
- `POST /api/v1/albums`: cria álbum compartilhado.
- `GET /api/v1/albums/:albumId`: retorna álbum com seções resumidas.
- `POST /api/v1/albums/:albumId/sections`: cria seção do álbum.
- `POST /api/v1/albums/:albumId/stickers`: cria figurinha vinculada a seção.
- `GET /api/v1/albums/:albumId/stickers?sectionId&code&limit&offset`: lista ou filtra figurinhas.
- `GET /api/v1/albums/:albumId/collection/search?code=FWC01`: retorna status da figurinha para o usuário.
- `PATCH /api/v1/collection-items/:stickerId`: define `quantity_total` do usuário.
- `GET /api/v1/albums/:albumId/progress`: retorna progresso geral e por seção.
- `GET /api/v1/albums/:albumId/missing?sectionId&limit&offset`: lista faltantes.
- `GET /api/v1/albums/:albumId/duplicates?sectionId&limit&offset`: lista repetidas.

Erros de validação usam `400`, conflitos de unicidade usam `409`, violações de regra de negócio usam `422`, autenticação usa `401`, autorização usa `403` e ausência de recurso usa `404`.

## Pontos de integração

- Supabase Auth: cadastro e login por e-mail/senha; o nome ficará em `profiles`.
- Supabase PostgreSQL: persistência via migrations SQL versionadas no repositório.
- Supabase RLS: tabelas com dados privados (`profiles`, `collection_items`) devem restringir acesso por `auth.uid()`. Catálogo pode ser legível por usuários autenticados e gravável por usuários autenticados no MVP.
- Variáveis sensíveis: `SUPABASE_SERVICE_ROLE_KEY` somente no backend; frontend usa apenas chaves publicáveis necessárias.
- Não haverá integração com Panini, FIFA, importação automática, OCR, QR code ou marketplace no MVP.

## Abordagem de testes

### Testes unitários

- Services NestJS: normalização de código, cálculo de progresso, cálculo de repetidas, validação de quantidade e tratamento de sticker inexistente.
- Guards/interceptors: validação de usuário autenticado e tradução de erros Supabase.
- Componentes React: busca por código, contador de quantidade, estados de posse/faltante/repetida e cards de progresso.
- Hooks frontend: estados de loading, erro, sucesso e invalidação de cache após alteração de quantidade.

### Testes de integração

- Endpoints de autenticação, catálogo e coleção usando banco Supabase local ou schema isolado de teste.
- Constraints de banco: unicidade de código por álbum, quantidade não negativa e isolamento de `collection_items` por usuário.
- Fluxos API: criar álbum, criar seção, criar figurinha, marcar quantidade, consultar código, listar faltantes e repetidas.

### Testes E2E

- Playwright cobrindo cadastro/login, criação de álbum básico, cadastro de seção/figurinha, marcação de posse, busca por código e visualização de progresso.
- Cenários mobile devem validar leitura dos códigos, navegação entre faltantes/repetidas e ausência de dependência exclusiva de cor.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Scaffold do monorepo com `apps/web`, `apps/api`, configuração TypeScript, Tailwind, lint, testes e variáveis de ambiente.
2. Supabase: migrations iniciais, constraints, índices, RLS e seed mínimo para testes.
3. API de autenticação e perfis, pois todos os fluxos dependem de usuário autenticado.
4. API de catálogo: álbuns, seções e figurinhas, incluindo unicidade de código.
5. API de coleção: quantidade, busca por código, progresso, faltantes e repetidas.
6. Frontend autenticado: telas de login/cadastro, lista de álbuns e detalhe do álbum.
7. Frontend de coleção: busca rápida, marcação de quantidade, progresso, faltantes e repetidas.
8. Testes E2E, ajustes de acessibilidade e observabilidade.

### Dependências técnicas

- Projeto Supabase configurado para desenvolvimento e produção.
- SMTP ou configuração de e-mail do Supabase definida antes de produção, caso confirmação de e-mail seja exigida.
- Estratégia de deploy para Next.js, NestJS e variáveis secretas.
- Definição de URL pública da API e política de CORS.

## Monitoramento e observabilidade

- API NestJS deve expor métricas em formato Prometheus, incluindo `http_requests_total`, `http_request_duration_seconds`, `auth_failures_total`, `collection_updates_total`, `sticker_search_total` e `progress_calculation_duration_seconds`.
- Logs estruturados devem incluir `requestId`, `userId` quando autenticado, rota, status, duração e código de erro de domínio sem registrar senha, token ou dados sensíveis.
- Dashboards Grafana devem acompanhar latência p95 da API, taxa de erro 4xx/5xx, volume de buscas por código e volume de atualização de coleção.
- Alertas mínimos: falha elevada de login, aumento de 5xx, latência alta em progresso e erros de integração com Supabase.

## Considerações técnicas

### Principais decisões

- Usar Supabase Auth para e-mail/senha reduz risco de armazenamento indevido de senhas e mantém JWT integrado ao PostgreSQL/RLS.
- Manter catálogo compartilhado e coleção privada evita duplicar a estrutura do álbum para cada usuário.
- Persistir `quantity_total` como fonte única simplifica posse e repetidas.
- Calcular progresso sob demanda evita inconsistência; se houver degradação, criar views/materializações será uma evolução compatível.
- Permitir cadastro manual no MVP evita dependência de checklists oficiais que podem variar por edição, país ou produto.

### Riscos conhecidos

- RLS incorreta pode expor coleção de outro usuário; mitigar com testes de integração multiusuário e revisão de migrations.
- Uso indevido da service role no backend pode contornar RLS; mitigar isolando esse cliente e preferindo consultas com JWT do usuário.
- Catálogo criado por qualquer usuário pode gerar duplicações de álbuns equivalentes; mitigar depois com moderação, ownership ou status de publicação.
- Agregações de progresso podem ficar caras com álbuns grandes; mitigar com índices em `stickers(album_id, section_id, code)` e `collection_items(user_id, sticker_id)`.

### Conformidade com rules

- Não há pasta `.claude/rules` neste repositório no momento da análise.

### Conformidade com skills

- `.agents/skills/context7`: usado para consultar documentação técnica de Next.js, NestJS e Supabase.
- `.agents/skills/nodejs-typescript-conventions`: TypeScript, ESM, tipagem explícita e npm.
- `.agents/skills/react-frontend-conventions`: React funcional, Tailwind, hooks e testes de componentes.
- `.agents/skills/repo-folder-structure`: separação por features no frontend e módulos/camadas no backend.
- `.agents/skills/vitest-testing`: Vitest para unitários e integração; Playwright para E2E.
- `.agents/skills/code-standards-en`: identificadores em inglês, funções verbais e CQS.

### Arquivos relevantes e dependentes

- `tasks/prd-gestao-figurinhas-albuns/prd.md`
- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `create_techspec.md`
- `.agents/skills/context7/SKILL.md`
- `.agents/skills/nodejs-typescript-conventions/SKILL.md`
- `.agents/skills/react-frontend-conventions/SKILL.md`
- `.agents/skills/repo-folder-structure/SKILL.md`
- `.agents/skills/vitest-testing/SKILL.md`
- `.agents/skills/code-standards-en/SKILL.md`
- `apps/web/**` (a criar)
- `apps/api/**` (a criar)
- `supabase/migrations/**` (a criar)
