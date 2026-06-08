# Documento de Requisitos do Produto (PRD)

## Visão Geral

Esta funcionalidade permite que o usuário gere e exporte listas de figurinhas faltantes ou repetidas para compartilhar fora do sistema, especialmente em contextos de troca presencial, conversas por aplicativos de mensagem e organização pessoal.

Hoje o sistema já permite consultar figurinhas faltantes e repetidas dentro da coleção, mas o usuário ainda precisa copiar manualmente essas informações ou enviar capturas de tela quando deseja compartilhar sua necessidade de troca. Isso é pouco prático em navegador mobile, aumenta chance de erro e dificulta conversas rápidas com outros colecionadores.

A funcionalidade é direcionada a colecionadores que usam o sistema via navegador web ou navegador mobile e precisam levar suas listas para fora da aplicação. O formato recomendado para compartilhamento cotidiano será uma lista em texto, por ser mais leve, rápida e compatível com WhatsApp, email e outros canais. O PDF será uma alternativa de exportação para impressão, envio mais formal ou arquivamento.

O valor esperado é reduzir o esforço para compartilhar o que falta ou o que está repetido, mantendo privacidade ao exportar apenas a lista selecionada, sem dados pessoais do usuário.

## Objetivos

- Permitir que o usuário gere uma lista exportável de figurinhas faltantes.
- Permitir que o usuário gere uma lista exportável de figurinhas repetidas.
- Permitir que o usuário escolha uma seção específica do álbum antes de gerar a lista.
- Impedir que faltantes e repetidas sejam compartilhadas juntas na mesma exportação.
- Oferecer lista em texto como formato recomendado para compartilhamento rápido em web e mobile.
- Oferecer PDF como formato complementar para impressão, arquivamento ou envio mais formal.
- Exibir nas listas exportadas apenas informações da figurinha, sem dados pessoais do usuário.
- Reduzir ações manuais de cópia, digitação ou captura de tela para compartilhar listas.

## Histórias de Usuário

- Como colecionador, eu quero gerar uma lista das figurinhas que faltam para compartilhar com outras pessoas durante uma troca.
- Como colecionador, eu quero gerar uma lista das figurinhas repetidas para mostrar o que tenho disponível para trocar.
- Como usuário mobile, eu quero copiar ou compartilhar uma lista em texto para enviar rapidamente em aplicativos de mensagem.
- Como usuário web, eu quero exportar uma lista em PDF para imprimir ou guardar antes de um encontro de trocas.
- Como colecionador, eu quero escolher a seção do álbum que será compartilhada para enviar apenas informações relevantes.
- Como colecionador, eu quero escolher entre faltantes ou repetidas para evitar misturar objetivos diferentes na mesma lista.
- Como usuário preocupado com privacidade, eu quero que a lista compartilhada não inclua meu nome, email, progresso geral ou outros dados pessoais.
- Como usuário recorrente, eu quero que a lista gerada use nome, seção e código das figurinhas para que outras pessoas entendam com clareza o que estou procurando ou oferecendo.

## Principais funcionalidades

### Seleção do tipo de lista

O usuário deve escolher se deseja gerar uma lista de figurinhas faltantes ou uma lista de figurinhas repetidas. Essas listas devem permanecer separadas, pois representam intenções diferentes: procurar figurinhas para completar o álbum ou oferecer figurinhas para troca.

Requisitos funcionais:

1. O sistema deve permitir que o usuário escolha gerar uma lista de figurinhas faltantes.
2. O sistema deve permitir que o usuário escolha gerar uma lista de figurinhas repetidas.
3. O sistema não deve permitir gerar uma lista que misture faltantes e repetidas na mesma exportação.
4. O sistema deve comunicar claramente qual tipo de lista será gerado antes da exportação.

### Seleção de seção do álbum

O usuário deve escolher qual seção do álbum deseja compartilhar. Isso evita listas longas demais e permite que o usuário foque em uma seleção, time, grupo ou agrupamento específico cadastrado no álbum.

Requisitos funcionais:

5. O sistema deve permitir que o usuário selecione uma seção do álbum para gerar a lista.
6. O sistema deve gerar a lista apenas com figurinhas pertencentes à seção selecionada.
7. O sistema deve deixar claro qual seção foi usada na lista gerada.
8. O sistema deve lidar com seções sem figurinhas faltantes ou repetidas exibindo uma mensagem objetiva de ausência de itens.

### Conteúdo da lista exportada

A lista deve conter informações suficientes para que outra pessoa identifique as figurinhas sem precisar acessar o sistema. O conteúdo deve ser limitado aos dados da lista, sem incluir informações pessoais do usuário.

Requisitos funcionais:

9. A lista deve conter o nome da figurinha quando disponível.
10. A lista deve conter a seção da figurinha.
11. A lista deve conter o código da figurinha.
12. A lista não deve incluir nome, email, identificador, progresso geral ou qualquer outra informação pessoal do usuário.
13. A lista não precisa incluir quantidade de figurinhas repetidas no escopo inicial.
14. A lista deve manter uma ordenação consistente e fácil de conferir visualmente.

### Exportação em lista de texto

A lista em texto deve ser o formato recomendado para compartilhamento rápido, especialmente em navegador mobile. Ela deve permitir que o usuário leve o conteúdo para canais externos com baixo atrito.

Requisitos funcionais:

15. O sistema deve permitir gerar uma versão em texto da lista selecionada.
16. O sistema deve apresentar o formato de texto como opção recomendada para compartilhamento rápido.
17. O texto gerado deve ser legível quando enviado em aplicativos de mensagem, email ou campos de texto.
18. O texto gerado deve identificar se a lista corresponde a faltantes ou repetidas.
19. O texto gerado deve identificar a seção selecionada.

### Exportação em PDF

O PDF deve ser uma opção complementar para cenários em que o usuário deseja imprimir, arquivar ou enviar a lista em formato mais estruturado.

Requisitos funcionais:

20. O sistema deve permitir gerar uma versão em PDF da lista selecionada.
21. O PDF deve identificar se a lista corresponde a faltantes ou repetidas.
22. O PDF deve identificar a seção selecionada.
23. O PDF deve apresentar nome, seção e código das figurinhas de forma legível.
24. O PDF não deve incluir dados pessoais do usuário.
25. O PDF deve ser adequado para leitura em desktop e mobile após a geração.

## Experiência do usuário

A experiência deve ser rápida e orientada à ação. O usuário deve conseguir partir da lista que já consulta no sistema, escolher o tipo de lista, escolher a seção e gerar o conteúdo em texto ou PDF sem precisar entender configurações técnicas.

Fluxo principal esperado:

- O usuário acessa a área de faltantes e repetidas da coleção.
- O usuário escolhe compartilhar ou exportar uma lista.
- O usuário seleciona se deseja faltantes ou repetidas.
- O usuário escolhe a seção do álbum.
- O usuário escolhe lista em texto como formato recomendado ou PDF como alternativa.
- O sistema gera somente a lista selecionada, sem dados pessoais.
- O usuário usa o conteúdo gerado fora do sistema.

Considerações de UI/UX:

- A opção de texto deve ser apresentada como recomendada para compartilhamento rápido.
- A opção de PDF deve ser apresentada como alternativa para impressão, arquivo ou envio formal.
- A interface deve funcionar bem em navegador desktop e navegador mobile.
- O usuário deve conseguir diferenciar claramente faltantes de repetidas antes de gerar a lista.
- O usuário deve ver a seção selecionada antes de exportar.
- Estados sem itens devem evitar gerar uma lista confusa ou aparentemente quebrada.
- A linguagem da interface deve ser simples, orientada a colecionadores e sem termos técnicos.

Requisitos de acessibilidade:

- Controles de seleção de tipo de lista, seção e formato devem ter rótulos claros.
- A geração de lista deve ser utilizável por teclado.
- Mensagens de sucesso, erro e lista vazia devem ser compreensíveis por tecnologias assistivas.
- A distinção entre texto recomendado e PDF complementar não deve depender apenas de cor.
- O conteúdo exportado deve manter leitura clara e ordenação previsível.

## Restrições técnicas de alto nível

- A funcionalidade deve operar em navegador web e navegador mobile.
- A exportação deve usar apenas dados da coleção do usuário autenticado.
- O conteúdo compartilhado deve conter somente dados da lista selecionada.
- Dados pessoais do usuário não devem aparecer na lista em texto nem no PDF.
- Faltantes e repetidas devem ser geradas separadamente.
- A lista deve ser limitada à seção escolhida pelo usuário.
- O formato em texto deve ser tratado como recomendação principal para compartilhamento rápido.
- O PDF deve ser tratado como formato complementar.
- A funcionalidade deve respeitar permissões e regras de acesso já existentes no sistema.
- A geração da lista não deve alterar quantidades, posse, progresso ou registros da coleção.

## Fora do escopo

- Compartilhamento por link público.
- Página pública de lista de faltantes ou repetidas.
- Inclusão de dados pessoais do usuário no conteúdo exportado.
- Compartilhar faltantes e repetidas juntas na mesma lista.
- Inclusão obrigatória de quantidade repetida na lista.
- Matching automático de trocas entre usuários.
- Chat, negociação ou confirmação de troca dentro do sistema.
- Envio automático por WhatsApp, email ou outro canal externo.
- Ranking, marketplace, compra ou venda de figurinhas.
- Alterações na lógica de cálculo de progresso da coleção.
- Alterações no cadastro de álbuns, seções ou figurinhas.
