# Tarefa 6.0: Implementar frontend autenticado e navegação principal de álbuns

## Visão geral

Criar a experiência inicial autenticada no Next.js: cadastro, login, sessão, logout, lista de álbuns e entrada para o detalhe de um álbum.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de Next.js App Router, React e autenticação.
- `.agents/skills/nodejs-typescript-conventions`: manter código frontend em TypeScript.
- `.agents/skills/react-frontend-conventions`: usar componentes funcionais, hooks `use*`, Tailwind e testes de componentes.
- `.agents/skills/repo-folder-structure`: organizar `features/auth` e `features/albums`.
- `.agents/skills/vitest-testing`: cobrir componentes, hooks e integração com cliente HTTP.
- `.agents/skills/code-standards-en`: manter identificadores em inglês.
- `.agents/skills/ui-ux-pro-max`: aplicar acessibilidade, responsividade e estados claros de interação.
</skills>

<requirements>

- Permitir cadastro, login e logout pela UI.
- Manter sessão autenticada para consumir a API.
- Proteger páginas que dependem de usuário autenticado.
- Exibir lista de álbuns cadastrados.
- Permitir navegar para o detalhe do álbum.
- Mostrar estados de loading, erro e vazio.
- Garantir uso por teclado e rótulos claros em formulários.
</requirements>

## Subtarefas

- [ ] 6.1 Criar cliente HTTP do frontend com suporte a sessão e erros da API.
- [ ] 6.2 Criar telas/componentes de cadastro e login.
- [ ] 6.3 Criar hook/contexto de sessão autenticada.
- [ ] 6.4 Criar proteção de rotas ou fluxo equivalente no App Router.
- [ ] 6.5 Criar tela de lista de álbuns com estados de loading, erro e vazio.
- [ ] 6.6 Criar navegação para detalhe do álbum.
- [ ] 6.7 Criar logout e tratamento de sessão expirada.
- [ ] 6.8 Validar responsividade inicial em desktop e mobile.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Arquitetura do sistema", "Endpoints da API", "Experiência do usuário" no PRD e "Sequenciamento do desenvolvimento" item 6.

## Critérios de sucesso

- Usuário consegue criar conta, entrar, sair e ver apenas telas protegidas quando autenticado.
- Lista de álbuns consome a API e permite acessar o detalhe.
- Formulários têm validação, mensagens de erro úteis, foco visível e navegação por teclado.
- Componentes seguem a organização por feature prevista.

## Testes da tarefa

- [ ] Testes unitários: componentes de formulário, validação visual de estados e hooks de sessão.
- [ ] Testes de integração: fluxo frontend com cliente HTTP mockado para cadastro, login, logout e listagem.
- [ ] Testes E2E: login e acesso à lista de álbuns podem ser cobertos na tarefa 9.

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/prd.md`
- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/web/src/features/auth/**`
- `apps/web/src/features/albums/**`
- `apps/web/src/app/**`
- `apps/web/src/lib/**`
