# Documento de Requisitos do Produto (PRD)

## Visão Geral

Esta melhoria tem como objetivo tornar a experiência de gestão da coleção mais leve, objetiva e rápida para usuários finais e administradores, reduzindo informações desnecessárias na tela e evitando o carregamento inicial de listagens extensas.

Atualmente, a tela apresenta muito conteúdo logo no primeiro acesso, incluindo a seção "Resumo do catálogo" e listas completas de figurinhas, faltantes e repetidas. Isso aumenta o tempo percebido de carregamento, cria um scroll muito longo e expõe ao usuário final informações de configuração que não são necessárias para o uso diário da coleção.

A funcionalidade é direcionada principalmente ao usuário final que registra suas figurinhas e consulta faltantes/repetidas, mas também beneficia administradores ao tornar listagens grandes carregadas apenas sob demanda. O valor esperado é uma tela inicial mais rápida, mais limpa e mais focada no progresso do álbum, mantendo acesso às listas detalhadas quando o usuário selecionar uma seção específica.

## Objetivos

- Reduzir a quantidade de informação exibida no carregamento inicial da tela de coleção.
- Remover a seção "Resumo do catálogo" da experiência do usuário final.
- Manter o acesso ao "Resumo do catálogo" para administradores, pois ele apoia validação e configuração do álbum.
- Evitar que listas extensas de figurinhas, faltantes e repetidas sejam carregadas automaticamente antes da seleção de uma seção.
- Preservar a visualização atual de progresso, pois ela está adequada e útil para o usuário.
- Diminuir o scroll inicial da tela, especialmente em álbuns com muitas seções e figurinhas.
- Melhorar a performance percebida da tela inicial sem remover funcionalidades existentes.

## Histórias de Usuário

- Como usuário final, eu quero abrir a tela da minha coleção sem ver informações técnicas do catálogo para focar apenas no meu progresso e nas minhas ações.
- Como usuário final, eu quero selecionar uma seção antes de carregar a lista de figurinhas para consultar apenas o conjunto que estou organizando no momento.
- Como usuário final, eu quero ver uma mensagem clara quando nenhuma seção estiver selecionada para entender o próximo passo.
- Como usuário final, eu quero continuar podendo consultar todas as seções quando necessário, mesmo que essa opção seja mais pesada.
- Como administrador, eu quero continuar visualizando o resumo do catálogo para validar se seções e figurinhas foram cadastradas corretamente.
- Como administrador, eu quero que listas grandes também não sejam carregadas automaticamente para evitar lentidão em álbuns extensos.
- Como usuário recorrente, eu quero manter a visualização de progresso atual para acompanhar meu avanço sem perder a clareza visual existente.

## Principais funcionalidades

### Remoção do resumo do catálogo para usuário final

A seção "Resumo do catálogo" deve deixar de aparecer para usuários finais, pois apresenta dados de configuração compartilhados por todos os usuários e não contribui para o fluxo principal de controle da coleção.

Requisitos funcionais:

1. O sistema deve ocultar a seção "Resumo do catálogo" para usuários finais.
2. O sistema deve manter a seção "Resumo do catálogo" disponível para administradores.
3. O sistema deve garantir que a remoção do resumo para usuários finais não afete a visualização de progresso da coleção.
4. O sistema deve evitar que usuários finais tenham que percorrer informações de configuração antes de acessar ações da coleção.

### Carregamento de figurinhas por seção selecionada

As listagens de quantidades de figurinhas devem iniciar sem itens carregados e só devem exibir dados após o usuário selecionar uma seção. Isso reduz o volume inicial de informação e evita carregar listas muito grandes sem intenção explícita.

Requisitos funcionais:

5. O sistema deve iniciar a seção "Quantidades de figurinhas" sem carregar a listagem completa de figurinhas.
6. O sistema deve exibir uma mensagem vazia orientando o usuário a selecionar uma seção quando nenhuma seção estiver selecionada.
7. O sistema deve carregar e exibir as figurinhas apenas da seção selecionada pelo usuário.
8. O sistema deve permitir que a seleção de seção seja alterada sem exigir recarregamento manual da página.
9. O sistema deve manter as ações existentes de edição de quantidade para as figurinhas carregadas da seção selecionada.

### Carregamento de faltantes e repetidas por seção selecionada

As listas de faltantes e repetidas também devem iniciar vazias e só devem ser carregadas após a seleção de uma seção. Essa mudança deve valer para todos os tipos de usuário, pois o problema de listas grandes afeta a performance e a usabilidade em qualquer perfil.

Requisitos funcionais:

10. O sistema deve iniciar a seção "Faltantes e repetidas" sem carregar as listas de faltantes e repetidas.
11. O sistema deve exibir uma mensagem vazia orientando o usuário a selecionar uma seção quando nenhuma seção estiver selecionada.
12. O sistema deve carregar a lista de faltantes apenas para a seção selecionada.
13. O sistema deve carregar a lista de repetidas apenas para a seção selecionada.
14. O sistema deve aplicar esse comportamento para usuários finais e administradores.
15. O sistema deve manter a leitura rápida das listas após a seleção de uma seção.

### Ordenação da opção "Todas as seções"

A opção "Todas as seções" deve continuar disponível, mas deve aparecer por último nas seleções. Essa opção representa uma consulta mais ampla e potencialmente mais demorada, portanto deve ser uma escolha consciente do usuário.

Requisitos funcionais:

16. O sistema deve manter a opção "Todas as seções" nos seletores de seção.
17. O sistema deve posicionar a opção "Todas as seções" como a última opção da lista.
18. O sistema deve apresentar as seções específicas antes da opção "Todas as seções".
19. O sistema deve permitir que o usuário carregue a visão consolidada de todas as seções quando escolher explicitamente essa opção.

### Preservação da visualização de progresso

A visualização de progresso atual deve ser preservada, pois está clara e visualmente adequada para acompanhamento do álbum. As melhorias devem reduzir excesso de listagens e informações secundárias sem comprometer a percepção de avanço do usuário.

Requisitos funcionais:

20. O sistema deve manter a visualização de progresso atual disponível na tela de coleção.
21. O sistema não deve alterar a lógica de cálculo do progresso nesta melhoria.
22. O sistema não deve remover indicadores de progresso geral ou por seção já existentes, salvo ajustes necessários para acomodar a simplificação da tela.

## Experiência do usuário

A tela inicial da coleção deve ficar mais direta: o usuário deve ver o progresso e controles principais, sem ser imediatamente exposto a listas extensas ou ao resumo técnico do catálogo. As listagens devem funcionar como consultas sob demanda, carregadas a partir de uma escolha explícita de seção.

Para o usuário final, a jornada esperada é:

- Abrir a coleção e visualizar o progresso do álbum sem excesso de conteúdo.
- Escolher uma seção específica para informar quantidades de figurinhas.
- Ver uma mensagem clara quando nenhuma seção estiver selecionada.
- Escolher uma seção específica para consultar faltantes e repetidas.
- Usar "Todas as seções" apenas quando desejar uma visão consolidada.

Para o administrador, a jornada esperada é:

- Abrir a coleção ou área relacionada e continuar podendo conferir o resumo do catálogo.
- Usar as listagens sob demanda por seção, evitando carregamento inicial excessivo.
- Selecionar "Todas as seções" quando precisar validar ou conferir dados consolidados.

Considerações de UI/UX:

- A mensagem vazia deve ser objetiva e indicar a ação esperada, como selecionar uma seção.
- Os seletores devem privilegiar seções específicas e deixar "Todas as seções" por último.
- A tela inicial deve reduzir o scroll causado por listas grandes.
- A visualização de progresso deve continuar em destaque e sem mudanças bruscas de leitura.
- O usuário deve perceber que as listas estão disponíveis, mas dependem de uma seleção.

Requisitos de acessibilidade:

- Os seletores de seção devem ter rótulos claros.
- A mensagem de estado vazio deve ser lida corretamente por tecnologias assistivas.
- A seleção de seção e a navegação pelas listas carregadas devem ser possíveis por teclado.
- A ausência de itens carregados inicialmente não deve ser comunicada apenas por espaço vazio.
- Estados de carregamento, vazio e conteúdo disponível devem ter texto compreensível.

## Restrições técnicas de alto nível

- A melhoria deve respeitar os perfis existentes de usuário final e administrador.
- O resumo do catálogo deve permanecer disponível para administradores.
- O comportamento de carregamento sob demanda das listagens deve valer para todos os perfis.
- A experiência deve funcionar bem em desktop e dispositivos móveis.
- A visualização de progresso existente deve ser preservada.
- A opção "Todas as seções" deve continuar disponível, mas tratada como escolha explícita.
- Não há meta numérica de performance definida para esta melhoria, mas a tela inicial deve reduzir demora percebida e excesso de scroll.
- Dados de coleção e permissões de perfil devem continuar respeitando as regras existentes do sistema.

## Fora do escopo

- Alterações na lógica de cálculo do progresso da coleção.
- Redesign completo da tela de progresso.
- Mudanças no fluxo de busca por código de figurinha.
- Mudanças no cadastro de álbuns, seções ou figurinhas.
- Mudanças nas regras de autenticação, autorização ou perfis além da visibilidade do resumo do catálogo.
- Criação de novas métricas analíticas ou dashboards de performance.
- Importação automática de figurinhas ou seções.
- Alterações em funcionalidades de compra, venda, troca ou matching entre usuários.
