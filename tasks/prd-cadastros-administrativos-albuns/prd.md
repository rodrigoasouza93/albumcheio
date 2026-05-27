# Documento de Requisitos do Produto (PRD)

## Visão Geral

Esta funcionalidade redefine a separação de responsabilidades entre usuários administradores e usuários comuns no sistema de gestão de figurinhas de álbuns de campeonatos.

O cadastro de álbuns, seções e figurinhas será realizado exclusivamente por usuários administradores. Esses administradores não serão cadastrados por uma tela do produto; o perfil administrativo será definido diretamente na base de dados. Usuários comuns passam a consumir os catálogos publicados pelos administradores e podem apenas registrar o status das figurinhas em sua própria coleção.

O problema resolvido é evitar que usuários comuns criem ou alterem dados estruturais compartilhados, como álbuns, seções e figurinhas, preservando a consistência do catálogo. Ao mesmo tempo, o produto continua permitindo que cada colecionador controle de forma independente quais figurinhas possui, quais faltam e quais estão repetidas.

O valor principal está em separar claramente o catálogo global, curado por administradores, dos registros pessoais de coleção, mantidos por cada usuário.

## Objetivos

- Garantir que apenas usuários administradores possam criar, editar, publicar, despublicar ou remover álbuns, seções e figurinhas.
- Permitir múltiplos administradores definidos diretamente na base de dados.
- Impedir que usuários comuns alterem dados globais de catálogo.
- Permitir que usuários comuns visualizem apenas álbuns publicados e ativos.
- Permitir que administradores mantenham álbuns inativos enquanto ainda estão configurando seções e figurinhas.
- Permitir que administradores publiquem e despubliquem álbuns conforme a disponibilidade do catálogo.
- Manter a capacidade de usuários comuns registrarem sua própria coleção, incluindo posse, faltantes e repetidas.
- Medir sucesso por: ausência de alterações indevidas no catálogo por usuários comuns, catálogo publicado visível aos usuários, catálogos em configuração ocultos para usuários comuns e usuários conseguindo atualizar sua própria coleção normalmente.

## Histórias de Usuário

- Como administrador, eu quero cadastrar álbuns para disponibilizar catálogos oficiais aos colecionadores.
- Como administrador, eu quero cadastrar seções de um álbum para organizar figurinhas por agrupamento, seleção ou categoria.
- Como administrador, eu quero cadastrar figurinhas vinculadas a seções para que usuários comuns possam controlar suas coleções com base em um catálogo consistente.
- Como administrador, eu quero manter um álbum inativo enquanto ele ainda está em configuração para evitar que usuários comuns consumam um catálogo incompleto.
- Como administrador, eu quero publicar um álbum quando o cadastro estiver pronto para que usuários comuns possam acessá-lo.
- Como administrador, eu quero despublicar um álbum quando ele precisar ser corrigido ou retirado temporariamente do acesso comum.
- Como usuário comum, eu quero visualizar os álbuns ativos para escolher qual coleção desejo acompanhar.
- Como usuário comum, eu quero consultar seções e figurinhas de álbuns ativos para controlar minha coleção pessoal.
- Como usuário comum, eu quero atualizar o status das minhas figurinhas para saber quais possuo, quais faltam e quais tenho repetidas.
- Como usuário comum, eu quero ter certeza de que minhas atualizações não alteram o catálogo usado por outros usuários.

## Principais funcionalidades

### Perfis administrativos definidos na base de dados

O sistema deve reconhecer usuários administradores a partir de informações registradas diretamente na base de dados. Não haverá, nesta funcionalidade, uma interface para promover, rebaixar ou gerenciar administradores.

Requisitos funcionais:

1. O sistema deve diferenciar usuários administradores de usuários comuns.
2. O sistema deve permitir múltiplos usuários administradores.
3. O sistema deve considerar como administrador apenas usuários marcados como tal na base de dados.
4. O sistema não deve permitir que usuários comuns alterem seu próprio perfil para administrador.
5. O sistema não deve oferecer tela de gestão de administradores nesta funcionalidade.

### Cadastro administrativo de álbuns

Administradores devem ser os únicos perfis autorizados a criar e manter álbuns. Usuários comuns podem consumir álbuns disponíveis, mas não podem criar ou alterar esses registros.

Requisitos funcionais:

6. O sistema deve permitir que administradores cadastrem álbuns.
7. O sistema deve permitir que administradores editem dados de álbuns.
8. O sistema deve permitir que administradores removam ou descontinuem álbuns conforme regras do produto.
9. O sistema deve bloquear cadastro, edição e remoção de álbuns por usuários comuns.
10. O sistema deve distinguir álbuns ativos de álbuns inativos.

### Cadastro administrativo de seções e figurinhas

Seções e figurinhas fazem parte do catálogo global de um álbum e devem ser mantidas exclusivamente por administradores.

Requisitos funcionais:

11. O sistema deve permitir que administradores cadastrem seções em um álbum.
12. O sistema deve permitir que administradores editem seções existentes.
13. O sistema deve permitir que administradores removam ou descontinuem seções conforme regras do produto.
14. O sistema deve permitir que administradores cadastrem figurinhas vinculadas a seções.
15. O sistema deve permitir que administradores editem figurinhas existentes.
16. O sistema deve permitir que administradores removam ou descontinuem figurinhas conforme regras do produto.
17. O sistema deve bloquear cadastro, edição e remoção de seções por usuários comuns.
18. O sistema deve bloquear cadastro, edição e remoção de figurinhas por usuários comuns.

### Publicação e despublicação de álbuns

Administradores devem controlar quando um álbum fica disponível para usuários comuns. Um álbum inativo pode ser usado pelo admin durante a configuração, mas não deve aparecer como opção de consumo para usuários comuns.

Requisitos funcionais:

19. O sistema deve permitir que administradores publiquem um álbum.
20. O sistema deve permitir que administradores despubliquem um álbum.
21. O sistema deve impedir que usuários comuns visualizem álbuns inativos.
22. O sistema deve permitir que administradores visualizem álbuns ativos e inativos.
23. O sistema deve indicar claramente para administradores o status de publicação de cada álbum.
24. O sistema deve impedir que usuários comuns iniciem ou atualizem coleção vinculada a álbum inativo, exceto quando regras futuras definirem outro comportamento.

### Consumo do catálogo por usuários comuns

Usuários comuns devem consumir os dados cadastrados por administradores sem alterar o catálogo compartilhado.

Requisitos funcionais:

25. O sistema deve permitir que usuários comuns listem álbuns ativos.
26. O sistema deve permitir que usuários comuns visualizem seções de álbuns ativos.
27. O sistema deve permitir que usuários comuns visualizem figurinhas de álbuns ativos.
28. O sistema deve impedir que usuários comuns visualizem opções de criação ou edição de catálogo.
29. O sistema deve apresentar mensagens adequadas quando um álbum não estiver disponível para consumo.

### Atualização da coleção pessoal

Usuários comuns devem poder atualizar apenas os dados relacionados à sua própria coleção, sem afetar o catálogo global nem a coleção de outros usuários.

Requisitos funcionais:

30. O sistema deve permitir que usuários comuns registrem a posse de figurinhas em sua própria coleção.
31. O sistema deve permitir que usuários comuns corrijam o status de posse de suas próprias figurinhas.
32. O sistema deve permitir que usuários comuns registrem quantidades repetidas em sua própria coleção.
33. O sistema deve impedir que um usuário comum altere a coleção de outro usuário.
34. O sistema deve manter o catálogo compartilhado inalterado quando usuários comuns atualizarem suas coleções.

## Experiência do usuário

A experiência deve deixar clara a diferença entre área administrativa e experiência de coleção pessoal.

Para administradores, o sistema deve destacar as ações de manutenção do catálogo, incluindo cadastro de álbuns, cadastro de seções, cadastro de figurinhas e controle de publicação. O status ativo ou inativo de cada álbum deve ser visível, fácil de entender e difícil de acionar por engano.

Para usuários comuns, a experiência deve ser focada no consumo de álbuns ativos e na atualização rápida da própria coleção. Eles não devem encontrar ações administrativas, formulários de cadastro de catálogo ou opções que sugiram permissão para modificar álbuns, seções ou figurinhas.

Fluxos principais:

- Administrador acessa a área de catálogo, cria um álbum e mantém o álbum inativo durante a configuração.
- Administrador cadastra seções e figurinhas no álbum inativo.
- Administrador publica o álbum quando o catálogo estiver pronto.
- Usuário comum acessa a lista de álbuns e vê apenas álbuns ativos.
- Usuário comum abre um álbum ativo e atualiza o status das próprias figurinhas.
- Administrador despublica um álbum quando precisar ocultá-lo temporariamente dos usuários comuns.

Considerações de UI/UX:

- O status ativo ou inativo do álbum deve ser apresentado com texto claro, não apenas cor.
- Ações administrativas devem estar disponíveis apenas em contextos de administrador.
- Usuários comuns devem ter navegação limpa, sem botões desabilitados para ações administrativas que não podem executar.
- A atualização de coleção deve continuar rápida e simples para uso em desktop e dispositivos móveis.
- Mensagens de acesso negado ou indisponibilidade devem explicar o que aconteceu sem expor detalhes internos.

Requisitos de acessibilidade:

- Todas as ações administrativas e de coleção devem ser utilizáveis por teclado.
- Estados de publicação, posse, faltante e repetida não devem depender apenas de cor.
- Controles de publicação devem ter rótulos claros e indicar consequência da ação.
- Mensagens de erro e validação devem ser compreensíveis por leitores de tela.
- Contraste, foco visível e hierarquia de informação devem ser mantidos em telas administrativas e comuns.

## Restrições técnicas de alto nível

- O sistema deve preservar separação de permissões entre administradores e usuários comuns.
- O perfil administrativo deve ser definido na base de dados, sem interface de gestão de administradores nesta funcionalidade.
- Usuários comuns não devem conseguir criar, editar, remover, publicar ou despublicar dados de catálogo.
- Álbuns inativos não devem ser consumidos por usuários comuns.
- Administradores devem conseguir acessar álbuns ativos e inativos para manutenção.
- Registros pessoais de coleção devem permanecer privados e isolados por usuário.
- Alterações de status de coleção feitas por usuários comuns não devem modificar dados globais do catálogo.
- A funcionalidade deve respeitar os mecanismos existentes de autenticação, autorização e proteção de dados do produto.
- A experiência deve funcionar adequadamente em desktop e dispositivos móveis.

## Fora do escopo

- Tela de gestão de usuários.
- Tela de gestão de administradores.
- Fluxo para promover ou remover administradores pela interface do produto.
- Auditoria detalhada de alterações administrativas.
- Importação em massa de álbuns, seções ou figurinhas.
- Sugestão de correções de catálogo por usuários comuns.
- Aprovação ou moderação de sugestões de usuários comuns.
- Compra, venda ou negociação de figurinhas.
- Matching automático de trocas.
- Integrações externas com Panini, FIFA ou terceiros.
- Definição técnica de banco de dados, endpoints, componentes ou arquitetura de implementação.
