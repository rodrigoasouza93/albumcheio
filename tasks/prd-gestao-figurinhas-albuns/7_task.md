# Tarefa 7.0: Implementar frontend de cadastro manual de álbuns, seções e figurinhas

## Visão geral

Criar as telas e componentes para cadastro manual do catálogo, permitindo que usuários autenticados criem álbuns, seções e figurinhas sem depender de importações externas.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de Next.js, React forms e padrões de validação.
- `.agents/skills/nodejs-typescript-conventions`: manter types, DTOs e chamadas HTTP em TypeScript.
- `.agents/skills/react-frontend-conventions`: usar componentes funcionais, hooks e Tailwind.
- `.agents/skills/repo-folder-structure`: organizar os recursos em `features/albums`.
- `.agents/skills/vitest-testing`: cobrir formulários e fluxos de integração com a API.
- `.agents/skills/code-standards-en`: manter nomes técnicos em inglês.
- `.agents/skills/ui-ux-pro-max`: aplicar formulários acessíveis, estados de erro e layout responsivo.
</skills>

<requirements>

- Permitir criar álbum com nome, edição e descrição.
- Permitir criar seções com nome, código, tipo e ordenação.
- Permitir criar figurinhas com código, número, título, seção e ordenação.
- Mostrar conflitos de código de figurinha com mensagem clara.
- Garantir que códigos sejam fáceis de revisar visualmente.
- Evitar excesso de passos no cadastro manual básico.
- Não introduzir importação automática, OCR, QR code ou integração externa.
</requirements>

## Subtarefas

- [x] 7.1 Criar formulário de criação de álbum.
- [x] 7.2 Criar formulário de criação de seção no detalhe do álbum.
- [x] 7.3 Criar formulário de criação de figurinha vinculada à seção.
- [x] 7.4 Criar listagem resumida de seções e figurinhas já cadastradas.
- [x] 7.5 Tratar erro `409` de código duplicado com feedback específico.
- [x] 7.6 Atualizar cache/estado local após criação sem exigir recarregamento manual.
- [x] 7.7 Garantir navegação por teclado e labels em todos os campos.
- [x] 7.8 Validar layout mobile para cadastro e leitura de códigos.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "features/albums", "Endpoints da API", "Sequenciamento do desenvolvimento" item 7 e o PRD em "Cadastro de álbuns" e "Cadastro manual de figurinhas".

## Critérios de sucesso

- Usuário autenticado consegue cadastrar álbum, seção e figurinha pela UI.
- Código duplicado no mesmo álbum aparece como erro compreensível.
- A lista do catálogo reflete novos itens após cada cadastro.
- Interface funciona em desktop e mobile com ações principais por teclado.

## Testes da tarefa

- [x] Testes unitários: formulários, validação de campos, estados de erro e componentes de lista.
- [x] Testes de integração: criação de álbum, seção e figurinha com cliente HTTP mockado ou ambiente de teste.
- [ ] Testes E2E: fluxo completo de criação de catálogo será coberto na tarefa 9.

## Notas de implementação

- Adicionado formulário de criação de álbum em `/albums` com atualização local da listagem após `POST /albums`.
- Adicionados formulários de seção e figurinha no detalhe do álbum, usando `POST /albums/:albumId/sections` e `POST /albums/:albumId/stickers`.
- Adicionada listagem resumida do catálogo por seção, com códigos de figurinha em fonte monoespaçada para revisão visual.
- O erro `409` ao criar figurinha mostra mensagem específica com o código normalizado.
- Campos usam labels nativos, controles com foco visível e layout responsivo em grid que empilha no mobile.

## Verificação

- `pnpm --filter @albumcheio/web test`
- `pnpm run lint`
- `pnpm --filter @albumcheio/web build` (primeira execução bloqueada pelo sandbox do Turbopack ao criar processo/bindar porta; reexecutado com permissão elevada e aprovado)

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/prd.md`
- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/web/src/features/albums/**`
- `apps/web/src/components/ui/**`
- `apps/web/src/lib/**`
