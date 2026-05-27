# Tarefa 4.0: Implementar testes, observabilidade e validação E2E

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

- [ ] 4.1 Adicionar métricas Prometheus previstas na Tech Spec.
- [ ] 4.2 Adicionar logs estruturados para ações administrativas e bloqueios 403.
- [ ] 4.3 Criar/ajustar fixtures ou seeds para admin, usuário comum e álbuns por status.
- [ ] 4.4 Implementar E2E da jornada admin: draft, cadastro, publicação e despublicação.
- [ ] 4.5 Implementar E2E da jornada usuário comum: consumo de álbum publicado e coleção.
- [ ] 4.6 Implementar E2E de álbum despublicado com continuidade da coleção.
- [ ] 4.7 Executar suíte relevante e registrar verificações nos documentos da tarefa.

## Detalhes de implementação

Seguir `techspec.md`, principalmente "Monitoramento e observabilidade" e "Abordagem de testes". Esta tarefa fecha a qualidade da feature, sem introduzir novos requisitos de produto.

## Critérios de sucesso

- Métricas e logs permitem observar mutações administrativas e negações de acesso.
- E2E cobre os fluxos críticos de admin e usuário comum.
- Testes unitários, integração e E2E relevantes passam.
- A documentação de tarefas registra a verificação realizada.

## Testes da tarefa

- [ ] Testes unitários para métricas/logs quando aplicável.
- [ ] Testes de integração para contadores e outcomes críticos.
- [ ] Testes E2E com Playwright para admin, usuário comum e despublicação.
- [ ] Execução consolidada da suíte relevante de API e web.

## Arquivos relevantes

- `tasks/prd-cadastros-administrativos-albuns/techspec.md`
- `apps/api/src/modules/observability/metrics.service.ts`
- `apps/api/src/modules/observability/structured-logger.service.ts`
- `apps/api/src/modules/observability/request-observability.middleware.ts`
- `apps/api/src/modules/albums/catalog.integration.test.ts`
- `apps/api/src/modules/collections/collections.integration.test.ts`
- `apps/web/src/features/albums/components/albums-page.test.tsx`
- `apps/web/src/features/albums/components/album-detail-page.test.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.test.tsx`
