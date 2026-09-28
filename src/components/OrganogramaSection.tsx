import { isDesktopWeb } from '@/constants/responsive';
import { useMemo, useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { OrganogramaNode } from '@/api/types';
import { SearchInput } from '@/components/SearchInput';
import { ui } from '@/components/ui';
import { color, type } from '@/constants/theme';

type PessoaOrganograma = OrganogramaNode & {
  gestorNome: string | null;
};

export function OrganogramaSection({ organograma }: { organograma: OrganogramaNode[] }) {
  const { width } = useWindowDimensions();
  const desktopWeb = isDesktopWeb(width);
  // Largura útil = conteúdo centralizado (máx. 1240 com 32px de margem de cada lado) - padding da seção (42).
  const availableWidth = Math.min(width, 1240) - 64 - 42;
  const areaColumns = availableWidth >= 900 ? 3 : 2;
  const desktopAreaWidth = desktopWeb
    ? Math.floor((availableWidth - (areaColumns - 1) * 16) / areaColumns)
    : undefined;
  const [pesquisa, setPesquisa] = useState('');
  const pessoas = useMemo(() => achatarOrganograma(organograma), [organograma]);
  const termo = pesquisa.trim().toLocaleLowerCase('pt-BR');
  const resultados = termo
    ? pessoas.filter((pessoa) =>
        `${pessoa.nome} ${pessoa.cargoNome ?? ''} ${pessoa.departamentoNome ?? ''}`
          .toLocaleLowerCase('pt-BR')
          .includes(termo),
      )
    : [];
  const raiz = organograma.find((pessoa) =>
    `${pessoa.cargoNome ?? ''} ${pessoa.departamentoNome ?? ''}`
      .toLocaleLowerCase('pt-BR')
      .includes('ceo'),
  ) ?? organograma.find((pessoa) =>
    pessoa.departamentoNome?.toLocaleLowerCase('pt-BR').includes('presid'),
  ) ?? organograma.find((pessoa) => pessoa.perfil === 'GESTOR' && pessoa.subordinados.length)
    ?? organograma[0];
  const diretorias = raiz
    ? [
        ...raiz.subordinados,
        ...organograma.filter((pessoa) => pessoa.id !== raiz.id),
      ]
    : [];

  return (
    <View style={styles.section}>
      <SearchInput
        value={pesquisa}
        onChangeText={setPesquisa}
        placeholder="Buscar pessoa, cargo ou departamento"
      />

      {termo ? (
        <View style={styles.results}>
          {resultados.length ? (
            resultados.map((pessoa) => (
              <View key={pessoa.id} style={styles.resultCard}>
                <PessoaResumo pessoa={pessoa} />
                <View style={styles.leaderLine}>
                  <Text style={styles.leaderLabel}>Responde a</Text>
                  <Text style={styles.leaderValue}>
                    {pessoa.gestorNome ?? 'Conselho e acionistas'}
                  </Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.empty}>Nenhuma pessoa encontrada.</Text>
          )}
        </View>
      ) : null}

      {raiz ? (
        <View style={styles.organization}>
          <View style={styles.executive}>
            <Text style={styles.levelLabel}>Liderança executiva</Text>
            <PessoaCard pessoa={raiz} destaque />
          </View>

          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Diretorias</Text>
            <View style={styles.dividerLine} />
          </View>

          <ScrollView
            horizontal={!desktopWeb}
            showsHorizontalScrollIndicator={!desktopWeb}
            contentContainerStyle={[styles.areas, desktopWeb && styles.areasWeb]}
          >
            {diretorias.map((diretor) => (
              <AreaLideranca
                key={diretor.id}
                lider={diretor}
                desktopWidth={desktopAreaWidth}
              />
            ))}
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.empty}>Nenhum organograma encontrado.</Text>
      )}
    </View>
  );
}

function AreaLideranca({
  lider,
  desktopWidth,
}: {
  lider: OrganogramaNode;
  desktopWidth?: number;
}) {
  return (
    <View style={[styles.area, desktopWidth ? { width: desktopWidth } : null]}>
      <View style={styles.areaHeader}>
        <Text style={styles.areaDepartment}>
          {lider.departamentoNome ?? 'Área sem departamento'}
        </Text>
        <PessoaCard pessoa={lider} compacto />
      </View>

      <Text style={styles.directReportsLabel}>
        {lider.subordinados.length
          ? `${lider.subordinados.length} ${lider.subordinados.length === 1 ? 'pessoa responde' : 'pessoas respondem'} diretamente`
          : 'Sem reportes diretos'}
      </Text>

      <View style={styles.directReports}>
        {lider.subordinados.map((subordinado) => (
          <EquipeDireta key={subordinado.id} pessoa={subordinado} />
        ))}
      </View>
    </View>
  );
}

function EquipeDireta({ pessoa }: { pessoa: OrganogramaNode }) {
  return (
    <View style={styles.team}>
      <PessoaCard pessoa={pessoa} compacto />

      {pessoa.subordinados.length ? (
        <View style={styles.teamMembers}>
          <Text style={styles.teamLabel}>Equipe de {primeiroNome(pessoa.nome)}</Text>
          <View style={styles.membersGrid}>
            {pessoa.subordinados.map((membro) => (
              <PessoaCard key={membro.id} pessoa={membro} compacto />
            ))}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function PessoaCard({
  pessoa,
  destaque,
  compacto,
}: {
  pessoa: OrganogramaNode;
  destaque?: boolean;
  compacto?: boolean;
}) {
  return (
    <View
      style={[
        styles.personCard,
        destaque && styles.personCardHighlight,
        compacto && styles.personCardCompact,
      ]}
    >
      <View style={[styles.avatar, destaque && styles.avatarHighlight]}>
        <Text style={[styles.avatarText, destaque && styles.avatarTextHighlight]}>{iniciais(pessoa.nome)}</Text>
      </View>
      <PessoaResumo pessoa={pessoa} centralizado={destaque} semDepartamento={!destaque} />
    </View>
  );
}

function PessoaResumo({
  pessoa,
  centralizado,
  semDepartamento,
}: {
  pessoa: Pick<OrganogramaNode, 'nome' | 'cargoNome' | 'departamentoNome'>;
  centralizado?: boolean;
  semDepartamento?: boolean;
}) {
  return (
    <View style={[styles.personText, centralizado && styles.personTextCentered]}>
      <Text style={[styles.personName, centralizado && styles.centered]}>{pessoa.nome}</Text>
      <Text style={[styles.personRole, centralizado && styles.centered]}>
        {pessoa.cargoNome ?? 'Cargo não informado'}
      </Text>
      {!semDepartamento ? (
        <Text style={[styles.personDepartment, centralizado && styles.centered]}>
          {pessoa.departamentoNome ?? 'Sem departamento'}
        </Text>
      ) : null}
    </View>
  );
}

function achatarOrganograma(
  nodes: OrganogramaNode[],
  gestorNome: string | null = null,
): PessoaOrganograma[] {
  return nodes.flatMap((node) => [
    { ...node, gestorNome },
    ...achatarOrganograma(node.subordinados, node.nome),
  ]);
}

function primeiroNome(nome: string): string {
  return nome.trim().split(/\s+/)[0];
}

function iniciais(nome: string): string {
  return nome
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((parte) => parte[0])
    .join('')
    .toUpperCase();
}

const styles = StyleSheet.create({
  section: { ...ui.section, gap: 20 },
  results: { gap: 0 },
  resultCard: { ...ui.row, alignItems: 'flex-start' },
  leaderLine: { alignItems: 'flex-end', gap: 2 },
  leaderLabel: ui.rowMeta,
  leaderValue: { color: color.ink, ...type.small, fontWeight: '600' },
  organization: { gap: 20 },
  executive: { alignItems: 'center', gap: 10, paddingTop: 4 },
  levelLabel: ui.rowMeta,
  divider: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dividerLine: { flex: 1, height: 1, backgroundColor: color.line },
  dividerText: { color: color.muted, ...type.small, fontWeight: '500' },
  areas: { gap: 16, paddingBottom: 8 },
  areasWeb: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, width: '100%' },
  area: { width: 300, borderRadius: 12, borderWidth: 1, borderColor: color.line, backgroundColor: color.surface, padding: 16, gap: 12 },
  areaHeader: { gap: 10 },
  areaDepartment: { color: color.brand, ...type.small, fontWeight: '600' },
  directReportsLabel: { color: color.muted, ...type.caption, fontWeight: '500', paddingTop: 4, borderTopWidth: 1, borderTopColor: color.line, paddingBottom: 0, marginTop: 2, paddingVertical: 10 },
  directReports: { gap: 14 },
  team: { gap: 8 },
  teamMembers: { marginLeft: 17, paddingLeft: 17, borderLeftWidth: 1, borderLeftColor: color.lineStrong, gap: 8 },
  teamLabel: { color: color.muted, ...type.caption },
  membersGrid: { gap: 8 },
  memberCard: {},
  personCard: { alignItems: 'center' },
  personCardHighlight: { width: 280 },
  personCardCompact: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: color.brandSoft, alignItems: 'center', justifyContent: 'center' },
  avatarHighlight: { width: 52, height: 52, borderRadius: 26, backgroundColor: color.brand, marginBottom: 8 },
  avatarText: { color: color.brandStrong, ...type.small, fontWeight: '600' },
  avatarTextHighlight: { color: color.onBrand, ...type.lead },
  personText: { flex: 1, minWidth: 0, gap: 1 },
  personTextCentered: { alignItems: 'center' },
  personName: { color: color.ink, ...type.body, fontWeight: '600' },
  personRole: { color: color.text, ...type.small },
  personDepartment: { color: color.muted, ...type.caption },
  centered: { textAlign: 'center' },
  empty: ui.empty,
});
