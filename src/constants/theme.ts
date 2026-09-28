import { Platform } from 'react-native';

/**
 * Tokens visuais do Conformia.
 * O verde vem da identidade da marca (ícone e splash); os neutros têm um leve
 * fundo esverdeado para conversar com ele em vez do cinza-azulado padrão.
 */
export const color = {
  ink: '#17211C',
  inkSoft: '#34403A',
  text: '#4A5750',
  muted: '#5E6B64',
  placeholder: '#8C9892',
  line: '#E1E6E3',
  lineStrong: '#C9D2CD',
  canvas: '#F6F8F7',
  surface: '#FFFFFF',
  sunken: '#EEF2F0',

  brand: '#0E684E',
  brandDeep: '#0B4A37',
  brandStrong: '#0A5139',
  brandSoft: '#E6F2EC',
  brandLine: '#BFDCCD',
  onBrand: '#FFFFFF',
  onBrandMuted: '#B9D6C8',

  danger: '#A8322A',
  dangerStrong: '#C0362C',
  dangerSoft: '#FBEFED',
  dangerLine: '#F2C9C4',

  warning: '#8F5A0B',
  warningSoft: '#FBF0D9',
  warningLine: '#F0DCAE',
} as const;

export const fontFamily = Platform.select({
  web: 'Archivo, ui-sans-serif, system-ui, sans-serif',
  default: 'Archivo_400Regular',
});

/** Escala tipográfica: 12 · 13 · 15 · 17 · 20 · 24 · 30. */
export const type = {
  caption: { fontSize: 12, lineHeight: 16 },
  small: { fontSize: 13, lineHeight: 19 },
  body: { fontSize: 15, lineHeight: 22 },
  lead: { fontSize: 17, lineHeight: 24 },
  title: { fontSize: 20, lineHeight: 26 },
  heading: { fontSize: 24, lineHeight: 30 },
  display: { fontSize: 30, lineHeight: 36 },
} as const;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  pill: 999,
} as const;

export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;
