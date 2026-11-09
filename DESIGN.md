---
name: Conformia
description: Gestão de pessoas calma e organizada, com neutros quietos e o verde da marca reservado às ações.
colors:
  ink: "#14201B"
  ink-soft: "#2F3D37"
  text: "#46544D"
  muted: "#5B6862"
  placeholder: "#687570"
  line: "#E3E8E5"
  line-strong: "#7F8C86"
  canvas: "#F1F4F2"
  surface: "#FFFFFF"
  sunken: "#EBF0ED"
  brand: "#0E684E"
  brand-strong: "#0A5139"
  brand-deep: "#0B4A37"
  brand-soft: "#E3F3EB"
  brand-line: "#BFDCCD"
  on-brand: "#FFFFFF"
  accent: "#FFB224"
  on-accent: "#3A2500"
  info: "#1D4ED8"
  info-soft: "#E6EEFD"
  danger: "#A8322A"
  danger-strong: "#C0362C"
  danger-soft: "#FBEFED"
  warning: "#8F5A0B"
  warning-soft: "#FBF0D9"
typography:
  display:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 500
    lineHeight: "36px"
  headline:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 600
    lineHeight: "30px"
  title:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: "26px"
  lead:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: "24px"
  body:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: "22px"
  label:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: "19px"
  caption:
    fontFamily: "Archivo, ui-sans-serif, system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 600
    lineHeight: "16px"
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  pill: "999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "12px"
  lg: "16px"
  xl: "24px"
  xxl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "9px 16px"
    height: "40px"
  button-primary-pressed:
    backgroundColor: "{colors.brand-strong}"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.md}"
    padding: "9px 16px"
    height: "40px"
  button-danger:
    backgroundColor: "{colors.danger-strong}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.md}"
    padding: "9px 16px"
    height: "40px"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
    height: "44px"
  section-card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "20px"
  badge-ok:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-strong}"
    typography: "{typography.caption}"
    rounded: "{rounded.pill}"
    padding: "3px 10px"
  chip:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.ink-soft}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "5px 12px"
    height: "32px"
  chip-active:
    backgroundColor: "{colors.brand-soft}"
    textColor: "{colors.brand-strong}"
---

# Design System: Conformia

## Overview

**Creative North Star: "O Balcão de RH Sereno"**

O Conformia é a mesa de atendimento de RH feita interface: informação densa, mas calma. Os neutros ocupam quase toda a tela, as superfícies são cartões brancos de borda fina e o verde da marca aparece só onde há ação ou estado ativo. O âmbar entra raramente, e apenas no que pede atenção, como contadores de pendências. Profundidade vem de luz e sombra suaves, não de blocos de cor chapada.

O sistema serve três perfis (RH, gestor e colaborador) em tarefas repetitivas: aprovar, consultar, enviar. Por isso escaneabilidade e consistência vencem expressão. A personalidade mora em detalhes precisos: o brilho difuso verde, azul e lavanda atrás do cabeçalho do perfil e do painel de login, os tons categóricos que identificam cada módulo e a palavra certa no rótulo.

Os dois modos, claro e escuro, são parte do sistema. Cada token existe nos dois, com a mesma função.

**Key Characteristics:**
- Neutros frios com leve tom de verde; branco puro só na superfície dos cartões.
- Verde reservado a ações principais e ao estado ativo; âmbar só para atenção.
- Uma única família tipográfica, Archivo, em escala curta de sete tamanhos.
- Cartão de seção com linhas separadas por divisores; nunca cartão dentro de cartão.
- Brilhos radiais discretos como ambiente, nunca como conteúdo.

## Colors

Paleta de neutros verdes-acinzentados com um verde-floresta de marca; o resto do espectro entra como tons categóricos e de status.

### Primary
- **Verde Floresta** (#0E684E): botão principal, links, foco, estado ativo e selos de marca. Mantém contraste AA com texto branco. No modo escuro vira um verde-menta luminoso (#3CC793) e o texto sobre ele passa a ser escuro (#06231A).
- **Verde Profundo** (#0A5139): estado pressionado do botão e texto sobre fundo verde suave. Variante mais funda: #0B4A37.
- **Verde Névoa** (#E3F3EB) e **Verde Linha** (#BFDCCD): fundo e contorno de selo ok, chip ativo e item selecionado.

### Secondary
- **Âmbar de Atenção** (#FFB224): contadores de pendências e o ícone do modo escuro. Texto sobre ele: #3A2500.

### Neutral
- **Tinta** (#14201B): títulos e valores. **Tinta Suave** (#2F3D37): rótulos e texto de botão secundário. **Texto** (#46544D): corpo de linhas. **Apagado** (#5B6862): metadados. **Marcador** (#687570): placeholder.
- **Papel** (#F1F4F2): fundo da página. **Superfície** (#FFFFFF): cartões, campos e modais. **Rebaixado** (#EBF0ED): trilhos de abas e selos neutros.
- **Linha** (#E3E8E5) e **Linha Forte** (#7F8C86): divisores e contorno de campos e botões secundários. A Linha Forte chega a 3:1 sobre branco, papel e rebaixado (WCAG 1.4.11), porque a borda é o que delimita o controle.

### Status
- **Perigo** (#A8322A, forte #C0362C, névoa #FBEFED), **Aviso** (#8F5A0B, névoa #FBF0D9) e **Info** (#1D4ED8, névoa #E6EEFD). Sempre em par: texto escuro sobre fundo suave.

### Tons categóricos
Dez tons (verde, azul, violeta, laranja, teal, rosa, índigo, ciano, âmbar, ardósia) identificam módulos e avatares. Cada um tem `sólido` (ladrilho de ícone com ícone branco), `suave` e `texto` (contraste 4,5:1). O avatar de uma pessoa usa um tom estável derivado do nome.

### Named Rules
**The One Voice Rule.** O verde da marca ocupa pouco de cada tela. Se tudo é verde, nada indica a ação.
**The Paired Status Rule.** Todo estado de status usa o par texto escuro sobre fundo suave. Nunca cor chapada com texto branco, exceto botão de perigo.
**The Tinted Panel Rule.** O painel lateral do login é Verde Névoa com o brilho claro por trás, nos dois modos, e o texto sobre ele usa os mesmos tokens de tinta do resto do app (`ink`, `muted`). Nunca cores fixas, nunca `on-brand`.

## Typography

**Display, Body e Label Font:** Archivo (com ui-sans-serif, system-ui como reserva). Pesos 400, 500, 600 e 700.

**Character:** Grotesca neutra e legível, de aparência técnica e acolhedora. Números tabulares ligados em toda a interface, para que salários, horas e datas alinhem em coluna.

### Hierarchy
- **Display** (500, 30px, 36px): frase de abertura do painel de login.
- **Headline** (600, 24px, 30px): título da tela de login e títulos de página.
- **Title** (600, 20px, 26px): título de modal.
- **Lead** (600, 17px, 24px): título de seção e nome da marca.
- **Body** (400, 15px, 22px): texto de campos, valores e botões (600).
- **Label** (500, 13px, 19px): rótulos de campo, metadados e texto de apoio.
- **Caption** (600, 12px, 16px): texto de selos.

### Named Rules
**The Seven Sizes Rule.** Só existem 12, 13, 15, 17, 20, 24 e 30. Tamanhos legados são encaixados no degrau mais próximo (`responsiveFontSize`).

## Layout

Layout fluido de uma coluna em telas estreitas e de duas colunas no desktop. O ponto de quebra de "desktop web" é 900px e o de "web larga" é 1180px. Na tela de login, a partir de 900px o painel de marca ocupa 42% da largura (máximo 560px) e o formulário fica centralizado em até 380px.

O espaçamento segue a escala 4, 8, 12, 16, 24 e 32px. Dentro de uma seção, o ritmo padrão é 12px entre blocos e 20px de preenchimento do cartão. Linhas de lista têm 12 a 14px de preenchimento vertical e são separadas por um divisor de 1px, sem caixa. Formulários empilham campos com 20px de intervalo.

### Named Rules
**The No Nested Card Rule.** Hierarquia é seção (cartão) mais linhas com divisor. Nunca um cartão dentro de outro.

## Elevation & Depth

Híbrido: camadas de tom (papel, superfície, rebaixado) mais sombras ambientes suaves. No modo claro as sombras são tingidas de verde-escuro e leves; no escuro ficam mais densas e pretas, para ainda separar os planos. O cabeçalho é um vidro translúcido sobre o conteúdo.

### Shadow Vocabulary
- **Cartão** (`0 2px 12px rgba(11,59,45,.06)`): cartões de seção em repouso.
- **Barra** (`0 4px 16px rgba(20,32,27,.05)`): cabeçalho fixo.
- **Pílula** (`0 1px 6px rgba(20,32,27,.10)`): aba ativa em controle segmentado.
- **Flutuante** (`0 8px 24px rgba(11,59,45,.14)`): modais e menus.

### Named Rules
**The Quiet Shadow Rule.** Em repouso, só o cartão tem sombra, e ela é quase imperceptível. A sombra funda é para o que flutua.

## Shapes

Cantos suaves e consistentes: 8px para botões e campos, 12px para cartões e modais, 6px para botões de ícone pequenos e 999px para selos e chips. Contornos de 1px em Linha Forte para controles e em Linha para cartões. Não há formas recortadas nem assimétricas; o único elemento orgânico é o brilho radial de fundo.

## Components

### Buttons
- **Shape:** cantos de 8px; altura mínima de 40px (32px na versão pequena).
- **Primary:** fundo Verde Floresta, texto branco em 600, preenchimento 9px por 16px. Pressionado vira Verde Profundo.
- **Secondary:** fundo de superfície, contorno de 1px em Linha Forte, texto Tinta. Pressionado vira Rebaixado.
- **Danger:** fundo Perigo Forte com texto branco; versão em texto usa Perigo.
- **Quiet:** transparente, texto Verde Floresta, para ações terciárias.
- **Disabled:** 55% de opacidade.

### Chips
- **Style:** pílula de 32px, contorno em Linha Forte, fundo de superfície.
- **State:** ativo usa fundo Verde Névoa, contorno Verde Floresta e texto Verde Profundo em 600.

### Cards / Containers
- **Corner Style:** 12px.
- **Background:** Superfície, com contorno de 1px em Linha.
- **Shadow Strategy:** sombra Cartão.
- **Internal Padding:** 20px, com 12px de intervalo entre blocos.

### Inputs / Fields
- **Style:** altura de 44px, contorno de 1px em Linha Forte, canto de 8px, fundo de superfície, texto de 15px.
- **Focus:** o contorno passa a Verde Floresta.
- **Error:** faixa com fundo Perigo Névoa, texto Perigo, canto de 8px.
- **Password:** o botão de olho de 38px fica dentro do campo.

### Navigation
- Cabeçalho em vidro translúcido com linha inferior sutil. Abas segmentadas: trilho Rebaixado de canto 10px, aba ativa em Superfície com sombra Pílula e texto Tinta em 600; inativas em Apagado.

### Badge
- Pílula de 12px em 600. Pares: ok (verde), aviso (âmbar), ruim (vermelho), info (azul), neutro (rebaixado).

### Organograma
- Árvore interativa de cartões de pessoa com avatar de tom estável, nome, cargo e departamento; a relação gestor e equipe é mostrada por conectores, com controle de zoom e busca por nome, cargo ou departamento.

## Do's and Don'ts

### Do:
- **Do** reservar o Verde Floresta a ações principais, links e estados ativos.
- **Do** usar o par texto escuro sobre fundo suave para todo status.
- **Do** manter os dois modos em cada tela e conferir contraste de texto de 4,5:1 nos dois.
- **Do** usar os tokens de tinta também sobre o painel do login, que é verde-névoa e não escuro.
- **Do** rotular botões de ação de cabeçalho com texto, nunca só "+".
- **Do** usar apenas os sete tamanhos de fonte e a escala de espaçamento de 4 a 32px.

### Don't:
- **Don't** aninhar cartão dentro de cartão; use divisores entre linhas.
- **Don't** usar `on-brand` ou `on-brand-muted` sobre superfícies que não sejam o próprio fundo de marca.
- **Don't** usar o âmbar fora de atenção e pendências.
- **Don't** pintar blocos grandes de verde chapado; profundidade vem de luz e sombra.
- **Don't** introduzir uma segunda família tipográfica.
