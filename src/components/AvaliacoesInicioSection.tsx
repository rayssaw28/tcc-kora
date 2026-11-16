import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import { X } from 'lucide-react-native';

import { api } from '@/api/client';
import {
  ApiError,
  AvaliacaoResponse,
  FuncionarioFeedbackResumo,
} from '@/api/types';
import { SearchInput } from '@/components/SearchInput';
import { AddButton, ui } from '@/components/ui';
import { color, estilos, type } from '@/constants/theme';

const CRITERIOS = [
  'Colaboracao',
  'Comunicacao',
  'Qualidade das entregas',
  'Organizacao',
  'Proatividade',
  'Lideranca',
  'Desenvolvimento tecnico',
];

export function AvaliacoesInicioSection({
  avaliacoes,
  visualizadas,
  onVisualizar,
  funcionarios,
  meuId,
}: {
  avaliacoes: AvaliacaoResponse[];
  visualizadas: number[];
  onVisualizar: (id: number) => void;
  funcionarios: FuncionarioFeedbackResumo[];
  meuId: number | null;
}) {
  const [enviadas, setEnviadas] = useState<AvaliacaoResponse[]>([]);
  const [listaAberta, setListaAberta] = useState(false);
  const [selecionada, setSelecionada] = useState<AvaliacaoResponse | null>(null);
  const [formAberto, setFormAberto] = useState(false);
  const [editando, setEditando] = useState<AvaliacaoResponse | null>(null);
  const [departamentoId, setDepartamentoId] = useState<number | null>(null);
  const [busca, setBusca] = useState('');
  const [destinatarioId, setDestinatarioId] = useState<number | null>(null);
  const [periodo, setPeriodo] = useState('');
  const [comentario, setComentario] = useState('');
  const [criterios, setCriterios] = useState<Record<string, number>>({});
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregarEnviadas = useCallback(async () => {
    try {
      const { data } = await api.get<AvaliacaoResponse[]>(
        '/api/funcionarios/me/avaliacoes-enviadas',
      );
      setEnviadas(data);
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível carregar as avaliações enviadas.'));
    }
  }, []);

  useEffect(() => {
    carregarEnviadas();
  }, [carregarEnviadas]);

  const finalizadas = useMemo(
    () => [...avaliacoes]
      .filter((item) => item.status === 'FINALIZADA')
      .sort((a, b) => dataOrdenacao(b) - dataOrdenacao(a)),
    [avaliacoes],
  );
  const ultima = finalizadas[0];
  const destinatarios = useMemo(
    () => funcionarios.filter((item) => item.id !== meuId),
    [funcionarios, meuId],
  );
  const departamentos = useMemo(() => {
    const unicos = new Map<number, string>();
    destinatarios.forEach((item) => {
      if (item.departamentoId && item.departamentoNome) {
        unicos.set(item.departamentoId, item.departamentoNome);
      }
    });
    return [...unicos.entries()].map(([id, nome]) => ({ id, nome }));
  }, [destinatarios]);
  const filtrados = useMemo(() => {
    const termo = busca.trim().toLocaleLowerCase('pt-BR');
    if (departamentoId === null && !termo) return [];
    return destinatarios.filter((item) => {
      const departamentoOk = departamentoId === null
        || item.departamentoId === departamentoId;
      const buscaOk = !termo
        || item.nome.toLocaleLowerCase('pt-BR').includes(termo)
        || (item.cargoNome ?? '').toLocaleLowerCase('pt-BR').includes(termo);
      return departamentoOk && buscaOk;
    });
  }, [busca, departamentoId, destinatarios]);

  function abrirNovo() {
    setEditando(null);
    setDepartamentoId(null);
    setBusca('');
    setDestinatarioId(null);
    setPeriodo('');
    setComentario('');
    setCriterios({});
    setErro(null);
    setFormAberto(true);
  }

  function abrirEdicao(item: AvaliacaoResponse) {
    setEditando(item);
    setDestinatarioId(item.avaliadoId);
    setPeriodo(item.periodo);
    setComentario(item.comentarioGeral ?? '');
    setCriterios(Object.fromEntries(
      item.itens.map((criterio) => [criterio.criterio, criterio.nota]),
    ));
    setErro(null);
    setFormAberto(true);
  }

  function alternarCriterio(criterio: string) {
    setCriterios((atuais) => {
      const proximos = { ...atuais };
      if (criterio in proximos) delete proximos[criterio];
      else proximos[criterio] = 3;
      return proximos;
    });
  }

  async function salvar(finalizar: boolean) {
    if (!destinatarioId || !periodo.trim() || !comentario.trim()) {
      setErro('Selecione o colaborador e informe período e feedback.');
      return;
    }
    setSalvando(true);
    setErro(null);
    try {
      const itens = Object.entries(criterios).map(([criterio, nota]) => ({
        criterio,
        nota,
        comentario: null,
      }));
      let id = editando?.id;
      if (id) {
        await api.put(`/api/avaliacoes/${id}`, {
          periodo: periodo.trim(),
          comentarioGeral: comentario.trim(),
          itens,
        });
      } else {
        const { data } = await api.post<AvaliacaoResponse>('/api/feedbacks', {
          destinatarioId,
          periodo: periodo.trim(),
          comentario: comentario.trim(),
          criterios: itens,
        });
        id = data.id;
      }
      if (finalizar && id) await api.post(`/api/avaliacoes/${id}/finalizar`);
      setFormAberto(false);
      await carregarEnviadas();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar a avaliação.'));
    } finally {
      setSalvando(false);
    }
  }

  async function finalizar(id: number) {
    try {
      await api.post(`/api/avaliacoes/${id}/finalizar`);
      await carregarEnviadas();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível finalizar a avaliação.'));
    }
  }

  async function excluir(id: number) {
    try {
      await api.delete(`/api/avaliacoes/${id}`);
      await carregarEnviadas();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível excluir a avaliação.'));
    }
  }

  function abrirDetalhes(item: AvaliacaoResponse) {
    onVisualizar(item.id);
    setListaAberta(false);
    setSelecionada(item);
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Avaliações e feedback</Text>
          <Text style={styles.subtitle}>O que você recebeu e o que enviou para colegas</Text>
        </View>
        <AddButton label="Dar feedback" onPress={abrirNovo} />
      </View>

      {erro ? <Text style={styles.error}>{erro}</Text> : null}

      <Text style={styles.blockTitle}>Último feedback recebido</Text>
      {ultima ? (
        <Pressable style={styles.latest} onPress={() => abrirDetalhes(ultima)} accessibilityRole="button" accessibilityLabel={`Abrir avaliação ${ultima.periodo}`}>
          <View style={styles.itemText}>
            <Text style={styles.itemTitle}>Avaliação {ultima.periodo}</Text>
            <Text style={styles.meta}>Por {ultima.avaliadorNome} em {formatarData(ultima.atualizadoEm)}</Text>
            <Text style={styles.feedback} numberOfLines={3}>
              {ultima.comentarioGeral || 'Sem comentário geral.'}
            </Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.score}>{formatarNota(ultima.notaFinal)}</Text>
            <Text style={styles.meta}>média de 5</Text>
          </View>
        </Pressable>
      ) : <Text style={styles.empty}>Você ainda não recebeu avaliações.</Text>}

      {finalizadas.length ? (
        <Pressable style={styles.secondaryButton} onPress={() => setListaAberta(true)}>
          <Text style={styles.secondaryText}>Ver todas as avaliações recebidas ({finalizadas.length})</Text>
        </Pressable>
      ) : null}

      <Text style={styles.blockTitle}>Enviadas por você</Text>
      {enviadas.length ? enviadas.map((item) => (
        <View key={item.id} style={styles.sentItem}>
          <View style={styles.itemText}>
            <Text style={styles.itemTitle}>{item.avaliadoNome}</Text>
            <Text style={styles.meta}>
              {item.periodo}, {item.status === 'RASCUNHO'
                ? 'rascunho não enviado'
                : `finalizada com média ${formatarNota(item.notaFinal)}`}
            </Text>
          </View>
          {item.status === 'RASCUNHO' ? (
            <>
              <Pressable style={styles.smallButton} onPress={() => abrirEdicao(item)}>
                <Text style={styles.smallButtonText}>Editar</Text>
              </Pressable>
              <Pressable style={styles.finishButton} onPress={() => finalizar(item.id)}>
                <Text style={styles.finishText}>Enviar</Text>
              </Pressable>
            </>
          ) : null}
          <Pressable style={styles.deleteButton} onPress={() => excluir(item.id)}>
            <Text style={styles.deleteText}>Excluir</Text>
          </Pressable>
        </View>
      )) : <Text style={styles.empty}>Você ainda não deu feedback para ninguém.</Text>}

      <Modal visible={formAberto} transparent animationType="fade"
        onRequestClose={() => setFormAberto(false)}>
        <View style={styles.overlay}>
          <View style={styles.formModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editando ? 'Editar feedback' : 'Dar feedback'}
              </Text>
              <Pressable
                accessibilityLabel="Fechar"
                style={styles.closeButton}
                onPress={() => setFormAberto(false)}
              >
                <X color={color.muted} size={20} strokeWidth={2} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.form}>
              {erro ? <Text style={styles.error}>{erro}</Text> : null}
              {!editando ? (
                <>
                  <View style={styles.field}>
                    <Text style={styles.label}>Para quem</Text>
                    <SearchInput value={busca}
                      onChangeText={setBusca} placeholder="Nome ou cargo" />
                  </View>
                  <Text style={styles.label}>Departamento</Text>
                  <View style={styles.chips}>
                    <Chip label="Todos" ativo={departamentoId === null}
                      onPress={() => setDepartamentoId(null)} />
                    {departamentos.map((item) => (
                      <Chip key={item.id} label={item.nome}
                        ativo={departamentoId === item.id}
                        onPress={() => setDepartamentoId(item.id)} />
                    ))}
                  </View>
                  <View style={styles.recipientList}>
                    {filtrados.map((item) => (
                      <Pressable key={item.id}
                        style={[styles.recipient, destinatarioId === item.id && styles.recipientActive]}
                        onPress={() => setDestinatarioId(item.id)}>
                        <Text style={styles.itemTitle}>{item.nome}</Text>
                        <Text style={styles.meta}>{item.cargoNome ?? 'Cargo não informado'}</Text>
                      </Pressable>
                    ))}
                  </View>
                </>
              ) : (
                <Text style={styles.selectedPerson}>Para {editando.avaliadoNome}</Text>
              )}
              <Campo label="Período" value={periodo} onChangeText={setPeriodo}
                placeholder="Ex.: 1º semestre/2026" />
              <Campo label="Feedback" value={comentario} onChangeText={setComentario}
                placeholder="Escreva o feedback" multiline />
              <Text style={styles.label}>Critérios (opcional)</Text>
              <View style={styles.chips}>
                {CRITERIOS.map((criterio) => (
                  <Chip key={criterio} label={rotuloCriterio(criterio)} ativo={criterio in criterios}
                    onPress={() => alternarCriterio(criterio)} />
                ))}
              </View>
              {Object.entries(criterios).map(([criterio, nota]) => (
                <View key={criterio} style={styles.ratingRow}>
                  <Text style={styles.ratingLabel}>{rotuloCriterio(criterio)}</Text>
                  <View style={styles.ratingButtons}>
                    {[1, 2, 3, 4, 5].map((valor) => (
                      <Pressable key={valor}
                        style={[styles.rating, nota === valor && styles.ratingActive]}
                        onPress={() => setCriterios((atuais) => ({ ...atuais, [criterio]: valor }))}>
                        <Text style={[styles.ratingText, nota === valor && styles.ratingTextActive]}>
                          {valor}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              ))}
              <View style={styles.formActions}>
                <Pressable style={styles.cancel} onPress={() => setFormAberto(false)}>
                  <Text style={styles.cancelText}>Cancelar</Text>
                </Pressable>
                <Pressable style={styles.draft} disabled={salvando} onPress={() => salvar(false)}>
                  <Text style={styles.draftText}>Salvar rascunho</Text>
                </Pressable>
                <Pressable style={styles.submit} disabled={salvando} onPress={() => salvar(true)}>
                  {salvando ? <ActivityIndicator color={color.onBrand} /> : <Text style={styles.submitText}>Enviar feedback</Text>}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={listaAberta} transparent animationType="fade"
        onRequestClose={() => setListaAberta(false)}>
        <View style={styles.overlay}><View style={styles.listModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Avaliações recebidas</Text>
            <Pressable
              accessibilityLabel="Fechar"
              style={styles.closeButton}
              onPress={() => setListaAberta(false)}
            >
              <X color={color.muted} size={20} strokeWidth={2} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={styles.form}>
            {finalizadas.map((item) => (
              <Pressable key={item.id} style={styles.receivedItem}
                onPress={() => abrirDetalhes(item)}>
                {!visualizadas.includes(item.id) ? <View style={styles.unread} /> : null}
                <View style={styles.itemText}>
                  <Text style={styles.itemTitle}>Avaliação {item.periodo}</Text>
                  <Text style={styles.meta}>{item.avaliadorNome}</Text>
                </View>
                <Text style={styles.scoreSmall}>{formatarNota(item.notaFinal)}</Text>
              </Pressable>
            ))}
          </ScrollView>
        </View></View>
      </Modal>

      <Modal visible={Boolean(selecionada)} transparent animationType="fade"
        onRequestClose={() => setSelecionada(null)}>
        <View style={styles.overlay}><View style={styles.listModal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Avaliação {selecionada?.periodo}</Text>
            <Pressable
              accessibilityLabel="Fechar"
              style={styles.closeButton}
              onPress={() => setSelecionada(null)}
            >
              <X color={color.muted} size={20} strokeWidth={2} />
            </Pressable>
          </View>
          {selecionada ? (
            <ScrollView contentContainerStyle={styles.form}>
              <Text style={styles.meta}>Avaliado por {selecionada.avaliadorNome}</Text>
              <Text style={styles.fullFeedback}>{selecionada.comentarioGeral}</Text>
              {selecionada.itens.map((item) => (
                <View key={item.id} style={styles.criterion}>
                  <Text style={styles.ratingLabel}>{rotuloCriterio(item.criterio)}</Text>
                  <Text style={styles.scoreSmall}>{item.nota}/5</Text>
                </View>
              ))}
            </ScrollView>
          ) : null}
        </View></View>
      </Modal>
    </View>
  );
}

function Campo({ label, value, onChangeText, placeholder, multiline }: {
  label: string; value: string; onChangeText: (valor: string) => void;
  placeholder: string; multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={[styles.input, multiline && styles.textarea]} value={value}
        onChangeText={onChangeText} placeholder={placeholder}
        placeholderTextColor={color.placeholder} multiline={multiline} />
    </View>
  );
}

function Chip({ label, ativo, onPress }: {
  label: string; ativo: boolean; onPress: () => void;
}) {
  return (
    <Pressable style={[styles.chip, ativo && styles.chipActive]} onPress={onPress}>
      <Text style={[styles.chipText, ativo && styles.chipTextActive]}>{label}</Text>
    </Pressable>
  );
}

function mensagemErro(e: unknown, fallback: string): string {
  if (isAxiosError(e)) return (e.response?.data as ApiError | undefined)?.message ?? fallback;
  return fallback;
}

function dataOrdenacao(item: AvaliacaoResponse): number {
  return new Date(item.atualizadoEm || item.criadoEm).getTime();
}

function rotuloCriterio(criterio: string): string {
  const rotulos: Record<string, string> = {
    Colaboracao: 'Colaboração',
    Comunicacao: 'Comunicação',
    Organizacao: 'Organização',
    Lideranca: 'Liderança',
    'Desenvolvimento tecnico': 'Desenvolvimento técnico',
  };
  return rotulos[criterio] ?? criterio;
}

function formatarNota(nota: number | null): string {
  return nota === null ? '-' : nota.toFixed(1).replace('.', ',');
}

function formatarData(valor: string): string {
  return new Date(valor).toLocaleDateString('pt-BR');
}

const styles = estilos(() => ({
  section: ui.section,
  header: ui.header,
  headerText: ui.headerText,
  title: ui.title,
  subtitle: ui.subtitle,
  blockTitle: ui.groupTitle,
  latest: { flexDirection: 'row', alignItems: 'flex-start', gap: 16, borderRadius: 8, backgroundColor: color.canvas, borderWidth: 1, borderColor: color.line, padding: 16 },
  itemText: ui.rowText,
  itemTitle: ui.rowTitle,
  meta: ui.rowMeta,
  feedback: { color: color.text, ...type.body, marginTop: 4 },
  score: { color: color.ink, ...type.title, fontWeight: '600' },
  scoreSmall: { color: color.ink, ...type.body, fontWeight: '600' },
  secondaryButton: ui.link,
  secondaryText: ui.linkText,
  sentItem: ui.row,
  smallButton: { ...ui.btnSm, ...ui.btnSecondary },
  smallButtonText: ui.btnTextSm,
  finishButton: { ...ui.btnSm, ...ui.btnPrimary },
  finishText: ui.btnTextSmOnColor,
  deleteButton: { ...ui.btnSm, ...ui.btnQuiet },
  deleteText: ui.btnTextDanger,
  empty: ui.empty,
  error: ui.error,
  overlay: ui.overlay,
  formModal: { ...ui.modal, maxWidth: 640 },
  listModal: { ...ui.modal, maxWidth: 560, maxHeight: '85%' },
  modalHeader: ui.modalHeader,
  modalTitle: ui.modalTitle,
  closeButton: ui.iconButton,
  form: { gap: 12 },
  field: ui.field,
  label: { ...ui.label, marginTop: 4 },
  input: ui.input,
  textarea: ui.textarea,
  chips: ui.chips,
  chip: ui.chip,
  chipActive: ui.chipActive,
  chipText: ui.chipText,
  chipTextActive: ui.chipTextActive,
  recipientList: { gap: 4 },
  recipient: { borderWidth: 1, borderColor: color.line, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 8, gap: 2 },
  recipientActive: { borderColor: color.brand, backgroundColor: color.brandSoft },
  selectedPerson: { color: color.ink, ...type.body, fontWeight: '600' },
  ratingRow: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8, paddingVertical: 8, borderTopWidth: 1, borderTopColor: color.line },
  ratingLabel: { color: color.ink, ...type.body },
  ratingButtons: { flexDirection: 'row', gap: 6 },
  rating: { width: 36, height: 36, borderRadius: 8, borderWidth: 1, borderColor: color.lineStrong, alignItems: 'center', justifyContent: 'center' },
  ratingActive: { backgroundColor: color.brand, borderColor: color.brand },
  ratingText: { color: color.inkSoft, ...type.body, fontWeight: '500' },
  ratingTextActive: { color: color.onBrand, fontWeight: '600' },
  formActions: { ...ui.modalActions, marginTop: 8 },
  cancel: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  draft: { ...ui.btn, ...ui.btnSecondary },
  draftText: ui.btnText,
  submit: { ...ui.btn, ...ui.btnPrimary, minWidth: 120 },
  submitText: ui.btnTextOnColor,
  receivedItem: ui.row,
  unread: { width: 8, height: 8, borderRadius: 4, backgroundColor: color.brand },
  fullFeedback: { color: color.text, ...type.body },
  criterion: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderTopWidth: 1, borderTopColor: color.line },
}));
