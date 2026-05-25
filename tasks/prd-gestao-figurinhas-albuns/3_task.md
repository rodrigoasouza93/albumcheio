# Tarefa 3.0: Implementar autenticação, perfis e proteção da API

Status: concluída em 2026-05-25.

## Visão geral

Implementar cadastro, login, logout, perfil autenticado e proteção das rotas da API para que os fluxos de catálogo e coleção possam operar com usuário identificado.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de NestJS, Supabase Auth e guards.
- `.agents/skills/nodejs-typescript-conventions`: manter serviços, DTOs e módulos em TypeScript tipado.
- `.agents/skills/repo-folder-structure`: separar controllers, services e data clients.
- `.agents/skills/vitest-testing`: cobrir services, guards e endpoints de autenticação.
- `.agents/skills/code-standards-en`: manter nomes de classes, métodos e DTOs em inglês.
  </skills>

<requirements>

- Implementar cadastro por nome, e-mail e senha.
- Implementar login e logout por Supabase Auth.
- Criar e retornar perfil do usuário autenticado.
- Validar JWT nas rotas protegidas.
- Separar cliente Supabase com JWT do usuário e cliente administrativo.
- Não expor senha, tokens ou dados sensíveis em logs ou respostas.
  </requirements>

## Subtarefas

- [x] 3.1 Criar `SupabaseModule` com clientes separados conforme a techspec.
- [x] 3.2 Criar `AuthModule` com endpoints de cadastro, login e logout.
- [x] 3.3 Criar `ProfilesModule` e endpoint `GET /api/v1/me`.
- [x] 3.4 Implementar guard de autenticação para rotas protegidas.
- [x] 3.5 Padronizar DTOs, validação de entrada e respostas de erro.
- [x] 3.6 Mapear erros de autenticação para `400`, `401`, `403` e `422` conforme aplicável.
- [x] 3.7 Garantir criação/consulta de perfil associada ao usuário Supabase.
- [x] 3.8 Cobrir fluxos multiusuário básicos para preparar isolamento das coleções.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Principais interfaces", "Endpoints da API", "Pontos de integração", "Abordagem de testes" e "Riscos conhecidos".

## Critérios de sucesso

- Usuário consegue cadastrar, autenticar, encerrar sessão e consultar o próprio perfil.
- Rotas protegidas recusam requisições sem sessão válida.
- Service role fica restrita a operações inevitáveis de autenticação.
- Erros retornam status HTTP e mensagens consistentes.

## Testes da tarefa

- [x] Testes unitários: services de autenticação, criação/consulta de perfil, guard e tradução de erros Supabase.
- [x] Testes de integração: endpoints `register`, `login`, `logout` e `me` com sucesso e falha.
- [x] Testes E2E: não aplicável nesta tarefa; cobertura completa diferida para a tarefa 9 e fluxos básicos cobertos por testes de integração da API.

## Verificação

- `pnpm --filter @albumcheio/api test` em 2026-05-25: 9 arquivos de teste e 27 testes passaram.

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/api/src/modules/supabase/**`
- `apps/api/src/modules/auth/**`
- `apps/api/src/modules/profiles/**`
- `apps/api/src/modules/auth/supabase-auth.guard.ts`
- `apps/api/src/modules/**/*.test.ts`
