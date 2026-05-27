# Tarefa 4.0: Implementar testes, observabilidade e validação E2E

Status: concluída em 2026-05-26.

## Visão geral

Consolidar a entrega com métricas, logs estruturados e cobertura de testes ponta a ponta para garantir que a separação admin/usuário comum funcione no fluxo real.

<skills>
### Conformidade com skills

- `vitest-testing`: testes unitários e integração com mocks e fixtures.
- `react-frontend-conventions`: testes de componentes e fluxos React.
- `supabase`: validação de RLS e dados de teste.
- `ui-ux-pro-max`: validação de UX e acessibilidade.
</skills>

<requirements>

- Adicionar métricas de mutações administrativas, bloqueios de autorização e leituras de catálogo.
- Registrar logs estruturados sem dados sensíveis.
- Cobrir jornada admin completa com E2E.
- Cobrir jornada usuário comum completa com E2E.
- Validar que despublicação remove álbum da listagem comum sem apagar acesso à coleção existente.
- Atualizar documentação da tarefa com verificações executadas.

</requirements>

## Subtarefas

- [x] 4.1 Adicionar métricas Prometheus previstas na Tech Spec.
- [x] 4.2 Adicionar logs estruturados para ações administrativas e bloqueios 403.
- [x] 4.3 Criar/ajustar fixtures ou seeds para admin, usuário comum e álbuns por status.
- [x] 4.4 Implementar E2E da jornada admin: draft, cadastro, publicação e despublicação.
- [x] 4.5 Implementar E2E da jornada usuário comum: consumo de álbum publicado e coleção.
- [x] 4.6 Implementar E2E de álbum despublicado com continuidade da coleção.
- [x] 4.7 Executar suíte relevante e registrar verificações nos documentos da tarefa.

## Detalhes de implementação

Seguir `techspec.md`, principalmente "Monitoramento e observabilidade" e "Abordagem de testes". Esta tarefa fecha a qualidade da feature, sem introduzir novos requisitos de produto.

## Critérios de sucesso

- Métricas e logs permitem observar mutações administrativas e negações de acesso.
- E2E cobre os fluxos críticos de admin e usuário comum.
- Testes unitários, integração e E2E relevantes passam.
- A documentação de tarefas registra a verificação realizada.

## Testes da tarefa

- [x] Testes unitários para métricas/logs quando aplicável.
- [x] Testes de integração para contadores e outcomes críticos.
- [x] Testes E2E com Playwright para admin, usuário comum e despublicação.
- [x] Execução consolidada da suíte relevante de API e web.

## Implementação concluída

- Adicionados os contadores Prometheus `catalog_admin_mutations_total`, `catalog_authorization_denials_total` e `catalog_album_reads_total`.
- Adicionados logs estruturados para mutações administrativas, bloqueios 403 e leituras de catálogo, sem registrar tokens, senhas ou payloads de requisição.
- Instrumentados `AdminGuard`, `AlbumsService` e `StickersService` para outcomes de sucesso/falha e contexto seguro de usuário, role, recurso, ação e álbum.
- Ajustadas fixtures E2E com admin, usuário comum e álbum em `draft`/`published`.
- Expandido Playwright para cobrir fluxo admin com cadastro, publicação e despublicação; fluxo de usuário comum em álbum publicado; e continuidade da coleção após álbum despublicado sair da listagem comum.

## Verificações executadas

- `pnpm --filter @albumcheio/api test` - 25 arquivos, 78 testes passando.
- `pnpm --filter @albumcheio/web test` - 6 arquivos, 17 testes passando.
- `pnpm --filter @albumcheio/api build` - build NestJS concluído com sucesso.
- `pnpm exec playwright test tests/e2e/album-critical-flows.spec.ts` - 7 testes passando e 1 cenário mobile-only corretamente pulado no projeto desktop.

## Arquivos relevantes

- `tasks/prd-cadastros-administrativos-albuns/techspec.md`
- `apps/api/src/modules/observability/metrics.service.ts`
- `apps/api/src/modules/observability/structured-logger.service.ts`
- `apps/api/src/modules/observability/request-observability.middleware.ts`
- `apps/api/src/modules/auth/admin.guard.ts`
- `apps/api/src/modules/albums/albums.service.ts`
- `apps/api/src/modules/stickers/stickers.service.ts`
- `apps/api/src/modules/albums/catalog.integration.test.ts`
- `tests/e2e/album-critical-flows.spec.ts`
