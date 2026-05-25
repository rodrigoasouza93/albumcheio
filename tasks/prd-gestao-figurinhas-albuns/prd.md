# Documento de Requisitos do Produto (PRD)

## Visão Geral

O produto é um sistema web para gestão de figurinhas de álbuns de campeonatos, começando pelo álbum Panini da Copa do Mundo 2026 e mantendo flexibilidade para cadastrar álbuns de outros campeonatos no futuro.

O problema principal é permitir que colecionadores saibam, com rapidez e confiança, quais figurinhas já possuem, quais ainda faltam e quais estão repetidas para possíveis trocas. Hoje esse controle costuma ser feito em papel, planilhas ou anotações dispersas, o que dificulta consultar uma figurinha específica, acompanhar o progresso do álbum e organizar repetidas.

O sistema será direcionado a colecionadores individuais, famílias e grupos de amigos que desejam manter seus próprios registros. A primeira versão deve considerar múltiplos usuários, mas a experiência de troca entre usuários ficará para uma etapa futura. O valor inicial está em centralizar o controle do álbum, reduzir dúvidas durante compras e trocas presenciais, e dar uma visão clara do progresso de completude.

## Objetivos

- Permitir que cada usuário registre as figurinhas que possui em um álbum cadastrado.
- Permitir que cada usuário registre a quantidade de figurinhas repetidas disponíveis para troca futura.
- Permitir consulta rápida por código da figurinha para indicar se o usuário possui, não possui ou possui repetidas.
- Exibir o percentual de completude do álbum inteiro.
- Exibir o percentual de completude por agrupamento do álbum, como figurinhas do campeonato/FIFA e figurinhas por seleção.
- Suportar cadastro manual de álbuns, seções e figurinhas para viabilizar qualquer campeonato, não apenas a Copa do Mundo 2026.
- Medir sucesso por: usuários conseguindo cadastrar álbuns e figurinhas, registrar posse e repetidas, pesquisar por código e visualizar progresso sem depender de listas externas prontas.

## Histórias de Usuário

- Como colecionador, eu quero cadastrar um álbum de campeonato para poder organizar minhas figurinhas em um só lugar.
- Como administrador ou usuário responsável pelo cadastro, eu quero cadastrar manualmente seções e figurinhas de um álbum para que o sistema aceite álbuns sem checklist importado.
- Como colecionador da Copa Panini 2026, eu quero registrar que possuo a figurinha `FWC01` para acompanhar meu progresso nas figurinhas do campeonato.
- Como colecionador, eu quero registrar que possuo a figurinha `BRA01` para controlar minhas figurinhas por seleção.
- Como colecionador, eu quero registrar quantas unidades repetidas tenho de uma figurinha para saber o que posso oferecer em trocas presenciais.
- Como colecionador, eu quero pesquisar uma figurinha por código para saber rapidamente se já a possuo antes de trocar ou comprar.
- Como colecionador, eu quero visualizar o percentual de completude do álbum para entender meu avanço geral.
- Como colecionador, eu quero visualizar o progresso por seleção e por seção do campeonato para identificar onde faltam mais figurinhas.
- Como usuário recorrente, eu quero acessar apenas os meus registros de coleção para que minhas informações não se misturem com as de outros usuários.
- Como novo usuário, eu quero uma experiência clara para começar a usar o sistema sem precisar configurar funcionalidades avançadas de troca.

## Principais funcionalidades

### Cadastro de álbuns

Permite criar álbuns de campeonatos com nome, edição e organização básica. É importante para que o produto não fique limitado ao álbum da Copa Panini 2026.

Requisitos funcionais:

1. O sistema deve permitir cadastrar um álbum de campeonato.
2. O sistema deve permitir identificar o nome e a edição do álbum.
3. O sistema deve permitir organizar o álbum em seções, como campeonato/FIFA e seleções.
4. O sistema deve permitir que um álbum tenha figurinhas de diferentes seleções ou agrupamentos.

### Cadastro manual de figurinhas

Permite registrar manualmente as figurinhas existentes em cada álbum. Na Copa Panini 2026, exemplos de códigos incluem `FWC01` para figurinhas da FIFA/campeonato e `BRA01` para figurinhas do Brasil.

Requisitos funcionais:

5. O sistema deve permitir cadastrar figurinhas vinculadas a um álbum.
6. O sistema deve permitir informar código da figurinha.
7. O sistema deve permitir informar número da figurinha.
8. O sistema deve permitir associar cada figurinha a uma seção ou seleção.
9. O sistema deve impedir ambiguidade de código dentro do mesmo álbum.

### Registro da coleção do usuário

Permite que cada usuário marque as figurinhas que possui e registre quantidades. É a funcionalidade central para acompanhar o álbum.

Requisitos funcionais:

10. O sistema deve permitir que múltiplos usuários tenham coleções independentes no mesmo álbum.
11. O sistema deve permitir que o usuário registre que possui uma figurinha.
12. O sistema deve permitir que o usuário remova ou corrija o registro de posse de uma figurinha.
13. O sistema deve permitir registrar quantidade total possuída por figurinha.
14. O sistema deve considerar uma figurinha como repetida quando a quantidade possuída for maior que uma unidade.
15. O sistema deve exibir a quantidade repetida disponível para troca futura.

### Consulta por código

Permite pesquisar rapidamente uma figurinha para apoiar decisões de compra ou troca presencial.

Requisitos funcionais:

16. O sistema deve permitir pesquisar figurinhas por código dentro de um álbum.
17. O sistema deve indicar se o usuário possui ou não possui a figurinha pesquisada.
18. O sistema deve indicar se o usuário possui unidades repetidas da figurinha pesquisada.
19. O sistema deve diferenciar resultado inexistente de figurinha cadastrada mas ainda não possuída.

### Visualização de progresso

Permite acompanhar a completude do álbum e identificar lacunas por agrupamento.

Requisitos funcionais:

20. O sistema deve exibir o percentual de completude geral do álbum para o usuário.
21. O sistema deve exibir quantidade de figurinhas possuídas e faltantes no álbum.
22. O sistema deve exibir percentual de completude por seção, incluindo campeonato/FIFA e seleções.
23. O sistema deve listar figurinhas faltantes por álbum e por seção.
24. O sistema deve listar figurinhas repetidas do usuário.

## Experiência do usuário

A experiência principal deve ser rápida, objetiva e adequada ao uso durante organização física de figurinhas, compras ou trocas presenciais. O usuário deve conseguir alternar entre visão geral do álbum, lista de faltantes, lista de repetidas e busca por código sem esforço.

Personas primárias:

- Colecionador individual que quer acompanhar o próprio álbum.
- Responsável por organizar o álbum de uma criança ou família.
- Colecionador que participa de trocas presenciais e precisa consultar códigos rapidamente.

Fluxos principais:

- Entrar no sistema, selecionar um álbum e visualizar o progresso geral.
- Pesquisar uma figurinha por código e receber status de posse e repetidas.
- Abrir uma seção ou seleção para marcar figurinhas possuídas.
- Registrar quantidade total de uma figurinha e visualizar automaticamente se há repetidas.
- Consultar a lista de figurinhas faltantes antes de comprar ou trocar.
- Consultar a lista de repetidas antes de encontrar outros colecionadores.

Considerações de UI/UX:

- Códigos de figurinhas devem ter destaque visual e ser fáceis de escanear.
- A busca por código deve estar disponível em local evidente nas telas principais do álbum.
- Progresso geral e por seção deve ser apresentado de forma clara, com percentual e contadores.
- A interface deve evitar excesso de passos para marcar posse ou repetição.
- Listas de faltantes e repetidas devem permitir leitura rápida em dispositivos móveis.

Requisitos de acessibilidade:

- Todas as ações principais devem ser utilizáveis por teclado.
- Estados de posse, faltante e repetida não devem depender apenas de cor.
- Textos, códigos e percentuais devem ter contraste adequado.
- Campos de busca e formulários devem ter rótulos claros.
- Mensagens de erro devem explicar o problema e a ação esperada.

## Restrições técnicas de alto nível

- O sistema deve considerar múltiplos usuários desde a primeira versão.
- Os registros de coleção devem ser privados por usuário, mesmo quando o álbum base for compartilhado.
- O produto deve permitir cadastro manual de álbuns e figurinhas, sem depender de integração externa ou importação automática no MVP.
- O modelo de dados do produto deve aceitar álbuns de diferentes campeonatos, seções e padrões de código.
- Códigos de figurinhas devem ser tratados como identificadores importantes para busca e validação dentro do álbum.
- Dados de usuários e coleções devem ser protegidos contra acesso indevido.
- A experiência deve funcionar bem em desktop e dispositivos móveis.
- O sistema não deve assumir que todos os álbuns terão a mesma estrutura da Copa Panini 2026.
- Informações oficiais de álbuns podem variar por edição, país ou produto; por isso o cadastro manual deve ser a fonte de verdade no MVP.

## Fora do escopo

- Compra e venda de figurinhas.
- Chat ou comunicação direta entre usuários.
- Ranking de usuários ou colecionadores.
- Marketplace de figurinhas.
- Notificações.
- Matching automático de trocas entre usuários.
- Fluxo completo de negociação ou confirmação de trocas.
- Importação automática de checklist de figurinhas.
- Integrações com APIs externas da Panini, FIFA ou terceiros.
- Leitura automática por imagem, QR code ou OCR.
- Regras específicas de preço, raridade ou avaliação comercial de figurinhas.
- Funcionalidades administrativas avançadas além do cadastro manual necessário para operar álbuns e figurinhas.
