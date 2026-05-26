---
tokens:
  colors:
    copa-gold: "#F59E0B"
    copa-green: "#059669"
    copa-red: "#E11D48"
    copa-dark: "#0F172A"
    copa-light: "#F8FAFC"
    text-main: "#1E293B"
  typography:
    headline:
      fontFamily: "Inter, sans-serif"
      fontWeight: 700
      lineHeight: 1.2
    body:
      fontFamily: "Inter, sans-serif"
      fontWeight: 400
      lineHeight: 1.5
    label:
      fontFamily: "Inter, sans-serif"
      fontWeight: 600
      fontSize: "12px"
  spacing:
    sm: "8px"
    md: "16px"
    lg: "24px"
    xl: "32px"
  components:
    card:
      backgroundColor: "{colors.copa-light}"
      rounded: "12px"
      padding: "{spacing.md}"
    buttonPrimary:
      backgroundColor: "{colors.copa-gold}"
      textColor: "{colors.copa-dark}"
      rounded: "8px"
      padding: "{spacing.md} {spacing.lg}"
      typography: "{typography.label}"
---

# Álbum Cheio - Design System Manifest

## 1. Visão Geral e Personalidade da Marca (Brand Personality)
O **Álbum Cheio** é uma plataforma moderna e interativa desenvolvida em Next.js com TailwindCSS para colecionadores do Álbum da Copa do Mundo de 2026. 
A identidade visual e a interface devem transmitir a energia global, a paixão pelo esporte e o dinamismo do futebol. O tom é utilitário, descontraído e recompensador, focando na satisfação de conquistar novas figurinhas e na praticidade de gerenciar trocas.

## 2. Cores e Argumentação (Color Usage & Rationale)
A paleta "World Cup Energy" abandona o óbvio e foca em cores semânticas atreladas às emoções do colecionador:
- **Copa Gold (`#F59E0B`)**: Representa o ouro da taça. Deve ser o único condutor de interações primárias (CTAs, botões de troca, compartilhamento). Nunca use como cor de fundo geral.
- **Copa Green (`#059669`)**: Representa o verde do gramado. É o status universal de sucesso ou aquisição ("Eu tenho essa figurinha").
- **Copa Red (`#E11D48`)**: Representa alerta e paixão. Usado para status numérico de figurinhas "Repetidas" ou em "Falta".
- **Copa Dark (`#0F172A`)**: Fundo principal para o Dark Mode, simulando a atmosfera noturna de um estádio de futebol.
- **Copa Light (`#F8FAFC`)**: Fundo neutro e limpo para o Light Mode, focado em legibilidade e foco nas figurinhas.

## 3. Tipografia (Typography)
A tipografia escolhida deve ser limpa e funcional para interfaces densas de dados (muitos números e listas de figurinhas). O foco é garantir excelente legibilidade em telas de dispositivos móveis.

## 4. Guardrails (Regras Estritas para a IA)
Ao gerar componentes e telas para este projeto, o agente de IA deve obrigatoriamente seguir estas regras:
- **Nunca** utilize gradientes complexos ou sombras (drop shadows) densas. A estética deve ser "flat" moderna.
- **Sempre** utilize `border-radius` (arredondamento) de 8px para botões e 12px para cards.
- **Sempre** respeite o padrão semântico de cores para os cards de figurinha (Verde para "Tenho", Vermelho/Opaco para "Falta").
- **Nunca** misture mais de uma família tipográfica.
- **Sempre** crie contraste acessível (WCAG AA): textos sobre fundos Copa Red e Copa Green devem ser brancos (`#FFFFFF`), e textos sobre Copa Gold devem ser escuros (`#0F172A`).
- **Sempre** priorize o layout responsivo Mobile-First, com áreas de toque (touch targets) de no mínimo 44px de altura.

## 5. Acessibilidade
Este sistema de design foi construído considerando as normas de acessibilidade. A relação de contraste entre `backgroundColor` e `textColor` para todos os componentes especificados no Front Matter respeita nativamente os padrões WCAG AA.
