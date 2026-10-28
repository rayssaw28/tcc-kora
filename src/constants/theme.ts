import { useSyncExternalStore } from 'react';
import { Platform, StyleSheet } from 'react-native';

/**
 * Tokens visuais do Conformia, em dois modos (claro e escuro).
 * Regra 60-30-10: neutros ocupam a maior parte da tela; o verde da marca
 * fica reservado às ações principais e ao estado ativo; o âmbar entra só no que
 * pede atenção (contadores de pendências). Profundidade vem de luz e sombra,
 * não de blocos de cor chapada.
 * Todo texto sobre fundo suave atinge contraste AA (4,5:1) nos dois modos.
 */
const paletaClara = {
  ink: '#14201B',
  inkSoft: '#2F3D37',
  text: '#46544D',
  muted: '#5B6862',
  placeholder: '#8A9690',
  line: '#E3E8E5',
  lineStrong: '#C9D2CD',
  canvas: '#F1F4F2',
  surface: '#FFFFFF',
  sunken: '#EBF0ED',

  brand: '#0E684E',
  brandDeep: '#0B4A37',
  brandStrong: '#0A5139',
  brandSoft: '#E3F3EB',
  brandLine: '#BFDCCD',
  onBrand: '#FFFFFF',
  onBrandMuted: '#B9D6C8',

  // Barra superior em vidro
  header: 'rgba(255,255,255,0.72)',
  headerLine: 'rgba(20,32,27,0.07)',
  navTrack: 'rgba(20,32,27,0.045)',
  navHover: 'rgba(20,32,27,0.05)',
  navActive: '#FFFFFF',
  onHeader: '#14201B',
  onHeaderMuted: '#5B6862',

  // Painéis escuros (login): neutro quase preto, a cor vem da iluminação
  noite: '#111816',

  // Acento de atenção (10%)
  accent: '#FFB224',
  onAccent: '#3A2500',

  info: '#1D4ED8',
  infoSoft: '#E6EEFD',
  infoLine: '#C3D5F8',

  danger: '#A8322A',
  dangerStrong: '#C0362C',
  dangerSoft: '#FBEFED',
  dangerLine: '#F2C9C4',

  warning: '#8F5A0B',
  warningSoft: '#FBF0D9',
  warningLine: '#F0DCAE',
};

type Paleta = Record<keyof typeof paletaClara, string>;

/**
 * No escuro, a marca fica mais luminosa e os botões cheios passam a usar texto
 * escuro (verde-claro com texto branco não teria contraste suficiente).
 */
const paletaEscura: Paleta = {
  ink: '#E8EEEB',
  inkSoft: '#CBD5D0',
  text: '#AEBAB4',
  muted: '#93A09A',
  placeholder: '#68756F',
  line: '#26302C',
  lineStrong: '#36433D',
  canvas: '#0D1311',
  surface: '#151C19',
  sunken: '#1C2521',

  brand: '#3CC793',
  brandDeep: '#9BEACB',
  brandStrong: '#7FE0B8',
  brandSoft: '#173529',
  brandLine: '#24523F',
  onBrand: '#06231A',
  onBrandMuted: '#0B3A2A',

  header: 'rgba(21,28,25,0.72)',
  headerLine: 'rgba(255,255,255,0.06)',
  navTrack: 'rgba(255,255,255,0.05)',
  navHover: 'rgba(255,255,255,0.06)',
  navActive: '#26322D',
  onHeader: '#E8EEEB',
  onHeaderMuted: '#9AA7A1',

  noite: '#0A0F0D',

  accent: '#FFB224',
  onAccent: '#3A2500',

  info: '#8DB4FF',
  infoSoft: '#18264A',
  infoLine: '#2A3D6B',

  danger: '#FF8A7E',
  dangerStrong: '#F0675B',
  dangerSoft: '#3A1D1A',
  dangerLine: '#5A2A25',

  warning: '#F5B54A',
  warningSoft: '#3A2C12',
  warningLine: '#5A4418',
};

type Tom = { solido: string; suave: string; texto: string };
type NomeTom =
  | 'verde' | 'azul' | 'violeta' | 'laranja' | 'teal'
  | 'rosa' | 'indigo' | 'ciano' | 'ambar' | 'ardosia';

/**
 * Tons categóricos: cada módulo do app tem o seu, para o usuário se orientar pela
 * cor além do texto. `solido` é o fundo dos ladrilhos de ícone (com ícone branco),
 * `texto` sobre `suave` serve para rótulos e iniciais (contraste 4,5:1).
 */
const tonsClaros: Record<NomeTom, Tom> = {
  verde: { solido: '#0E684E', suave: '#E3F3EB', texto: '#0A5139' },
  azul: { solido: '#2563EB', suave: '#E6EEFD', texto: '#1D4ED8' },
  violeta: { solido: '#7C3AED', suave: '#F0EAFE', texto: '#6D28D9' },
  laranja: { solido: '#EA580C', suave: '#FFEDE1', texto: '#B23A0A' },
  teal: { solido: '#0D9488', suave: '#DFF4F1', texto: '#0F6B64' },
  rosa: { solido: '#DB2777', suave: '#FDE8F1', texto: '#BE185D' },
  indigo: { solido: '#4F46E5', suave: '#ECEBFD', texto: '#4338CA' },
  ciano: { solido: '#0891B2', suave: '#DFF3F8', texto: '#0E6A85' },
  ambar: { solido: '#D97706', suave: '#FEF1D8', texto: '#8A4A0B' },
  ardosia: { solido: '#475569', suave: '#EDF0F4', texto: '#334155' },
};

const tonsEscuros: Record<NomeTom, Tom> = {
  verde: { solido: '#16A374', suave: '#16332A', texto: '#7FE0B8' },
  azul: { solido: '#3B82F6', suave: '#172A4A', texto: '#9CC0FF' },
  violeta: { solido: '#8B5CF6', suave: '#2A1F4A', texto: '#C4AEFF' },
  laranja: { solido: '#F97316', suave: '#3A2416', texto: '#FFB689' },
  teal: { solido: '#14B8A6', suave: '#123A36', texto: '#7FE3D6' },
  rosa: { solido: '#EC4899', suave: '#3D1A2C', texto: '#FFA3CF' },
  indigo: { solido: '#6366F1', suave: '#22224A', texto: '#B3B5FF' },
  ciano: { solido: '#06B6D4', suave: '#103440', texto: '#86E1F2' },
  ambar: { solido: '#F59E0B', suave: '#3A2C10', texto: '#FFD27A' },
  ardosia: { solido: '#64748B', suave: '#232B36', texto: '#C2CCD9' },
};

/** Cores das luzes difusas usadas nos gradientes decorativos (componente Brilho). */
const luzClara = { menta: '#BDEBD6', ceu: '#C9DDFB', lavanda: '#DCD3FA' };
const luzEscura: typeof luzClara = { menta: '#1D5A44', ceu: '#1C3966', lavanda: '#382C6B' };

type Sombra = {
  shadowColor: string;
  shadowOpacity: number;
  shadowRadius: number;
  shadowOffset: { width: number; height: number };
  elevation: number;
};
const sombra = (shadowColor: string, shadowOpacity: number, shadowRadius: number, height: number, elevation: number): Sombra => ({
  shadowColor, shadowOpacity, shadowRadius, shadowOffset: { width: 0, height }, elevation,
});

/** Sombras (viram box-shadow no web). No escuro, mais densas para ainda separar os planos. */
const elevacaoClara = {
  cartao: sombra('#0B3B2D', 0.06, 12, 2, 1),
  barra: sombra('#14201B', 0.05, 16, 4, 2),
  pilula: sombra('#14201B', 0.1, 6, 1, 1),
  flutuante: sombra('#0B3B2D', 0.14, 24, 8, 6),
};
const elevacaoEscura: typeof elevacaoClara = {
  cartao: sombra('#000000', 0.35, 14, 2, 1),
  barra: sombra('#000000', 0.4, 16, 4, 2),
  pilula: sombra('#000000', 0.45, 6, 1, 1),
  flutuante: sombra('#000000', 0.55, 28, 10, 6),
};

// ---------------------------------------------------------------------------
// Modo atual
// ---------------------------------------------------------------------------

export type Modo = 'claro' | 'escuro';

let modoAtual: Modo = 'claro';
const ouvintes = new Set<() => void>();

export function obterModo(): Modo {
  return modoAtual;
}

export function definirModo(modo: Modo): void {
  if (modo === modoAtual) return;
  modoAtual = modo;
  ouvintes.forEach((ouvinte) => ouvinte());
}

/** Re-renderiza quem chamar sempre que o modo mudar. */
export function useModo(): Modo {
  return useSyncExternalStore(
    (ouvinte) => {
      ouvintes.add(ouvinte);
      return () => ouvintes.delete(ouvinte);
    },
    obterModo,
    obterModo,
  );
}

/** Objeto que sempre responde com os valores do modo atual. */
function porModo<T extends object>(claro: T, escuro: T): T {
  return new Proxy({} as T, {
    get: (_, chave) => (modoAtual === 'escuro' ? escuro : claro)[chave as keyof T],
    ownKeys: () => Reflect.ownKeys(claro),
    getOwnPropertyDescriptor: (_, chave) => ({
      enumerable: true,
      configurable: true,
      value: (modoAtual === 'escuro' ? escuro : claro)[chave as keyof T],
    }),
  });
}

export const color: Paleta = porModo(paletaClara, paletaEscura);
export const tons: Record<NomeTom, Tom> = porModo(tonsClaros, tonsEscuros);
export const luz: typeof luzClara = porModo(luzClara, luzEscura);
export const elevacao: typeof elevacaoClara = porModo(elevacaoClara, elevacaoEscura);

export type TomCor = Tom;
export type { NomeTom };

/**
 * StyleSheet que acompanha o modo: a fábrica roda uma vez por modo (lendo
 * `color`, `tons` etc. daquele modo) e o resultado fica em cache.
 */
export function estilos<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  fabrica: () => T & StyleSheet.NamedStyles<any>,
): T {
  const cache: Partial<Record<Modo, T>> = {};
  const atual = () => (cache[modoAtual] ??= StyleSheet.create(fabrica()));
  return new Proxy({} as T, {
    get: (_, chave) => atual()[chave as keyof T],
  });
}

const TONS_PESSOAS: NomeTom[] = [
  'verde', 'azul', 'violeta', 'laranja', 'teal', 'rosa', 'indigo', 'ciano', 'ambar',
];

/** Cor estável por pessoa: o mesmo nome sempre gera o mesmo tom de avatar. */
export function tomDoNome(nome?: string | null): TomCor {
  const texto = (nome ?? '').trim().toLowerCase();
  let hash = 0;
  for (let i = 0; i < texto.length; i++) {
    hash = (hash * 31 + texto.charCodeAt(i)) >>> 0;
  }
  return tons[TONS_PESSOAS[hash % TONS_PESSOAS.length]];
}

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
