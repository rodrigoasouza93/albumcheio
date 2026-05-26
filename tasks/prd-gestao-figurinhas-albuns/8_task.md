# Tarefa 8.0: Implementar frontend de coleção, quantidades, busca, progresso, faltantes e repetidas

## Visão geral

Criar a experiência principal do colecionador no detalhe do álbum: registrar quantidade possuída, consultar código rapidamente, visualizar progresso, faltantes e repetidas.

<skills>
### Conformidade com skills

- `.agents/skills/context7`: consultar documentação atual de Next.js, React e bibliotecas usadas no frontend.
- `.agents/skills/nodejs-typescript-conventions`: manter tipos de API e lógica de estado em TypeScript.
- `.agents/skills/react-frontend-conventions`: usar componentes funcionais, hooks, Tailwind e testes de componentes.
- `.agents/skills/repo-folder-structure`: organizar `features/collection` e integrações com `features/albums`.
- `.agents/skills/vitest-testing`: cobrir componentes, hooks e fluxos de integração.
- `.agents/skills/code-standards-en`: manter nomes técnicos em inglês.
- `.agents/skills/ui-ux-pro-max`: aplicar acessibilidade, responsividade, contraste e leitura rápida em mobile.
  </skills>

<requirements>

- Permitir marcar posse e alterar `quantity_total` de cada figurinha.
- Exibir repetidas derivadas da quantidade total.
- Disponibilizar busca por código em local evidente do detalhe do álbum.
- Diferenciar visualmente e textualmente possuída, faltante, repetida e inexistente.
- Exibir progresso geral com percentual e contadores.
- Exibir progresso por seção.
- Listar figurinhas faltantes e repetidas.
- Evitar depender apenas de cor para comunicar status.
- Funcionar bem em uso mobile durante compra ou troca presencial.
  </requirements>

## Subtarefas

- [x] 8.1 Criar tela de detalhe do álbum com resumo de progresso.
- [x] 8.2 Criar componentes de progresso geral e por seção.
- [x] 8.3 Criar busca rápida por código com estados de resultado.
- [x] 8.4 Criar controle de quantidade total por figurinha.
- [x] 8.5 Criar lista de figurinhas por seção com status de posse.
- [x] 8.6 Criar view/lista de faltantes com filtro por seção.
- [x] 8.7 Criar view/lista de repetidas com quantidade disponível.
- [x] 8.8 Atualizar dados após mudança de quantidade sem inconsistência visual.
- [x] 8.9 Validar acessibilidade de estados, foco, contraste e navegação por teclado.
- [x] 8.10 Validar responsividade para leitura rápida de códigos em mobile.

## Detalhes de implementação

Referenciar `techspec.md` nas seções "features/collection", "Endpoints da API", "Abordagem de testes", "Sequenciamento do desenvolvimento" item 7 e o PRD em "Registro da coleção do usuário", "Consulta por código" e "Visualização de progresso".

## Critérios de sucesso

- Usuário registra quantidades e vê posse/repetidas refletidas corretamente.
- Busca por código retorna resultado rápido e distinguível para todos os estados esperados.
- Progresso geral e por seção atualiza a partir das quantidades registradas.
- Faltantes e repetidas são legíveis e úteis em mobile.

## Testes da tarefa

- [x] Testes unitários: contador de quantidade, cards de progresso, busca por código e estados de status.
- [x] Testes de integração: alteração de quantidade, invalidação de cache/estado, busca, faltantes e repetidas com API mockada ou ambiente de teste.
- [ ] Testes E2E: fluxo completo será coberto e consolidado na tarefa 9.

## Notas de implementação

- Criado `features/collection` com dashboard, resumo de progresso, busca rápida, lista de quantidades e listas de faltantes/repetidas.
- Adicionadas chamadas tipadas no client para `search`, `progress`, `missing`, `duplicates` e `PATCH /collection-items/:stickerId`.
- A alteração de quantidade atualiza o mapa local de quantidades e recarrega progresso, faltantes e repetidas para evitar estado visual inconsistente.
- Estados usam texto e cor para comunicar `Owned`, `Missing`, `Repeated` e `Not in this album`, com foco visível e controles `min-height: 44px` para uso mobile.
- Corrigido o retorno de confirmação de e-mail do Supabase: o frontend consome `#access_token`/`refresh_token`, salva a sessão e remove o fragmento da URL.
- Login e `/me` agora criam o perfil ausente de forma idempotente quando o cadastro ficou aguardando confirmação de e-mail e a linha em `profiles` ainda não existia.
- Corrigida a validação de usuário autenticado no backend para aceitar a resposta direta de `GET /auth/v1/user`, evitando erro 500 em endpoints protegidos como `/albums`.
- Corrigido mismatch de hidratação no Next: o `SessionProvider` começa em `loading` tanto no servidor quanto no cliente e só lê `localStorage` após hidratar.
- Corrigido carregamento de faltantes e repetidas para paginar em lotes de 100, respeitando o limite validado pela API.

## Verificação

- `pnpm --filter @albumcheio/api test`
- `pnpm --filter @albumcheio/web test`
- `pnpm --filter @albumcheio/api build`
- `pnpm --filter @albumcheio/web build`
- `pnpm run lint`

## Arquivos relevantes

- `tasks/prd-gestao-figurinhas-albuns/prd.md`
- `tasks/prd-gestao-figurinhas-albuns/techspec.md`
- `apps/web/src/features/collection/**`
- `apps/web/src/features/albums/**`
- `apps/web/src/lib/**`
