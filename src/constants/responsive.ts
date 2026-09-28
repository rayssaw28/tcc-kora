import { Platform } from 'react-native';

/**
 * Encaixa qualquer tamanho legado na escala tipográfica do tema
 * (12 · 13 · 15 · 17 · 20 · 24 · 30), para que o app use poucos tamanhos consistentes.
 */
export function responsiveFontSize(size: number): number {
  if (size <= 11) return 12;
  if (size <= 12) return 13;
  if (size <= 14) return 15;
  if (size <= 17) return 17;
  if (size <= 20) return 20;
  if (size <= 24) return 24;
  return 30;
}

export function responsiveLineHeight(lineHeight: number): number {
  if (lineHeight <= 16) return 18;
  if (lineHeight <= 19) return 21;
  if (lineHeight <= 22) return 23;
  if (lineHeight <= 25) return 26;
  return lineHeight + 2;
}

export function isDesktopWeb(width: number): boolean {
  return Platform.OS === 'web' && width >= 900;
}

export function isWideWeb(width: number): boolean {
  return Platform.OS === 'web' && width >= 1180;
}
