import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import { luz } from '@/constants/theme';

type Foco = { id: string; cor: string; cx: string; cy: string; r: string; opacidade: number };

type Variante = 'claro' | 'escuro' | 'pagina';

// Função (e não constante) para ler as cores de luz do modo atual a cada render.
const focosDe = (variante: Variante): Foco[] => ({
  // Faixas de destaque sobre fundo claro (cartão de perfil)
  claro: [
    { id: 'a', cor: luz.menta, cx: '12%', cy: '10%', r: '75%', opacidade: 0.9 },
    { id: 'b', cor: luz.ceu, cx: '88%', cy: '0%', r: '70%', opacidade: 0.85 },
    { id: 'c', cor: luz.lavanda, cx: '70%', cy: '110%', r: '60%', opacidade: 0.7 },
  ],
  // Painéis escuros (login)
  escuro: [
    { id: 'a', cor: '#1F8A66', cx: '10%', cy: '0%', r: '70%', opacidade: 0.4 },
    { id: 'b', cor: '#3B5BDB', cx: '100%', cy: '100%', r: '75%', opacidade: 0.35 },
    { id: 'c', cor: '#7C5CE0', cx: '90%', cy: '10%', r: '45%', opacidade: 0.22 },
  ],
  // Luz ambiente bem discreta atrás do conteúdo
  pagina: [
    { id: 'a', cor: luz.menta, cx: '15%', cy: '0%', r: '55%', opacidade: 0.55 },
    { id: 'b', cor: luz.ceu, cx: '85%', cy: '0%', r: '55%', opacidade: 0.5 },
  ],
})[variante];

/**
 * Iluminação decorativa em gradientes radiais. Fica atrás do conteúdo,
 * não recebe toque e é ignorada por leitores de tela.
 */
export function Brilho({
  variante,
  style,
}: {
  variante: Variante;
  style?: StyleProp<ViewStyle>;
}) {
  const focos = focosDe(variante);
  return (
    <View
      pointerEvents="none"
      importantForAccessibility="no-hide-descendants"
      style={[StyleSheet.absoluteFill, style]}
    >
      <Svg width="100%" height="100%" preserveAspectRatio="none">
        <Defs>
          {focos.map((f) => (
            <RadialGradient key={f.id} id={`brilho-${variante}-${f.id}`} cx={f.cx} cy={f.cy} r={f.r} fx={f.cx} fy={f.cy}>
              <Stop offset="0" stopColor={f.cor} stopOpacity={f.opacidade} />
              <Stop offset="1" stopColor={f.cor} stopOpacity={0} />
            </RadialGradient>
          ))}
        </Defs>
        {focos.map((f) => (
          <Rect key={f.id} x="0" y="0" width="100%" height="100%" fill={`url(#brilho-${variante}-${f.id})`} />
        ))}
      </Svg>
    </View>
  );
}
