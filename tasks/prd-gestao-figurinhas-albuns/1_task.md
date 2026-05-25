# Tarefa 1.0: Estruturar monorepo, tooling e configuração base

## Visão geral

Criar a base do projeto com `apps/web`, `apps/api`, TypeScript, npm scripts, Tailwind, lint, testes e configuração de variáveis de ambiente para permitir o desenvolvimento das entregas seguintes.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de Next.js, NestJS, Tailwind, Vitest e Supabase quando necessário.
- `.agents/skills/nodejs-typescript-conventions`: manter fonte TypeScript, npm como gerenciador e módulos ESM.
- `.agents/skills/repo-folder-structure`: organizar `apps/web`, `apps/api` e futuras features conforme a estrutura esperada.
- `.agents/skills/vitest-testing`: configurar testes unitários e de integração com Vitest.
- `.agents/skills/code-standards-en`: usar identificadores em inglês, nomes verbais e tipagem explícita.
</skills>

<requirements>

- Criar a estrutura inicial do monorepo prevista em `techspec.md`.
- Configurar TypeScript, lint, formatacao, Tailwind, Vitest e Playwright sem implementar regras de negocio.
- Definir scripts npm para desenvolvimento, build, lint e testes.
- Criar exemplos de variáveis de ambiente sem incluir segredos reais.
- Preparar separação entre frontend Next.js e API NestJS.
</requirements>

## Subtarefas

- [ ] 1.1 Criar estrutura `apps/web`, `apps/api` e diretórios compartilhados necessários.
- [ ] 1.2 Configurar TypeScript, path aliases, lint e formatacao para web e API.
- [ ] 1.3 Configurar Next.js App Router, React, Tailwind e base visual mínima.
- [ ] 1.4 Configurar NestJS com módulos base e health check inicial.
- [ ] 1.5 Configurar Vitest para unitários e integração nos pacotes aplicáveis.
- [ ] 1.6 Configurar Playwright para execução futura dos fluxos E2E.
- [ ] 1.7 Documentar variáveis de ambiente em arquivos de exemplo.
- [ ] 1.8 Validar scripts npm de build, lint e testes em modo smoke.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Arquitetura do sistema", "Sequenciamento do desenvolvimento" item 1, "Dependências técnicas" e "Conformidade com skills".

## Critérios de sucesso

- Monorepo executa web e API localmente por scripts npm documentados.
- Build, lint e testes smoke executam sem erros.
- A estrutura criada permite adicionar módulos NestJS e features React sem reorganização posterior.
- Nenhum segredo real é versionado.

## Testes da tarefa

- [ ] Testes unitários: teste smoke de função/componente mínimo para validar Vitest em cada app aplicável.
- [ ] Testes de integração: health check da API e carregamento inicial da web em ambiente de teste.
- [ ] Testes E2E: smoke Playwright validando que a aplicação web abre a tela inicial.

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `package.json`
- `tsconfig*.json`
- `apps/web/**`
- `apps/api/**`
- `.env.example`
- `playwright.config.*`
