import { useMemo, useState } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { isAxiosError } from 'axios';
import { ChevronLeft, ChevronRight, Download, Paperclip } from 'lucide-react-native';

import { api } from '@/api/client';
import { baixarArquivo } from '@/api/download';
import {
  ApiError,
  DemonstrativoHoleriteResponse,
  FuncionarioResponse,
} from '@/api/types';
import { SearchInput } from '@/components/SearchInput';
import { AddButton, ui } from '@/components/ui';
import { color, estilos, type } from '@/constants/theme';

type Arquivo = { uri: string; name: string; type: string };

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export function HoleritesSection({
  demonstrativos,
  funcionarios,
  funcionarioId,
  isAdmin,
  modoGeral = false,
  onAtualizar,
}: {
  demonstrativos: DemonstrativoHoleriteResponse[];
  funcionarios: FuncionarioResponse[];
  funcionarioId: number | null;
  isAdmin: boolean;
  modoGeral?: boolean;
  onAtualizar: () => Promise<void>;
}) {
  const hoje = useMemo(() => new Date(), []);
  const colaboradores = useMemo(
    () => funcionarios.filter((item) => item.perfil !== 'ADMIN'),
    [funcionarios],
  );
  const departamentos = useMemo(
    () => [...new Set(colaboradores.map((item) => item.departamentoNome).filter(Boolean))]
      .sort((a, b) => String(a).localeCompare(String(b), 'pt-BR')) as string[],
    [colaboradores],
  );

  const [aberto, setAberto] = useState(false);
  const [competenciaAberta, setCompetenciaAberta] = useState(false);
  const [alvoId, setAlvoId] = useState('');
  const [departamento, setDepartamento] = useState('');
  const [busca, setBusca] = useState('');
  const [buscaLista, setBuscaLista] = useState('');
  const [departamentoLista, setDepartamentoLista] = useState('');
  const [colaboradorListaId, setColaboradorListaId] = useState('');
  const [mes, setMes] = useState(hoje.getMonth() + 1);
  const [ano, setAno] = useState(hoje.getFullYear());
  const [arquivo, setArquivo] = useState<Arquivo | null>(null);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const demonstrativosOrdenados = useMemo(
    () => demonstrativos
      .filter((item) => modoGeral || item.funcionarioId === funcionarioId)
      .sort((a, b) => b.ano - a.ano || b.mes - a.mes || a.funcionarioNome.localeCompare(b.funcionarioNome, 'pt-BR')),
    [demonstrativos, funcionarioId, modoGeral],
  );

  const demonstrativosFiltrados = useMemo(() => {
    if (!modoGeral) return demonstrativosOrdenados;
    if (!departamentoLista) return [];
    return demonstrativosOrdenados.filter((item) => (
      item.departamentoNome === departamentoLista
      && (!colaboradorListaId || item.funcionarioId === Number(colaboradorListaId))
    ));
  }, [colaboradorListaId, demonstrativosOrdenados, departamentoLista, modoGeral]);

  const demonstrativoAtual = modoGeral && !colaboradorListaId
    ? null
    : demonstrativosFiltrados[0] ?? null;

  const colaboradoresLista = useMemo(() => {
    const termo = buscaLista.trim().toLocaleLowerCase('pt-BR');
    if (!departamentoLista) return [];
    return colaboradores
      .filter((item) => item.departamentoNome === departamentoLista)
      .filter((item) => !termo
        || `${item.nome} ${item.cargoNome ?? ''}`.toLocaleLowerCase('pt-BR').includes(termo))
      .sort(ordenarColaboradores);
  }, [buscaLista, colaboradores, departamentoLista]);

  const colaboradoresEnvio = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (!departamento) return [];
    return colaboradores
      .filter((item) => item.departamentoNome === departamento)
      .filter((item) => !termo
        || `${item.nome} ${item.cargoNome ?? ''}`.toLocaleLowerCase('pt-BR').includes(termo))
      .sort(ordenarColaboradores);
  }, [busca, colaboradores, departamento]);

  function abrirEnvio() {
    const colaboradorAtual = colaboradores.find((item) => item.id === funcionarioId);
    setAlvoId(modoGeral ? '' : String(funcionarioId ?? ''));
    setDepartamento(modoGeral ? '' : colaboradorAtual?.departamentoNome ?? '');
    setBusca('');
    setArquivo(null);
    setErro(null);
    setAberto(true);
  }

  async function selecionarArquivo() {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: 'application/pdf',
      copyToCacheDirectory: true,
    });
    if (!resultado.canceled && resultado.assets?.length) {
      const asset = resultado.assets[0];
      setArquivo({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/pdf',
      });
    }
  }

  async function enviar() {
    if (!departamento || !alvoId || !arquivo) {
      setErro('Selecione departamento, colaborador, competência e PDF.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const form = new FormData();
      form.append('mes', String(mes));
      form.append('ano', String(ano));
      form.append('file', arquivo as never);
      await api.post(`/api/funcionarios/${alvoId}/holerites`, form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setAberto(false);
      setDepartamentoLista(departamento);
      setColaboradorListaId(alvoId);
      await onAtualizar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível enviar o holerite.'));
    } finally {
      setSalvando(false);
    }
  }

  async function remover(id: number) {
    try {
      await api.delete(`/api/holerites/${id}`);
      await onAtualizar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível remover o holerite.'));
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{modoGeral ? 'Consultar por colaborador' : 'Meus holerites'}</Text>
          <Text style={styles.subtitle}>Valores de cada competência e o PDF oficial</Text>
        </View>
        {isAdmin ? <AddButton label="Enviar holerite" onPress={abrirEnvio} /> : null}
      </View>

      {erro ? <Text style={styles.error}>{erro}</Text> : null}

      {modoGeral ? (
        <View style={styles.browser}>
          <SearchInput
            value={buscaLista}
            onChangeText={setBuscaLista}
            placeholder="Buscar colaborador por nome ou cargo"
          />
          <Text style={styles.filterLabel}>Departamento</Text>
          <View style={styles.chips}>
            {departamentos.map((item) => (
              <Chip key={item} label={item} selected={departamentoLista === item}
                onPress={() => {
                  setDepartamentoLista(item);
                  setColaboradorListaId('');
                }} />
            ))}
          </View>
          {departamentoLista ? (
            <>
              <Text style={styles.filterLabel}>Colaborador</Text>
              {colaboradoresLista.length ? (
                <View style={styles.chips}>
                  {colaboradoresLista.map((item) => (
                    <Chip
                      key={item.id}
                      label={item.nome}
                      selected={colaboradorListaId === String(item.id)}
                      onPress={() => setColaboradorListaId(String(item.id))}
                    />
                  ))}
                </View>
              ) : (
                <Text style={styles.empty}>Nenhum colaborador encontrado neste departamento.</Text>
              )}
            </>
          ) : (
            <Text style={ui.help}>Escolha um departamento para ver os colaboradores.</Text>
          )}
        </View>
      ) : null}

      {modoGeral && departamentoLista ? (
        <ResumoGestor demonstrativos={demonstrativosFiltrados} />
      ) : null}

      {demonstrativoAtual ? (
        <DemonstrativoCard
          item={demonstrativoAtual}
          isAdmin={isAdmin}
          onRemover={remover}
        />
      ) : (
        <Text style={styles.empty}>
          {modoGeral && !colaboradorListaId
            ? 'Selecione um colaborador para visualizar os valores do holerite.'
            : 'Nenhum demonstrativo disponível.'}
        </Text>
      )}

      {modoGeral && !colaboradorListaId && demonstrativosFiltrados.length > 1 ? (
        <View style={styles.table}>
          <Text style={styles.tableTitle}>Colaboradores do departamento</Text>
          {demonstrativosFiltrados.map((item) => (
            <View key={`${item.funcionarioId}-${item.mes}-${item.ano}`} style={styles.tableRow}>
              <View style={styles.tablePerson}>
                <Text style={styles.tableName}>{item.funcionarioNome}</Text>
                <Text style={styles.itemSubtitle}>{item.cargoNome ?? 'Cargo não informado'}</Text>
              </View>
              <Text style={styles.tableMoney}>{formatarDinheiro(item.salarioLiquido)}</Text>
              <Text style={[styles.tableFlag, item.qtdDiasFalta > 0 && styles.tableFlagAlert]}>
                {item.qtdDiasFalta > 0 ? `${item.qtdDiasFalta} ${item.qtdDiasFalta === 1 ? 'falta' : 'faltas'}` : 'Sem faltas'}
              </Text>
            </View>
          ))}
        </View>
      ) : null}

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={() => setAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Enviar holerite</Text>
            {erro ? <Text style={styles.error}>{erro}</Text> : null}
            <Text style={styles.label}>Departamento *</Text>
            <View style={styles.chips}>
              {departamentos.map((item) => (
                <Chip key={item} label={item} selected={departamento === item}
                  onPress={() => {
                    setDepartamento(item);
                    setAlvoId('');
                  }} />
              ))}
            </View>
            {departamento ? (
              <>
                <Text style={styles.label}>Colaborador *</Text>
                <SearchInput value={busca} onChangeText={setBusca}
                  placeholder="Buscar por nome" />
                <ListaColaboradores
                  colaboradores={colaboradoresEnvio}
                  selecionadoId={alvoId}
                  onSelecionar={setAlvoId}
                />
              </>
            ) : (
              <Text style={styles.empty}>Selecione primeiro o departamento.</Text>
            )}
            <Text style={styles.label}>Competência</Text>
            <Pressable style={styles.selector} onPress={() => setCompetenciaAberta(true)}>
              <Text style={styles.selectorText}>{MESES[mes - 1]} de {ano}</Text>
            </Pressable>
            <Text style={styles.label}>Arquivo PDF *</Text>
            <Pressable style={styles.file} onPress={selecionarArquivo}>
              <Paperclip color={color.brand} size={17} strokeWidth={2.2} />
              <Text style={styles.fileText}>{arquivo?.name ?? 'Selecionar PDF'}</Text>
            </Pressable>
            <View style={styles.footer}>
              <Pressable style={styles.cancel} onPress={() => setAberto(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.save} disabled={salvando} onPress={enviar}>
                <Text style={styles.saveText}>{salvando ? 'Enviando…' : 'Enviar holerite'}</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={competenciaAberta} transparent animationType="fade"
        onRequestClose={() => setCompetenciaAberta(false)}>
        <View style={styles.overlay}>
          <View style={styles.competencia}>
            <View style={styles.yearRow}>
              <Pressable
                accessibilityLabel="Ano anterior"
                style={styles.yearButton}
                onPress={() => setAno((valor) => valor - 1)}
              >
                <ChevronLeft color={color.inkSoft} size={20} strokeWidth={2.2} />
              </Pressable>
              <Text style={styles.modalTitle}>{ano}</Text>
              <Pressable
                accessibilityLabel="Próximo ano"
                style={styles.yearButton}
                onPress={() => setAno((valor) => valor + 1)}
              >
                <ChevronRight color={color.inkSoft} size={20} strokeWidth={2.2} />
              </Pressable>
            </View>
            <View style={styles.monthGrid}>
              {MESES.map((nome, index) => (
                <Pressable key={nome}
                  style={[styles.month, mes === index + 1 && styles.monthSelected]}
                  onPress={() => {
                    setMes(index + 1);
                    setCompetenciaAberta(false);
                  }}>
                  <Text style={[styles.monthText, mes === index + 1 && styles.monthTextSelected]}>
                    {nome.slice(0, 3)}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function DemonstrativoCard({
  item,
  isAdmin,
  onRemover,
}: {
  item: DemonstrativoHoleriteResponse;
  isAdmin: boolean;
  onRemover: (id: number) => void;
}) {
  const adicionais = [
    ['Comissão', item.comissao],
    ['Insalubridade', item.adicionalInsalubridade],
    ['Periculosidade', item.adicionalPericulosidade],
    ['Adicional noturno', item.adicionalNoturno],
    ['Hora extra', item.horaExtra],
  ];

  return (
    <View style={styles.detail}>
      <View style={styles.detailHeader}>
        <View style={styles.itemText}>
          <Text style={styles.detailName}>{item.funcionarioNome}</Text>
          <Text style={styles.itemSubtitle}>
            {item.cargoNome ?? 'Cargo não informado'}, competência {String(item.mes).padStart(2, '0')}/{item.ano}
          </Text>
        </View>
        <View style={styles.netBox}>
          <Text style={styles.netLabel}>Salário líquido</Text>
          <Text style={styles.netValue}>{formatarDinheiro(item.salarioLiquido)}</Text>
        </View>
      </View>

      <Text style={[styles.alert, item.qtdDiasFalta > 0 && styles.alertDanger]}>
        {item.alertaPrincipal}
      </Text>
      <Text style={styles.explain}>{item.resumoCalculo}</Text>

      <View style={styles.kpiGrid}>
        <Kpi label="Salário base" value={formatarDinheiro(item.salarioBase)} />
        <Kpi label="Salário bruto" value={formatarDinheiro(item.salarioBruto)} />
        <Kpi label="INSS" value={`-${formatarDinheiro(item.descontoInss)}`} tone="danger" />
        <Kpi label="IRRF" value={`-${formatarDinheiro(item.descontoIrrf)}`} tone="danger" />
        <Kpi label="FGTS" value={formatarDinheiro(item.fgts)} />
        <Kpi label="Faltas" value={`-${formatarDinheiro(item.descontoFaltas)}`} tone={item.qtdDiasFalta > 0 ? 'danger' : 'normal'} />
      </View>

      {item.arquivo ? (
        <View style={styles.officialFile}>
          <View style={styles.itemText}>
            <Text style={styles.itemTitle}>Holerite oficial em PDF</Text>
            <Text style={styles.itemSubtitle}>{item.arquivo.nomeArquivo}</Text>
          </View>
          <View style={styles.actions}>
            <Pressable style={styles.download}
              onPress={() => baixarArquivo(`/api/holerites/${item.arquivo?.id}/download`, item.arquivo?.nomeArquivo ?? 'holerite.pdf')}>
              <Download color={color.inkSoft} size={14} strokeWidth={2.2} />
              <Text style={styles.downloadText}>Baixar</Text>
            </Pressable>
            {isAdmin ? (
              <Pressable style={styles.remove} onPress={() => item.arquivo && onRemover(item.arquivo.id)}>
                <Text style={styles.removeText}>Excluir</Text>
              </Pressable>
            ) : null}
          </View>
        </View>
      ) : (
        <Text style={styles.noFile}>O PDF oficial desta competência ainda não foi publicado.</Text>
      )}

      <View style={styles.columns}>
        <View style={styles.column}>
          <Text style={styles.tableTitle}>Proventos</Text>
          <Linha label="Salário base" value={item.salarioBase} />
          {adicionais.map(([label, value]) => (
            <Linha key={label} label={String(label)} value={Number(value)} muted={Number(value) === 0} />
          ))}
        </View>
        <View style={styles.column}>
          <Text style={styles.tableTitle}>Descontos</Text>
          <Linha label="INSS" value={item.descontoInss} danger />
          <Linha label="IRRF" value={item.descontoIrrf} danger />
          <Linha label="Faltas" value={item.descontoFaltas} danger muted={item.descontoFaltas === 0} />
        </View>
      </View>

      <View style={styles.absenceBox}>
        <Text style={styles.tableTitle}>Dias de falta</Text>
        {item.diasFalta.length ? (
          <View style={styles.absenceChips}>
            {item.diasFalta.map((dia) => (
              <Text key={dia} style={styles.absenceChip}>{formatarData(dia)}</Text>
            ))}
          </View>
        ) : (
          <Text style={styles.empty}>Nenhuma falta registrada nesta competência.</Text>
        )}
      </View>

    </View>
  );
}

function ResumoGestor({ demonstrativos }: { demonstrativos: DemonstrativoHoleriteResponse[] }) {
  const totalLiquido = demonstrativos.reduce((total, item) => total + item.salarioLiquido, 0);
  const totalFaltas = demonstrativos.reduce((total, item) => total + item.qtdDiasFalta, 0);
  const totalFgts = demonstrativos.reduce((total, item) => total + item.fgts, 0);
  return (
    <View style={styles.summary}>
      <Kpi label="Colaboradores" value={String(demonstrativos.length)} />
      <Kpi label="Líquido total" value={formatarDinheiro(totalLiquido)} />
      <Kpi label="FGTS total" value={formatarDinheiro(totalFgts)} />
      <Kpi label="Faltas" value={String(totalFaltas)} tone={totalFaltas > 0 ? 'danger' : 'normal'} />
    </View>
  );
}

function Kpi({ label, value, tone = 'normal' }: { label: string; value: string; tone?: 'normal' | 'danger' }) {
  return (
    <View style={[styles.kpi, tone === 'danger' && styles.kpiDanger]}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={[styles.kpiValue, tone === 'danger' && styles.kpiValueDanger]}>{value}</Text>
    </View>
  );
}

function Linha({ label, value, danger = false, muted = false }: {
  label: string;
  value: number;
  danger?: boolean;
  muted?: boolean;
}) {
  return (
    <View style={[styles.line, muted && styles.lineMuted]}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={[styles.lineValue, danger && styles.lineDanger]}>
        {danger ? '-' : '+'}{formatarDinheiro(value)}
      </Text>
    </View>
  );
}

function ListaColaboradores({
  colaboradores,
  selecionadoId,
  onSelecionar,
}: {
  colaboradores: FuncionarioResponse[];
  selecionadoId: string;
  onSelecionar: (id: string) => void;
}) {
  return (
    <ScrollView style={styles.people}>
      {colaboradores.map((item) => (
        <Pressable key={item.id}
          style={[styles.person, selecionadoId === String(item.id) && styles.personSelected]}
          onPress={() => onSelecionar(String(item.id))}>
          <Text style={styles.itemTitle}>{item.nome}</Text>
          <Text style={styles.itemSubtitle}>{item.cargoNome ?? 'Cargo não informado'}</Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}

function Chip({ label, selected, onPress }: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, selected && styles.chipSelected]} onPress={onPress}>
      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{label}</Text>
    </Pressable>
  );
}

function ordenarColaboradores(a: FuncionarioResponse, b: FuncionarioResponse) {
  const cargo = (a.cargoNome ?? '').localeCompare(b.cargoNome ?? '', 'pt-BR');
  return cargo || a.nome.localeCompare(b.nome, 'pt-BR');
}

function mensagemErro(e: unknown, fallback: string): string {
  if (isAxiosError(e)) return (e.response?.data as ApiError | undefined)?.message ?? fallback;
  return fallback;
}

function formatarDinheiro(valor: number): string {
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function formatarData(valor: string): string {
  const data = new Date(`${valor}T12:00:00`);
  if (Number.isNaN(data.getTime())) return valor;
  return data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

const styles = estilos(() => ({
  section: ui.section,
  header: ui.header,
  headerText: ui.headerText,
  title: ui.title,
  subtitle: ui.subtitle,
  browser: { gap: 8 },
  filterLabel: { ...ui.label, marginTop: 4 },
  chips: ui.chips,
  chip: ui.chip,
  chipSelected: ui.chipActive,
  chipText: ui.chipText,
  chipTextSelected: ui.chipTextActive,
  summary: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, columnGap: 24, paddingVertical: 4 },
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', rowGap: 12, columnGap: 24 },
  kpi: { minWidth: 110, gap: 2, paddingLeft: 12, borderLeftWidth: 2, borderLeftColor: color.line },
  kpiDanger: { borderLeftColor: color.dangerLine },
  kpiLabel: ui.rowMeta,
  kpiValue: { color: color.ink, ...type.lead, fontWeight: '600' },
  kpiValueDanger: { color: color.danger },
  detail: { gap: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: color.line },
  detailHeader: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, alignItems: 'flex-end' },
  detailName: { color: color.ink, ...type.title, fontWeight: '600' },
  netBox: { alignItems: 'flex-end', gap: 2 },
  netLabel: ui.rowMeta,
  netValue: { color: color.ink, ...type.heading, fontWeight: '600' },
  alert: { color: color.brandStrong, backgroundColor: color.brandSoft, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, ...type.small, fontWeight: '500' },
  alertDanger: { color: color.danger, backgroundColor: color.dangerSoft },
  explain: { color: color.text, ...type.body, maxWidth: 720 },
  columns: { flexDirection: 'row', flexWrap: 'wrap', columnGap: 32, rowGap: 16 },
  column: { flex: 1, minWidth: 240, gap: 0 },
  tableTitle: { color: color.ink, ...type.body, fontWeight: '600', marginBottom: 4 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: color.line, paddingVertical: 8, gap: 12 },
  lineMuted: { opacity: 0.5 },
  lineLabel: { color: color.text, ...type.small, flex: 1 },
  lineValue: { color: color.ink, ...type.small, fontWeight: '600' },
  lineDanger: { color: color.danger },
  absenceBox: { gap: 8 },
  absenceChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  absenceChip: { color: color.danger, backgroundColor: color.dangerSoft, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 3, ...type.caption, fontWeight: '600', overflow: 'hidden' },
  officialFile: { borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: color.canvas, borderWidth: 1, borderColor: color.line },
  table: { gap: 0 },
  tableRow: { flexDirection: 'row', alignItems: 'center', gap: 12, borderTopWidth: 1, borderTopColor: color.line, paddingVertical: 10 },
  tablePerson: { flex: 1, minWidth: 120 },
  tableName: ui.rowTitle,
  tableMoney: { color: color.ink, ...type.body, fontWeight: '600', minWidth: 110, textAlign: 'right' },
  tableFlag: { color: color.muted, ...type.small, minWidth: 90, textAlign: 'right' },
  tableFlagAlert: { color: color.danger, fontWeight: '600' },
  itemText: ui.rowText,
  itemTitle: ui.rowTitle,
  itemSubtitle: ui.rowMeta,
  actions: { flexDirection: 'row', gap: 4, alignItems: 'center' },
  download: { ...ui.btnSm, ...ui.btnSecondary },
  downloadText: ui.btnTextSm,
  remove: { ...ui.btnSm, ...ui.btnQuiet },
  removeText: ui.btnTextDanger,
  noFile: ui.help,
  empty: ui.empty,
  overlay: ui.overlay,
  modal: { ...ui.modal, maxWidth: 620, gap: 10 },
  modalTitle: ui.modalTitle,
  label: { ...ui.label, marginTop: 6 },
  people: { maxHeight: 220 },
  person: { borderWidth: 1, borderColor: color.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, marginBottom: 4, gap: 2 },
  personSelected: { borderColor: color.brand, backgroundColor: color.brandSoft },
  selector: ui.input,
  selectorText: { color: color.ink, ...type.body },
  file: { minHeight: 48, borderWidth: 1, borderStyle: 'dashed', borderColor: color.lineStrong, borderRadius: 8, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: color.canvas },
  fileText: { color: color.brand, ...type.body, fontWeight: '600' },
  footer: ui.modalActions,
  cancel: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  save: { ...ui.btn, ...ui.btnPrimary },
  saveText: ui.btnTextOnColor,
  error: ui.error,
  competencia: { ...ui.modal, maxWidth: 400 },
  yearRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  yearButton: ui.iconButtonBordered,
  monthGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  month: { width: '30%', flexGrow: 1, borderWidth: 1, borderColor: color.lineStrong, borderRadius: 8, paddingVertical: 10, alignItems: 'center' },
  monthSelected: { backgroundColor: color.brand, borderColor: color.brand },
  monthText: { color: color.inkSoft, ...type.small, fontWeight: '500' },
  monthTextSelected: { color: color.onBrand, fontWeight: '600' },
}));
