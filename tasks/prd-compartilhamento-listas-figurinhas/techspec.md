# Especificação técnica

## Resumo executivo

A funcionalidade será implementada como uma extensão da área de "Faltantes e repetidas" da coleção, sem criar links públicos nem persistir artefatos exportados. O frontend montará uma lista completa a partir dos endpoints autenticados já existentes (`missing` e `duplicates`), buscará todas as páginas da seção selecionada no momento da exportação e produzirá dois formatos: texto copiável como ação principal e visualização imprimível para "Salvar como PDF" via impressão nativa do navegador.

A principal decisão de arquitetura é manter a exportação no cliente usando dados já autorizados pela API. Isso evita novas integrações, evita armazenamento de PDFs no backend e reduz risco de vazamento de dados pessoais. O backend deve permanecer como fonte de dados paginada e autenticada; ajustes serão pontuais apenas se os contratos atuais não retornarem dados suficientes para compor nome, seção e código de cada figurinha.

## Arquitetura do sistema

### Visão dos componentes

- `CollectionDashboard`: mantém o estado das listas e passa `albumId`, `token`, `sections`, seção selecionada e callbacks de erro para o painel de exportação.
- `CollectionSummaryLists`: adiciona controles de exportação dentro do painel de faltantes e repetidas, mantendo a seleção de seção existente como pré-requisito.
- `StickerShareExportPanel` ou componente equivalente em `features/collection`: novo componente responsável por escolher o tipo da lista (`missing` ou `duplicates`), exibir ações de copiar e imprimir, e coordenar estados de carregamento, sucesso, vazio e erro.
- `collection-share-export.ts`: novo módulo de domínio no frontend para normalizar itens, ordenar, montar texto compartilhável e preparar dados imprimíveis.
- `http-client.ts`: reutiliza `listMissingStickers` e `listDuplicateStickers`; pode adicionar helpers de paginação completa no frontend sem alterar o contrato HTTP.
- `api-types.ts`: adiciona tipos frontend para `ShareListKind`, `ShareListItem`, `ShareListExport` e entrada de carregamento completo.
- `CollectionsController` e `CollectionsService`: permanecem com endpoints existentes. Só devem mudar se for necessário incluir metadados ausentes para seção ou ordenação.
- `MetricsService` e `StructuredLoggerService`: sem nova métrica obrigatória. As métricas HTTP existentes já cobrem chamadas de exportação; se houver instrumentação adicional, deve ser agregada e sem conteúdo da lista.

Fluxo de dados: o usuário seleciona uma seção no painel de faltantes/repetidas, escolhe faltantes ou repetidas para exportar e aciona copiar ou imprimir. O frontend busca todas as páginas daquele tipo e seção usando `limit`/`offset`, transforma os itens em uma estrutura comum contendo `code`, `title` e `sectionName`, gera texto ou abre uma visualização imprimível. Nenhuma informação pessoal do usuário é inserida no conteúdo.

## Design de implementação

### Principais interfaces

```ts
export type ShareListKind = 'missing' | 'duplicates';

export interface ShareListItem {
  readonly code: string;
  readonly title: string;
  readonly sectionName: string;
}
```

```ts
export interface LoadCompleteShareListInput {
  readonly token: string;
  readonly albumId: string;
  readonly sectionId: string;
  readonly kind: ShareListKind;
}
```

```ts
export interface ShareListExport {
  readonly kind: ShareListKind;
  readonly sectionName: string;
  readonly items: readonly ShareListItem[];
  readonly generatedAt: string;
}
```

```ts
export interface StickerShareExportPanelProps {
  readonly albumId: string;
  readonly token: string;
  readonly sections: readonly AlbumSectionSummary[];
  readonly selectedSectionId: string;
  readonly onUnauthorized: () => void;
}
```

### Modelos de dados

Não há mudança obrigatória no banco de dados. As entidades existentes continuam sendo:

- `stickers`: fonte de `code`, `title`, `section_id` e ordenação.
- `album_sections`: fonte de nome da seção selecionada e nomes de seção para itens exportados.
- `collection_items`: fonte de quantidade do usuário para classificar faltantes e repetidas.

No frontend, `ShareListItem` deve derivar `title` de `sticker.title ?? 'Figurinha sem título'` e `sectionName` do mapa de seções carregado em `AlbumDetailPage`. A quantidade repetida não entra no conteúdo exportado, mesmo quando disponível na resposta de duplicadas.

A busca completa deve usar um limite fixo compatível com o padrão atual (`100`) e avançar `offset` até receber uma página com menos itens que o limite. A ordenação final deve ser estável, preferindo a ordem retornada pela API; se houver normalização local, ordenar por `sectionName`, `code` e `title`.

### Endpoints da API

- `GET /api/v1/albums/:albumId/missing?sectionId&limit&offset`: usado para carregar todas as páginas de faltantes da seção selecionada.
- `GET /api/v1/albums/:albumId/duplicates?sectionId&limit&offset`: usado para carregar todas as páginas de repetidas da seção selecionada.

Não há novo endpoint previsto. `sectionId` deve ser obrigatório no fluxo de exportação da UI, incluindo o caso especial `all`, que o frontend traduz para ausência de `sectionId`. A exportação completa de "Todas as seções" é permitida apenas se o usuário escolher essa opção explicitamente.

## Pontos de integração

Não há integrações externas. O recurso usa APIs Web do navegador:

- Clipboard API para copiar o texto gerado após ação explícita do usuário.
- Impressão nativa do navegador para permitir salvar como PDF.

Essas APIs devem ser tratadas como capacidades opcionais do ambiente. Se a cópia programática falhar, a interface deve exibir o texto em campo selecionável para cópia manual. A impressão deve abrir uma visualização ou documento com CSS de impressão sem depender de serviço externo.

## Abordagem de testes

### Testes unitários

- `collection-share-export`: formata texto com cabeçalho de tipo e seção, inclui apenas nome, seção e código, omite quantidade e dados pessoais.
- `collection-share-export`: ordena ou preserva ordenação de forma previsível e trata título ausente.
- Carregador paginado: busca páginas até a última, concatena itens e respeita `sectionId` ou `all`.
- `StickerShareExportPanel`: bloqueia ações quando nenhuma seção está selecionada, alterna entre faltantes e repetidas, mostra vazio real e estados de erro.
- Clipboard: usa mock de `navigator.clipboard.writeText` e cobre fallback quando a API não existe ou rejeita.

### Testes de integração

- `listMissingStickers` e `listDuplicateStickers` continuam aceitando `sectionId`, `limit` e `offset`.
- Exportação completa de faltantes usa múltiplas páginas quando a primeira página tem `limit` itens.
- Exportação completa de repetidas não inclui `duplicateCount` no texto nem na visualização imprimível.
- Erro `401` durante exportação chama `onUnauthorized`.
- Seção inválida ou sem itens resulta em mensagem clara sem gerar conteúdo enganoso.

### Testes E2E

Usar Playwright para validar frontend com backend:

- Usuário seleciona uma seção, escolhe faltantes, copia a lista e o texto contém código, nome e seção.
- Usuário seleciona repetidas e confirma que a lista não contém faltantes.
- Usuário exporta "Todas as seções" somente após seleção explícita.
- Fluxo mobile: controles cabem na tela, copiar funciona ou apresenta fallback selecionável.
- Fluxo de PDF: botão abre visualização imprimível sem dados pessoais e com conteúdo da lista completa.

## Sequenciamento do desenvolvimento

### Ordem de construção

1. Criar tipos e utilitários de exportação no frontend, porque eles isolam regras de privacidade, formatação e paginação completa.
2. Implementar o carregador paginado usando `listMissingStickers` e `listDuplicateStickers`, com tratamento de `all` e `sectionId`.
3. Adicionar `StickerShareExportPanel` ao painel de faltantes/repetidas, reutilizando a seção já selecionada.
4. Implementar ação de copiar com Clipboard API e fallback manual.
5. Implementar visualização imprimível para PDF com CSS de impressão e sem dependência nova.
6. Atualizar testes unitários e de integração do frontend.
7. Validar E2E, acessibilidade e comportamento mobile.

### Dependências técnicas

- Nenhuma biblioteca nova é necessária para o PDF, pois a decisão é usar impressão nativa do navegador.
- A aplicação deve continuar rodando em navegador seguro para cópia programática via Clipboard API.
- Os endpoints de faltantes e repetidas precisam permanecer paginados e autenticados.
- O frontend depende da lista de seções já carregada em `AlbumDetailPage`.

## Monitoramento e observabilidade

Não há necessidade de novas métricas Prometheus obrigatórias no backend, pois a exportação não cria endpoint novo. As chamadas HTTP existentes já serão observadas pelo middleware de requisição.

Se for adicionada instrumentação específica no futuro, usar:

- `collection_share_export_total{kind,format,scope,outcome}` para contar ações de exportação sem registrar conteúdo.
- `kind=missing|duplicates`, `format=text|print`, `scope=section|all`.
- Logs em nível `info` apenas para metadados agregados: `albumId`, `sectionId` quando houver, `kind`, `format`, `itemsCount` e duração.
- Nunca registrar texto exportado, códigos completos em massa, token, nome, email ou identificadores pessoais do usuário.

## Considerações técnicas

### Principais decisões

- Usar impressão nativa para PDF, evitando dependência nova, custo de bundle e riscos de compatibilidade de bibliotecas PDF.
- Tratar texto copiável como formato principal, por ser mais adequado a navegador mobile e aplicativos de mensagem.
- Buscar todas as páginas no momento da exportação para garantir que a lista compartilhada esteja completa, mesmo que a UI mostre apenas a primeira página.
- Não criar link público, arquivo persistido ou endpoint de exportação, reduzindo superfície de privacidade.
- Manter faltantes e repetidas como fluxos mutuamente exclusivos no componente de exportação.

### Riscos conhecidos

- A busca completa de "Todas as seções" pode ser pesada em álbuns grandes. Mitigar com estado de carregamento, limite fixo, prevenção de cliques duplicados e opção explícita.
- Clipboard API pode falhar fora de contexto seguro ou sem ativação do usuário. Mitigar com fallback de texto selecionável.
- Impressão nativa varia entre navegadores. Mitigar com HTML simples, CSS de impressão e testes em desktop/mobile.
- Dados podem ficar defasados se o usuário alterar quantidades e exportar antes do painel recarregar. Mitigar buscando a lista completa diretamente no momento da exportação.
- Se `sectionName` depender só do mapa local, itens sem seção conhecida precisam de fallback textual claro.

### Conformidade com rules

- `.claude/rules` não existe no repositório durante a análise. Não há rules locais a aplicar.
- `AGENTS.md`: esta entrega é documentação de techspec e não implementação de código; o fluxo obrigatório de branch para implementação de tarefas não foi iniciado.
- `create_techspec.md`: PRD revisado, projeto explorado, perguntas técnicas feitas e respondidas, Context7 consultado, busca web realizada e template mantido.

### Conformidade com skills

- `context7`: usado para consultar documentação atual do React sobre `select` controlado, eventos e renderização condicional.
- `react-frontend-conventions`: aplicável aos componentes React funcionais, estado local, props explícitas e testes de componente.
- `nodejs-typescript-conventions`: aplicável aos tipos TypeScript, sem `any` e com contratos readonly.
- `repo-folder-structure`: aplicável à criação de utilitário e componente dentro de `features/collection`.
- `vitest-testing`: aplicável aos testes unitários e integração de frontend.
- `ui-ux-pro-max`: aplicável ao desenho dos controles de exportação, estados de loading, acessibilidade e mobile.
- `code-standards-en`: aplicável a nomes de tipos, funções e componentes em inglês.

### Arquivos relevantes e dependentes

- `tasks/prd-compartilhamento-listas-figurinhas/prd.md`
- `tasks/prd-compartilhamento-listas-figurinhas/techspec.md`
- `create_techspec.md`
- `apps/web/src/features/collection/components/collection-dashboard.tsx`
- `apps/web/src/features/collection/components/collection-summary-lists.tsx`
- `apps/web/src/features/collection/components/collection-dashboard.test.tsx`
- `apps/web/src/features/collection/lib/collection-status.ts`
- `apps/web/src/lib/api/api-types.ts`
- `apps/web/src/lib/api/http-client.ts`
- `apps/web/src/lib/api/http-client.test.ts`
- `apps/api/src/modules/collections/collections.controller.ts`
- `apps/api/src/modules/collections/collections.service.ts`
- `apps/api/src/modules/collections/collections.types.ts`
- `apps/api/src/modules/collections/collections.validation.ts`
- `apps/api/src/modules/collections/data/collections.repository.ts`
- `apps/api/src/modules/observability/metrics.service.ts`
- `apps/api/src/modules/observability/structured-logger.service.ts`
