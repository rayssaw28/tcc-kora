import * as SecureStore from 'expo-secure-store';
import { Moon, Sun } from 'lucide-react-native';
import { Platform, Pressable, type StyleProp, type ViewStyle } from 'react-native';

import { color, definirModo, estilos, obterModo, useModo, type Modo } from '@/constants/theme';

const TEMA_KEY = 'conformia_tema';

/** Reflete o modo no documento (fundo da página, barras de rolagem, controles nativos). */
function aplicarNoDocumento(modo: Modo) {
  if (Platform.OS !== 'web' || typeof document === 'undefined') return;
  document.documentElement.dataset.tema = modo;
  document.documentElement.style.colorScheme = modo === 'escuro' ? 'dark' : 'light';
}

/** Lê a preferência salva e aplica antes de o app ser desenhado. */
export async function carregarModoSalvo(): Promise<void> {
  let salvo: string | null = null;
  try {
    salvo = Platform.OS === 'web'
      ? window.localStorage.getItem(TEMA_KEY)
      : await SecureStore.getItemAsync(TEMA_KEY);
  } catch {
    // Sem armazenamento disponível: segue no modo claro.
  }
  const modo: Modo = salvo === 'escuro' ? 'escuro' : 'claro';
  definirModo(modo);
  aplicarNoDocumento(modo);
}

export function alternarModo(): void {
  const modo: Modo = obterModo() === 'escuro' ? 'claro' : 'escuro';
  definirModo(modo);
  aplicarNoDocumento(modo);
  try {
    if (Platform.OS === 'web') {
      window.localStorage.setItem(TEMA_KEY, modo);
    } else {
      void SecureStore.setItemAsync(TEMA_KEY, modo);
    }
  } catch {
    // A troca vale para a sessão mesmo sem conseguir salvar.
  }
}

/** Botão redondo que alterna entre modo claro e escuro. */
export function AlternarTema({ style, sobreEscuro = false }: { style?: StyleProp<ViewStyle>; sobreEscuro?: boolean }) {
  const escuro = useModo() === 'escuro';
  const Icone = escuro ? Sun : Moon;
  return (
    <Pressable
      onPress={alternarModo}
      accessibilityRole="switch"
      accessibilityState={{ checked: escuro }}
      accessibilityLabel="Modo escuro"
      accessibilityHint={escuro ? 'Volta para o modo claro' : 'Ativa o modo escuro'}
      hitSlop={6}
      style={(estado) => [
        styles.botao,
        sobreEscuro && styles.botaoSobreEscuro,
        ((estado as { hovered?: boolean }).hovered || estado.pressed) && (sobreEscuro ? styles.botaoSobreEscuroHover : styles.botaoHover),
        style,
      ]}
    >
      <Icone
        color={sobreEscuro ? '#FFFFFF' : escuro ? color.accent : color.inkSoft}
        size={17}
        strokeWidth={2}
      />
    </Pressable>
  );
}

const styles = estilos(() => ({
  botao: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: color.navTrack,
    borderWidth: 1,
    borderColor: color.headerLine,
  },
  botaoHover: {
    backgroundColor: color.navHover,
    borderColor: color.lineStrong,
  },
  botaoSobreEscuro: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderColor: 'rgba(255,255,255,0.14)',
  },
  botaoSobreEscuroHover: {
    backgroundColor: 'rgba(255,255,255,0.16)',
  },
}));
