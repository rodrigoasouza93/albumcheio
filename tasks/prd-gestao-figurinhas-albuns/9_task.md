# Tarefa 9.0: Implementar observabilidade, hardening de segurança, acessibilidade e E2E

## Visão geral

Consolidar qualidade transversal da entrega com métricas, logs estruturados, verificações de segurança, acessibilidade e testes E2E dos fluxos críticos do MVP.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de Prometheus, NestJS, Playwright e práticas Supabase.
- `.agents/skills/nodejs-typescript-conventions`: manter instrumentação e utilitários em TypeScript.
- `.agents/skills/react-frontend-conventions`: revisar componentes React com foco em estados e acessibilidade.
- `.agents/skills/vitest-testing`: manter unitários e integração como base dos fluxos E2E.
- `.agents/skills/code-standards-en`: manter logs, métricas e nomes técnicos consistentes.
- `.agents/skills/ui-ux-pro-max`: validar acessibilidade, responsividade e interação mobile.
</skills>

<requirements>

- Expor métricas Prometheus previstas na techspec.
- Emitir logs estruturados com `requestId`, rota, status, duração e usuário quando autenticado.
- Não registrar senha, token ou dado sensível.
- Revisar isolamento multiusuário e uso de service role.
- Cobrir E2E de cadastro/login, criação de catálogo, marcação de posse, busca e progresso.
- Cobrir cenário mobile para códigos, faltantes, repetidas e navegação.
- Garantir que estados não dependam apenas de cor.
- Documentar execução dos testes e checks finais.
</requirements>

## Subtarefas

- [x] 9.1 Implementar endpoint ou exposição de métricas Prometheus da API.
- [x] 9.2 Instrumentar métricas de HTTP, autenticação, buscas, atualizações de coleção e cálculo de progresso.
- [x] 9.3 Implementar logs estruturados com sanitização de dados sensíveis.
- [x] 9.4 Revisar guards, RLS, clientes Supabase e respostas de erro para segurança.
- [x] 9.5 Criar testes E2E de cadastro/login e criação de álbum básico.
- [x] 9.6 Criar testes E2E de seção, figurinha, quantidade, busca por código e progresso.
- [x] 9.7 Criar testes E2E mobile para faltantes, repetidas e leitura de códigos.
- [x] 9.8 Executar auditoria de acessibilidade dos fluxos principais.
- [x] 9.9 Documentar comandos de verificação e critérios de release do MVP.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Monitoramento e observabilidade", "Abordagem de testes", "Riscos conhecidos" e "Dependências técnicas".

## Implementação concluída

- Criado `ObservabilityModule` com `GET /api/v1/metrics` em formato Prometheus.
- Instrumentadas métricas `http_requests_total`, `http_request_duration_seconds`, `auth_failures_total`, `collection_updates_total`, `sticker_search_total` e `progress_calculation_duration_seconds`.
- Adicionado middleware global de observabilidade para `requestId`, rota, status, duração e `userId` quando o guard já autenticou a requisição.
- Adicionada sanitização recursiva de campos sensíveis em logs (`password`, `token`, `authorization`, `secret`, `apiKey`, `service_role`).
- Revisado isolamento: repositórios de catálogo/coleção continuam usando `createUserClient(accessToken)` para respeitar RLS; `createAdminClient` permanece encapsulado e não é usado nos fluxos de coleção/catálogo.
- Ajustado estado inicial de sessão no frontend para evitar carregamento infinito mantendo SSR consistente.
- Adicionados E2E com API mockada para cadastro, login, criação de álbum, criação de seção/figurinha, busca por código, marcação de quantidade, progresso, faltantes/repetidas e navegação mobile.
- Atualizado Playwright com projeto `mobile-chrome` e `baseURL` em `localhost` para compatibilidade com bloqueio de recursos dev do Next.js.

## Auditoria de acessibilidade e segurança

- Fluxos E2E usam seletores por papel/label, cobrindo labels de formulários, botões nomeados e navegação por link.
- Estados de coleção não dependem apenas de cor: exibem textos como `Tenho`, `Faltando`, `Repetida`, quantidades, repetidas disponíveis e percentuais.
- Controles mobile mantêm labels textuais para códigos, seção, quantidade e busca.
- Logs não incluem corpo de request nem headers; testes cobrem sanitização de dados sensíveis.
- A revisão de RLS/service role confirmou que dados privados de `collection_items` são lidos e escritos com JWT do usuário, alinhado ao risco conhecido da techspec.

## Critérios de sucesso

- Métricas e logs existem sem expor informações sensíveis.
- Fluxos críticos passam em E2E desktop e mobile.
- Acessibilidade mínima do PRD é validada nos fluxos principais.
- Isolamento de dados por usuário é verificado por testes e revisão.
- Há documentação objetiva para rodar checks antes de release.

## Testes da tarefa

- [x] Testes unitários: instrumentação, sanitização de logs e helpers de métricas.
- [x] Testes de integração: endpoint de métricas, logs por request e cenários de autorização/isolamento.
- [x] Testes E2E: cadastro/login, criação de catálogo, marcação de posse, busca por código, progresso, faltantes, repetidas e mobile.

## Verificação executada

- `pnpm run lint`
- `pnpm run test`
- `pnpm run test:e2e`
- `pnpm run build` fora do sandbox, porque Turbopack/Next tentou criar processo/porta durante o processamento CSS e falhou com `Operation not permitted` no sandbox.

## Critérios de release do MVP

- `pnpm run lint`, `pnpm run test`, `pnpm run test:e2e` e `pnpm run build` devem passar.
- `/api/v1/metrics` deve responder texto Prometheus e não incluir payloads sensíveis.
- Logs de request devem conter `requestId`, método, rota, status e duração; `userId` só quando autenticado.
- Fluxos desktop e mobile de autenticação, catálogo e coleção devem continuar cobertos no Playwright.
- Antes de produção, confirmar variáveis `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_API_BASE_URL` e `WEB_ORIGIN`.

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/prd.md`
- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/api/src/**`
- `apps/web/src/**`
- `apps/api/test/**`
- `apps/web/src/**/*.test.*`
- `tests/e2e/**`
- `playwright.config.ts`
