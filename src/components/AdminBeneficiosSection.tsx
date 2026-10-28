import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Pencil, X } from 'lucide-react-native';

import {
  BeneficioAdminResponse,
  BeneficioLoteRequest,
  BeneficioRequest,
  FuncionarioResponse,
  TipoBeneficio,
} from '@/api/types';
import { SearchInput } from '@/components/SearchInput';
import { AddButton, ui } from '@/components/ui';
import { color, estilos, type } from '@/constants/theme';

type Publico = 'TODOS' | 'DEPARTAMENTO' | 'COLABORADOR';

type GrupoBeneficio = {
  chave: string;
  ids: number[];
  funcionarioIds: number[];
  funcionarios: string[];
  tipo: TipoBeneficio;
  valor: number | null;
  descricao: string | null;
};

const TIPOS: { id: TipoBeneficio; label: string }[] = [
  { id: 'VALE_REFEICAO', label: 'Vale-refeição' },
  { id: 'VALE_ALIMENTACAO', label: 'Vale-alimentação' },
  { id: 'VALE_TRANSPORTE', label: 'Vale-transporte' },
  { id: 'PLANO_SAUDE', label: 'Plano de saúde' },
  { id: 'PLANO_ODONTOLOGICO', label: 'Plano odontológico' },
  { id: 'SEGURO_VIDA', label: 'Seguro de vida' },
  { id: 'AUXILIO_CRECHE', label: 'Auxílio-creche' },
  { id: 'OUTRO', label: 'Outro' },
];

export function AdminBeneficiosSection({
  funcionarios,
  beneficios,
  onCadastrar,
  onEditar,
  onRemover,
}: {
  funcionarios: FuncionarioResponse[];
  beneficios: BeneficioAdminResponse[];
  onCadastrar: (request: BeneficioLoteRequest) => Promise<void>;
  onEditar: (ids: number[], request: BeneficioRequest) => Promise<void>;
  onRemover: (ids: number[]) => Promise<void>;
}) {
  const [modalAberto, setModalAberto] = useState(false);
  const [grupoEdicao, setGrupoEdicao] = useState<GrupoBeneficio | null>(null);
  const [grupoRemocao, setGrupoRemocao] = useState<GrupoBeneficio | null>(null);
  const [publico, setPublico] = useState<Publico>('TODOS');
  const [departamento, setDepartamento] = useState('');
  const [busca, setBusca] = useState('');
  const [colaboradorId, setColaboradorId] = useState<number | null>(null);
  const [tipo, setTipo] = useState<TipoBeneficio>('VALE_REFEICAO');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const ativos = useMemo(
    () => funcionarios.filter((funcionario) => funcionario.statusAdmissao === 'ATIVO'),
    [funcionarios],
  );
  const departamentos = useMemo(
    () => Array.from(new Set(
      ativos
        .map((funcionario) => funcionario.departamentoNome)
        .filter((nome): nome is string => Boolean(nome)),
    )).sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [ativos],
  );
  const colaboradoresFiltrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (!termo) return [];
    return ativos
      .filter((funcionario) => !departamento || funcionario.departamentoNome === departamento)
      .filter((funcionario) => [
        funcionario.nome,
        funcionario.cargoNome,
        funcionario.departamentoNome,
      ].some((campo) => campo?.toLocaleLowerCase('pt-BR').includes(termo)))
      .sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR'));
  }, [ativos, busca, departamento]);
  const grupos = useMemo(() => agruparBeneficios(beneficios), [beneficios]);
  const destinatarios = useMemo(() => {
    if (publico === 'TODOS') return ativos;
    if (publico === 'DEPARTAMENTO') {
      return ativos.filter((funcionario) => departamento
        && funcionario.departamentoNome === departamento);
    }
    return ativos.filter((funcionario) => funcionario.id === colaboradorId);
  }, [ativos, colaboradorId, departamento, publico]);

  function abrirCadastro() {
    setGrupoEdicao(null);
    setPublico('TODOS');
    setDepartamento('');
    setBusca('');
    setColaboradorId(null);
    setTipo('VALE_REFEICAO');
    setValor('');
    setDescricao('');
    setErro(null);
    setModalAberto(true);
  }

  function abrirEdicao(grupo: GrupoBeneficio) {
    setGrupoEdicao(grupo);
    setTipo(grupo.tipo);
    setValor(grupo.valor === null ? '' : String(grupo.valor).replace('.', ','));
    setDescricao(grupo.descricao ?? '');
    setErro(null);
    setModalAberto(true);
  }

  async function salvar() {
    const valorNormalizado = valor.trim()
      ? Number(valor.replace(',', '.'))
      : null;
    if (valorNormalizado !== null && (!Number.isFinite(valorNormalizado) || valorNormalizado < 0)) {
      setErro('Informe um valor válido.');
      return;
    }
    if (!grupoEdicao && !destinatarios.length) {
      setErro('Selecione ao menos um colaborador para receber o benefício.');
      return;
    }

    const request: BeneficioRequest = {
      tipo,
      valor: valorNormalizado,
      descricao: descricao.trim() || null,
    };
    setSalvando(true);
    setErro(null);
    try {
      if (grupoEdicao) {
        await onEditar(grupoEdicao.ids, request);
      } else {
        await onCadastrar({
          ...request,
          funcionarioIds: destinatarios.map((funcionario) => funcionario.id),
        });
      }
      setModalAberto(false);
    } catch (e) {
      setErro(e instanceof Error ? e.message : 'Não foi possível salvar o benefício.');
    } finally {
      setSalvando(false);
    }
  }

  async function remover() {
    if (!grupoRemocao) return;
    setSalvando(true);
    try {
      await onRemover(grupoRemocao.ids);
      setGrupoRemocao(null);
    } catch {
      setGrupoRemocao(null);
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Benefícios oferecidos</Text>
          <Text style={styles.subtitle}>Agrupados por tipo, valor e descrição</Text>
        </View>
        <AddButton label="Novo benefício" onPress={abrirCadastro} />
      </View>

      {grupos.length ? (
        <View style={styles.list}>
          {grupos.map((grupo) => (
            <View key={grupo.chave} style={styles.item}>
              <View style={styles.itemTop}>
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>{rotuloTipo(grupo.tipo)}</Text>
                  {grupo.descricao ? (
                    <Text style={styles.description}>{grupo.descricao}</Text>
                  ) : null}
                  <Text style={styles.people} numberOfLines={2}>
                    {grupo.funcionarios.length} {grupo.funcionarios.length === 1 ? 'colaborador' : 'colaboradores'}: {resumirNomes(grupo.funcionarios)}
                  </Text>
                </View>
                <Text style={styles.amount}>
                  {grupo.valor ? formatarDinheiro(grupo.valor) : 'Sem valor'}
                </Text>
              </View>
              <View style={ui.actionsRow}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Editar ${rotuloTipo(grupo.tipo)}`}
                  style={styles.editButton}
                  onPress={() => abrirEdicao(grupo)}
                >
                  <Pencil color={color.inkSoft} size={14} strokeWidth={2.2} />
                  <Text style={ui.btnTextSm}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.removeButton}
                  onPress={() => setGrupoRemocao(grupo)}
                  accessibilityRole="button"
                  accessibilityLabel={`Excluir ${rotuloTipo(grupo.tipo)}`}
                >
                  <Text style={styles.removeText}>Excluir</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>Nenhum benefício oferecido.</Text>
      )}

      <Modal
        visible={modalAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setModalAberto(false)}
      >
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <Text style={styles.modalTitle}>
                  {grupoEdicao ? 'Editar benefício' : 'Novo benefício'}
                </Text>
                <Text style={styles.subtitle}>
                  {grupoEdicao
                    ? `Alteração para ${grupoEdicao.funcionarios.length} colaborador(es)`
                    : 'Selecione o público e os dados do benefício'}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                style={styles.closeButton}
                onPress={() => setModalAberto(false)}
              >
                <X color={color.muted} size={20} strokeWidth={2} />
              </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.form}>
              {erro ? <Text style={styles.error}>{erro}</Text> : null}

              {!grupoEdicao ? (
                <>
                  <FieldLabel label="Aplicar para" />
                  <View style={styles.wrap}>
                    {([
                      ['TODOS', 'Todos'],
                      ['DEPARTAMENTO', 'Departamento'],
                      ['COLABORADOR', 'Colaborador'],
                    ] as [Publico, string][]).map(([id, label]) => (
                      <Chip
                        key={id}
                        label={label}
                        selected={publico === id}
                        onPress={() => {
                          setPublico(id);
                          setDepartamento('');
                          setBusca('');
                          setColaboradorId(null);
                        }}
                      />
                    ))}
                  </View>

                  {publico === 'DEPARTAMENTO' || publico === 'COLABORADOR' ? (
                    <>
                      <FieldLabel label="Departamento" />
                      <View style={styles.wrap}>
                        {departamentos.map((item) => (
                          <Chip
                            key={item}
                            label={item}
                            selected={departamento === item}
                            onPress={() => {
                              setDepartamento(item);
                              setColaboradorId(null);
                            }}
                          />
                        ))}
                      </View>
                    </>
                  ) : null}

                  {publico === 'COLABORADOR' ? (
                    <>
                      <FieldLabel label="Pesquisar colaborador" />
                      <SearchInput
                        value={busca}
                        onChangeText={(texto) => {
                          setBusca(texto);
                          setColaboradorId(null);
                        }}
                        placeholder="Nome, cargo ou departamento"
                      />
                      <View style={styles.peopleList}>
                        {colaboradoresFiltrados.map((funcionario) => (
                          <Pressable
                            key={funcionario.id}
                            style={[
                              styles.person,
                              colaboradorId === funcionario.id && styles.personSelected,
                            ]}
                            onPress={() => setColaboradorId(funcionario.id)}
                          >
                            <View style={styles.itemText}>
                              <Text style={styles.personName}>{funcionario.nome}</Text>
                              <Text style={styles.itemMeta}>
                                {funcionario.cargoNome ?? 'Cargo não informado'},{' '}
                                {funcionario.departamentoNome ?? 'sem departamento'}
                              </Text>
                            </View>
                          </Pressable>
                        ))}
                      </View>
                    </>
                  ) : null}

                  <Text style={styles.selectionCount}>
                    {destinatarios.length === 1 ? '1 colaborador selecionado' : `${destinatarios.length} colaboradores selecionados`}
                  </Text>
                </>
              ) : null}

              <FieldLabel label="Tipo de benefício" />
              <View style={styles.wrap}>
                {TIPOS.map((item) => (
                  <Chip
                    key={item.id}
                    label={item.label}
                    selected={tipo === item.id}
                    onPress={() => setTipo(item.id)}
                  />
                ))}
              </View>

              <FieldLabel label="Valor mensal (opcional)" />
              <TextInput
                style={styles.input}
                value={valor}
                onChangeText={setValor}
                keyboardType="decimal-pad"
                placeholder="0,00"
                placeholderTextColor={color.placeholder}
              />

              <FieldLabel label="Descrição (opcional)" />
              <TextInput
                style={[styles.input, styles.textArea]}
                value={descricao}
                onChangeText={setDescricao}
                multiline
                maxLength={255}
                textAlignVertical="top"
                placeholder="Detalhes do benefício"
                placeholderTextColor={color.placeholder}
              />
            </ScrollView>

            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={() => setModalAberto(false)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.saveButton} disabled={salvando} onPress={salvar}>
                {salvando
                  ? <ActivityIndicator color={color.onBrand} />
                  : <Text style={styles.saveText}>{grupoEdicao ? 'Salvar alterações' : 'Adicionar benefício'}</Text>}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={Boolean(grupoRemocao)}
        transparent
        animationType="fade"
        onRequestClose={() => setGrupoRemocao(null)}
      >
        <View style={styles.overlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.modalTitle}>Excluir benefício?</Text>
            <Text style={styles.description}>
              O benefício deixará de aparecer para {grupoRemocao?.funcionarios.length ?? 0} {(grupoRemocao?.funcionarios.length ?? 0) === 1 ? 'colaborador' : 'colaboradores'}. Essa ação não pode ser desfeita.
            </Text>
            <View style={styles.actions}>
              <Pressable style={styles.cancelButton} onPress={() => setGrupoRemocao(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.dangerButton} disabled={salvando} onPress={remover}>
                <Text style={[styles.saveText, styles.actionTextRegular]}>
                  {salvando ? 'Excluindo…' : 'Excluir benefício'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Chip({
  label,
  selected,
  onPress,
}: {
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

function FieldLabel({ label }: { label: string }) {
  return <Text style={styles.label}>{label}</Text>;
}

function agruparBeneficios(beneficios: BeneficioAdminResponse[]): GrupoBeneficio[] {
  const grupos = new Map<string, GrupoBeneficio>();
  beneficios.forEach((beneficio) => {
    const chave = JSON.stringify([
      beneficio.tipo,
      beneficio.valor,
      beneficio.descricao?.trim() || null,
    ]);
    const atual = grupos.get(chave);
    if (atual) {
      atual.ids.push(beneficio.id);
      atual.funcionarioIds.push(beneficio.funcionarioId);
      atual.funcionarios.push(beneficio.funcionarioNome);
      return;
    }
    grupos.set(chave, {
      chave,
      ids: [beneficio.id],
      funcionarioIds: [beneficio.funcionarioId],
      funcionarios: [beneficio.funcionarioNome],
      tipo: beneficio.tipo,
      valor: beneficio.valor,
      descricao: beneficio.descricao,
    });
  });
  return [...grupos.values()].sort((a, b) => rotuloTipo(a.tipo)
    .localeCompare(rotuloTipo(b.tipo), 'pt-BR'));
}

function rotuloTipo(tipo: TipoBeneficio): string {
  return TIPOS.find((item) => item.id === tipo)?.label ?? tipo.replace(/_/g, ' ');
}

function resumirNomes(nomes: string[]): string {
  const ordenados = [...nomes].sort((a, b) => a.localeCompare(b, 'pt-BR'));
  if (ordenados.length <= 3) return ordenados.join(', ');
  return `${ordenados.slice(0, 3).join(', ')} e mais ${ordenados.length - 3}`;
}

function formatarDinheiro(valor: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(valor);
}

const styles = estilos(() => ({
  section: ui.section,
  header: ui.header,
  headerText: ui.headerText,
  title: ui.title,
  subtitle: ui.subtitle,
  list: ui.list,
  item: ui.rowStack,
  itemTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  itemText: ui.rowText,
  itemTitle: ui.rowTitle,
  itemMeta: ui.rowMeta,
  amount: { color: color.ink, ...type.body, fontWeight: '600', textAlign: 'right' },
  description: ui.rowBody,
  people: ui.rowMeta,
  editButton: { ...ui.btnSm, ...ui.btnSecondary },
  removeButton: { ...ui.btnSm, ...ui.btnQuiet },
  removeText: ui.btnTextDanger,
  empty: ui.empty,
  overlay: ui.overlay,
  modal: { ...ui.modal, maxWidth: 600 },
  confirmModal: { ...ui.modal, maxWidth: 420 },
  modalTitle: ui.modalTitle,
  closeButton: ui.iconButton,
  form: { gap: 10, paddingBottom: 4 },
  label: { ...ui.label, marginTop: 6 },
  wrap: ui.chips,
  chip: ui.chip,
  chipSelected: ui.chipActive,
  chipText: ui.chipText,
  chipTextSelected: ui.chipTextActive,
  input: ui.input,
  textArea: ui.textarea,
  peopleList: { gap: 4, maxHeight: 240 },
  person: { borderWidth: 1, borderColor: color.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8 },
  personSelected: { borderColor: color.brand, backgroundColor: color.brandSoft },
  personName: ui.rowTitle,
  selectionCount: { ...ui.help, marginTop: 4 },
  error: ui.error,
  actions: ui.modalActions,
  cancelButton: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  saveButton: { ...ui.btn, ...ui.btnPrimary, minWidth: 96 },
  dangerButton: { ...ui.btn, ...ui.btnDanger },
  saveText: ui.btnTextOnColor,
  actionTextRegular: {},
}));
