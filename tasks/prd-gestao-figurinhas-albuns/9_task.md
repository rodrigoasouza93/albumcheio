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

- [ ] 9.1 Implementar endpoint ou exposição de métricas Prometheus da API.
- [ ] 9.2 Instrumentar métricas de HTTP, autenticação, buscas, atualizações de coleção e cálculo de progresso.
- [ ] 9.3 Implementar logs estruturados com sanitização de dados sensíveis.
- [ ] 9.4 Revisar guards, RLS, clientes Supabase e respostas de erro para segurança.
- [ ] 9.5 Criar testes E2E de cadastro/login e criação de álbum básico.
- [ ] 9.6 Criar testes E2E de seção, figurinha, quantidade, busca por código e progresso.
- [ ] 9.7 Criar testes E2E mobile para faltantes, repetidas e leitura de códigos.
- [ ] 9.8 Executar auditoria de acessibilidade dos fluxos principais.
- [ ] 9.9 Documentar comandos de verificação e critérios de release do MVP.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Monitoramento e observabilidade", "Abordagem de testes", "Riscos conhecidos" e "Dependências técnicas".

## Critérios de sucesso

- Métricas e logs existem sem expor informações sensíveis.
- Fluxos críticos passam em E2E desktop e mobile.
- Acessibilidade mínima do PRD é validada nos fluxos principais.
- Isolamento de dados por usuário é verificado por testes e revisão.
- Há documentação objetiva para rodar checks antes de release.

## Testes da tarefa

- [ ] Testes unitários: instrumentação, sanitização de logs e helpers de métricas.
- [ ] Testes de integração: endpoint de métricas, logs por request e cenários de autorização/isolamento.
- [ ] Testes E2E: cadastro/login, criação de catálogo, marcação de posse, busca por código, progresso, faltantes, repetidas e mobile.

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/prd.md`
- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/api/src/**`
- `apps/web/src/**`
- `apps/api/test/**`
- `apps/web/src/**/*.test.*`
- `e2e/**`
- `playwright.config.*`
