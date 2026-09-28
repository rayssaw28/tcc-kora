import { useMemo } from 'react';
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { ExternalLink } from 'lucide-react-native';

import { AtestadoResponse, EspelhoPontoResponse } from '@/api/types';
import { AtestadosSection } from '@/components/AtestadosSection';
import { ui } from '@/components/ui';
import { color } from '@/constants/theme';

export function AdminJornadaSection({
  atestados,
  pontos,
  onAtualizar,
  onAprovar,
  onReprovar,
  onRemover,
  onAbrirPonto,
}: {
  atestados: AtestadoResponse[];
  pontos: EspelhoPontoResponse[];
  onAtualizar: () => Promise<void>;
  onAprovar: (id: number) => void;
  onReprovar: (id: number, motivo: string) => void;
  onRemover: (id: number) => void;
  onAbrirPonto: () => void;
}) {
  const { width } = useWindowDimensions();
  const largo = width >= 1024;
  const grupos = useMemo(() => {
    const mapa = new Map<string, EspelhoPontoResponse[]>();
    pontos.forEach((item) => {
      const chave = item.departamentoNome ?? 'Sem departamento';
      mapa.set(chave, [...(mapa.get(chave) ?? []), item]);
    });
    return [...mapa.entries()].sort(([a], [b]) => a.localeCompare(b, 'pt-BR'));
  }, [pontos]);

  return (
    <View style={[styles.stack, largo && styles.colunas]}>
      <View style={[styles.stack, largo && styles.colunaPrincipal]}>
        <AtestadosSection atestados={atestados} podeEnviar={false} isAdmin exibirColaborador
          onAtualizar={onAtualizar} onAprovar={onAprovar}
          onReprovar={onReprovar} onRemover={onRemover} />
      </View>
      <View style={[ui.section, largo && styles.colunaLateral]}>
        <View style={ui.headerText}>
          <Text style={ui.title}>Banco de horas da equipe</Text>
          <Text style={ui.subtitle}>Saldos de ponto por departamento e mês</Text>
        </View>
        {grupos.map(([departamento, registros]) => (
          <View key={departamento}>
            <Text style={ui.groupTitle}>{departamento}</Text>
            {registros.map((item) => (
              <View key={item.id} style={ui.row}>
                <View style={ui.rowText}>
                  <Text style={ui.rowTitle}>{item.funcionarioNome}</Text>
                  <Text style={ui.rowMeta}>{String(item.mes).padStart(2, '0')}/{item.ano}</Text>
                </View>
                <Text style={[ui.value, item.saldoMinutos < 0 && styles.negative]}>
                  {item.saldoMinutos > 0 ? '+' : ''}{item.saldoFormatado}
                </Text>
              </View>
            ))}
          </View>
        ))}
        {!grupos.length ? <Text style={ui.empty}>Nenhum saldo registrado.</Text> : null}
        <Pressable style={ui.link} onPress={onAbrirPonto} accessibilityRole="link">
          <Text style={ui.linkText}>Abrir sistema de ponto</Text>
          <ExternalLink color={color.brand} size={14} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  colunas: { flexDirection: 'row', alignItems: 'flex-start', gap: 20 },
  colunaPrincipal: { flex: 1, minWidth: 0 },
  colunaLateral: { width: 400, flexShrink: 0 },
  negative: { color: color.danger },
});
