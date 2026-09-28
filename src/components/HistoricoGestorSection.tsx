import { StyleSheet, Text, View } from 'react-native';

import { AvaliacaoResponse, ConsentimentoResponse } from '@/api/types';
import { Badge, ui } from '@/components/ui';
import { color, type } from '@/constants/theme';

export function HistoricoGestorSection({
  avaliacoes,
  consentimentos,
}: {
  avaliacoes: AvaliacaoResponse[];
  consentimentos: ConsentimentoResponse[];
}) {
  const ordenadas = [...avaliacoes].sort(
    (a, b) => new Date(b.atualizadoEm).getTime() - new Date(a.atualizadoEm).getTime(),
  );
  const assinaturas = [...consentimentos].sort(
    (a, b) => new Date(b.registradoEm).getTime() - new Date(a.registradoEm).getTime(),
  );

  return (
    <View style={styles.stack}>
      <View style={ui.section}>
        <View style={ui.headerText}>
          <Text style={ui.title}>Avaliações de desempenho</Text>
          <Text style={ui.subtitle}>Histórico de avaliações deste colaborador</Text>
        </View>
        {ordenadas.length ? ordenadas.map((item) => (
          <View key={item.id} style={ui.rowStack}>
            <View style={styles.header}>
              <View style={ui.rowText}>
                <Text style={ui.rowTitle}>Avaliação {item.periodo}</Text>
                <Text style={ui.rowMeta}>
                  Por {item.avaliadorNome} em {formatarData(item.atualizadoEm)}
                </Text>
              </View>
              <Text style={styles.score}>{formatarNota(item.notaFinal)}</Text>
            </View>
            <Text style={ui.rowBody}>{item.comentarioGeral || 'Sem comentário geral.'}</Text>
            {item.itens.length ? (
              <View style={styles.criterios}>
                {item.itens.map((criterio) => (
                  <View key={criterio.id} style={styles.criterio}>
                    <Text style={ui.rowMeta}>{criterio.criterio}</Text>
                    <Text style={styles.criterioNota}>{criterio.nota}/5</Text>
                  </View>
                ))}
              </View>
            ) : null}
          </View>
        )) : <Text style={ui.empty}>Nenhuma avaliação registrada.</Text>}
      </View>

      <View style={ui.section}>
        <View style={ui.headerText}>
          <Text style={ui.title}>Termo LGPD</Text>
          <Text style={ui.subtitle}>Versões do termo que o colaborador assinou</Text>
        </View>
        {assinaturas.length ? assinaturas.map((item) => (
          <View key={item.id} style={ui.row}>
            <View style={ui.rowText}>
              <Text style={ui.rowTitle}>Versão {item.versaoTermo}</Text>
              <Text style={ui.rowMeta}>{formatarData(item.registradoEm)}</Text>
            </View>
            <Badge label={item.aceito ? 'Aceito' : 'Não aceito'} tom={item.aceito ? 'ok' : 'bad'} />
          </View>
        )) : <Text style={ui.empty}>Nenhuma assinatura registrada.</Text>}
      </View>
    </View>
  );
}

function formatarData(valor: string): string {
  return new Date(valor).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatarNota(valor: number | null): string {
  return valor === null ? '-' : Number(valor).toFixed(1).replace('.', ',');
}

const styles = StyleSheet.create({
  stack: { gap: 16 },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  score: { color: color.ink, ...type.title, fontWeight: '600' },
  criterios: { gap: 2 },
  criterio: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  criterioNota: { color: color.inkSoft, ...type.small, fontWeight: '600' },
});
