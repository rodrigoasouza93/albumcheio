# Tarefa 1.0: Implementar geração completa e cópia da lista compartilhável

## Visão geral

Implementar a base funcional para gerar listas completas de figurinhas faltantes ou repetidas, por seção selecionada, e permitir copiar o texto gerado. Esta tarefa cobre o fluxo principal recomendado no PRD: lista em texto para compartilhamento rápido em web e mobile.

<skills>
### Conformidade com skills

- `react-frontend-conventions`: componentes funcionais React, estado local e props explícitas.
- `nodejs-typescript-conventions`: tipos TypeScript readonly, sem `any`.
- `repo-folder-structure`: novos módulos dentro de `features/collection`.
- `vitest-testing`: testes unitários e integração do frontend.
- `code-standards-en`: nomes de tipos, funções e componentes em inglês.
</skills>

<requirements>

- A exportação deve permitir escolher somente faltantes ou somente repetidas, nunca ambas juntas.
- A exportação deve exigir seção selecionada, incluindo "Todas as seções" apenas quando escolhida explicitamente.
- A lista exportada deve buscar todas as páginas da seção/tipo selecionado.
- O texto gerado deve conter nome, seção e código das figurinhas.
- O texto gerado não deve conter dados pessoais nem quantidade de repetidas.
- A ação principal deve ser copiar para a área de transferência.
- Deve existir fallback de cópia manual quando a Clipboard API falhar ou não estiver disponível.

</requirements>

## Subtarefas

- [x] 1.1 Criar tipos e utilitários de exportação textual conforme `techspec.md`.
- [x] 1.2 Implementar carregamento paginado completo usando endpoints existentes de faltantes e repetidas.
- [x] 1.3 Adicionar controles de exportação ao painel de faltantes e repetidas.
- [x] 1.4 Implementar ação de copiar e fallback manual acessível.
- [x] 1.5 Cobrir formatação, paginação completa, privacidade e estados de erro com testes.

## Detalhes de implementação

Referenciar `tasks/prd-compartilhamento-listas-figurinhas/techspec.md`, especialmente as seções "Design de implementação", "Endpoints da API" e "Pontos de integração".

## Critérios de sucesso

- Usuário consegue gerar e copiar lista completa de faltantes ou repetidas por seção.
- O fluxo não permite misturar faltantes e repetidas.
- A exportação busca todos os itens, não apenas a página carregada na tela.
- O conteúdo não inclui nome, email, progresso geral, identificadores pessoais ou quantidade de repetidas.
- Estados de carregamento, lista vazia, sucesso e erro são claros e acessíveis.

## Notas de implementação

- Adicionados tipos `ShareListKind`, `ShareListItem`, `LoadCompleteShareListInput` e `ShareListExport`.
- Criado utilitário de exportação em `features/collection/lib` para carregar todas as páginas, normalizar seção/título e formatar texto sem dados pessoais ou quantidade de repetidas.
- Adicionado painel de exportação ao bloco "Faltantes e repetidas" com escolha mutuamente exclusiva entre faltantes e repetidas, ação principal de cópia e fallback manual em `textarea` selecionável.
- Melhoria adicional de usabilidade: o formulário de autenticação agora permite mostrar e ocultar a senha digitada nos fluxos de login e criação de conta.

## Testes da tarefa

- [x] Testes unitários
- [x] Testes de integração
- [ ] Testes E2E (se aplicável)

Verificação executada:

- `npm run test -- src/features/collection/lib/collection-share-export.test.ts src/features/collection/components/collection-dashboard.test.tsx src/lib/api/http-client.test.ts`
- `npm run test`
- `pnpm --filter @albumcheio/web build`
- `curl -I http://localhost:3000`
- `npm run test -- src/features/auth/components/auth-form.test.tsx`
- `npm run build`

## Arquivos relevantes

- `tasks/prd-compartilhamento-listas-figurinhas/prd.md`
- `tasks/prd-compartilhamento-listas-figurinhas/techspec.md`
- `apps/web/src/features/collection/components/collection-summary-lists.tsx`
- `apps/web/src/features/collection/components/sticker-share-export-panel.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.test.tsx`
- `apps/web/src/features/collection/lib/collection-share-export.ts`
- `apps/web/src/features/collection/lib/collection-share-export.test.ts`
- `apps/web/src/lib/api/api-types.ts`
- `apps/web/src/lib/api/http-client.ts`
- `apps/web/src/lib/api/http-client.test.ts`
- `apps/web/src/features/auth/components/auth-form.tsx`
- `apps/web/src/features/auth/components/auth-form.test.tsx`
