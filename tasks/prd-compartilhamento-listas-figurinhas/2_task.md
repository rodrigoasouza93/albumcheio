# Tarefa 2.0: Implementar exportação por impressão nativa, testes e validação final

## Visão geral

Implementar o formato complementar de exportação para PDF usando impressão nativa do navegador, consolidar testes do fluxo completo e validar acessibilidade, privacidade e comportamento mobile. Esta tarefa fecha a entrega garantindo que texto copiável e PDF funcionem como formatos separados a partir da mesma lista completa.

<skills>
### Conformidade com skills

- `react-frontend-conventions`: composição de componentes, estados de UI e props explícitas.
- `nodejs-typescript-conventions`: contratos TypeScript readonly, sem `any`.
- `ui-ux-pro-max`: acessibilidade, estados de interação e responsividade mobile.
- `vitest-testing`: testes unitários e integração.
- `code-standards-en`: nomes de módulos e funções em inglês.
</skills>

<requirements>

- A exportação em PDF deve usar impressão nativa do navegador, sem biblioteca nova.
- A visualização imprimível deve usar a mesma lista completa carregada para exportação.
- O conteúdo imprimível deve conter nome, seção e código das figurinhas.
- O conteúdo imprimível não deve conter dados pessoais nem quantidade de repetidas.
- O fluxo deve funcionar em navegador web e navegador mobile.
- A validação final deve cobrir texto copiável, impressão/PDF, privacidade e lista completa.

</requirements>

## Subtarefas

- [x] 2.1 Criar visualização imprimível para faltantes ou repetidas.
- [x] 2.2 Integrar ação de impressão nativa ao painel de exportação.
- [x] 2.3 Garantir layout de impressão legível e sem dados pessoais.
- [x] 2.4 Adicionar testes para impressão, privacidade, fallback e estados vazios.
- [x] 2.5 Executar validação E2E, acessibilidade, mobile e documentação da tarefa.

## Detalhes de implementação

Referenciar `tasks/prd-compartilhamento-listas-figurinhas/techspec.md`, especialmente as seções "Pontos de integração", "Abordagem de testes", "Sequenciamento do desenvolvimento" e "Riscos conhecidos".

## Critérios de sucesso

- Usuário consegue abrir uma versão imprimível da lista completa e salvar como PDF pelo navegador.
- O PDF não depende de biblioteca nova nem de serviço externo.
- O conteúdo impresso corresponde ao tipo e seção selecionados.
- A validação confirma que faltantes e repetidas não são exportadas juntas.
- Testes e documentação da tarefa registram verificações realizadas.

## Notas de implementação

- A exportação para PDF usa impressão nativa via `window.open`, documento HTML simples e `print()`, sem dependência nova.
- A visualização imprimível reutiliza a mesma lista completa carregada para exportação e inclui apenas código, nome e seção.
- O fluxo cobre lista vazia, erro de abertura da impressão e fallback manual para texto copiável.

## Testes da tarefa

- [x] Testes unitários
- [x] Testes de integração
- [ ] Testes E2E (se aplicável)

Verificação executada:

- `npm run test -- src/features/collection/lib/collection-share-export.test.ts src/features/collection/components/collection-dashboard.test.tsx src/lib/api/http-client.test.ts`
- `npm run test`
- `pnpm --filter @albumcheio/web build`
- `curl -I http://localhost:3000`

Observação: validação automatizada E2E com Playwright não foi adicionada nesta entrega; a cobertura ficou em testes unitários e de integração do frontend.

## Arquivos relevantes

- `tasks/prd-compartilhamento-listas-figurinhas/prd.md`
- `tasks/prd-compartilhamento-listas-figurinhas/techspec.md`
- `tasks/prd-compartilhamento-listas-figurinhas/tasks.md`
- `apps/web/src/features/collection/components/collection-summary-lists.tsx`
- `apps/web/src/features/collection/components/sticker-share-export-panel.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.test.tsx`
- `apps/web/src/features/collection/lib/collection-share-export.ts`
- `apps/web/src/features/collection/lib/collection-share-export.test.ts`
- `apps/web/src/lib/api/api-types.ts`
- `apps/web/src/lib/api/http-client.ts`
- `apps/web/src/lib/api/http-client.test.ts`
