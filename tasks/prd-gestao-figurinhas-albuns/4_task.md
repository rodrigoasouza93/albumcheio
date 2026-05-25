# Tarefa 4.0: Implementar API de catálogo de álbuns, seções e figurinhas

## Visão geral

Implementar os endpoints e regras de domínio para criação, consulta e listagem do catálogo compartilhado de álbuns, seções e figurinhas.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de NestJS, validação e Supabase/PostgreSQL.
- `.agents/skills/nodejs-typescript-conventions`: manter DTOs, services e repositories em TypeScript tipado.
- `.agents/skills/repo-folder-structure`: preservar fluxo `controllers -> services -> data`.
- `.agents/skills/vitest-testing`: cobrir regras de catálogo e endpoints de integração.
- `.agents/skills/code-standards-en`: manter nomes e arquivos em inglês.
</skills>

<requirements>

- Permitir criar álbuns com nome, edição e descrição.
- Permitir criar seções vinculadas a álbuns.
- Permitir criar figurinhas vinculadas a álbum e seção.
- Normalizar códigos com `trim` e uppercase antes de validação e busca.
- Impedir ambiguidade de código dentro do mesmo álbum.
- Permitir listar álbuns e consultar detalhes com seções resumidas.
- Permitir listar ou filtrar figurinhas por seção e código.
</requirements>

## Subtarefas

- [ ] 4.1 Criar `AlbumsModule` com endpoints de listagem, criação e detalhe.
- [ ] 4.2 Criar suporte a seções de álbum com `kind`, código e ordenação.
- [ ] 4.3 Criar `StickersModule` ou submódulo equivalente para cadastro e listagem de figurinhas.
- [ ] 4.4 Implementar normalização e validação de códigos de figurinhas.
- [ ] 4.5 Mapear conflito de código por álbum para status `409`.
- [ ] 4.6 Implementar paginação `limit` e `offset` nas listagens.
- [ ] 4.7 Garantir que endpoints de escrita exigem usuário autenticado.
- [ ] 4.8 Retornar DTOs adequados para telas de lista e detalhe.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Modelos de dados", "Endpoints da API", "Principais interfaces" e "Considerações técnicas".

## Critérios de sucesso

- Usuário autenticado consegue criar álbum, seção e figurinha manualmente.
- Códigos duplicados no mesmo álbum são recusados.
- Listagens paginadas retornam dados consistentes para o frontend.
- Catálogo permanece compartilhado sem misturar dados privados de coleção.

## Testes da tarefa

- [ ] Testes unitários: normalização de código, validações de DTOs e regras de conflito.
- [ ] Testes de integração: criar álbum, seção, figurinha, consultar detalhe e listar figurinhas com filtros.
- [ ] Testes E2E: não obrigatório nesta tarefa; fluxo completo será coberto na tarefa 9.

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/api/src/albums/**`
- `apps/api/src/stickers/**`
- `apps/api/src/schemas/**`
- `apps/api/test/**`
