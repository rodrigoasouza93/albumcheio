# Tarefa 2.0: Criar schema Supabase, migrations, constraints, RLS e seeds

## Visão geral

Criar a camada de persistência do catálogo compartilhado e das coleções privadas, com migrations versionadas, constraints, índices, RLS e dados mínimos para desenvolvimento e testes.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de Supabase, PostgreSQL e RLS.
- `.agents/skills/nodejs-typescript-conventions`: manter scripts e utilitários em TypeScript quando houver código auxiliar.
- `.agents/skills/vitest-testing`: cobrir constraints e isolamento de dados com testes de integração.
- `.agents/skills/code-standards-en`: manter nomes técnicos consistentes em inglês.
</skills>

<requirements>

- Criar tabelas `profiles`, `albums`, `album_sections`, `stickers` e `collection_items`.
- Aplicar unicidade de código de figurinha por álbum.
- Aplicar quantidade não negativa em itens de coleção.
- Garantir isolamento de dados privados por usuário via RLS.
- Criar índices necessários para busca por código, progresso, faltantes e repetidas.
- Criar seed mínimo para testes sem depender de checklist externo.
</requirements>

## Subtarefas

- [ ] 2.1 Criar migrations SQL versionadas para o modelo de dados.
- [ ] 2.2 Adicionar constraints de unicidade, integridade referencial e quantidade não negativa.
- [ ] 2.3 Criar índices para álbum, seção, código e itens de coleção por usuário.
- [ ] 2.4 Configurar RLS para `profiles` e `collection_items`.
- [ ] 2.5 Configurar políticas de leitura e escrita do catálogo para usuários autenticados no MVP.
- [ ] 2.6 Criar seed mínimo com álbum, seções e figurinhas de exemplo.
- [ ] 2.7 Adicionar documentação de execução de migrations e reset local.
- [ ] 2.8 Validar que dados de um usuário não aparecem para outro usuário.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "Modelos de dados", "Pontos de integração", "Testes de integração" e "Riscos conhecidos".

## Critérios de sucesso

- Migrations criam o schema completo em banco limpo.
- Constraints bloqueiam código duplicado dentro do mesmo álbum e quantidade negativa.
- RLS impede acesso cruzado a perfis e coleções.
- Seed permite testar fluxos sem integração externa.

## Testes da tarefa

- [ ] Testes unitários: validação de helpers de normalização ou montagem de fixtures, se existirem.
- [ ] Testes de integração: migrations, constraints, índices esperados e políticas RLS multiusuário.
- [ ] Testes E2E: não aplicável nesta tarefa.

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `supabase/migrations/**`
- `supabase/seed.sql`
- `apps/api/src/**/data/**`
- `.env.example`
