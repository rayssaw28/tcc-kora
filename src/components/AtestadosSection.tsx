import { useState } from 'react';
import {
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { isAxiosError } from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import { Download, Paperclip, X } from 'lucide-react-native';

import { api } from '@/api/client';
import { baixarArquivo } from '@/api/download';
import { ApiError, AtestadoResponse, StatusDocumento } from '@/api/types';
import { CalendarDateInput } from '@/components/CalendarDateInput';
import { AddButton, Badge, ui } from '@/components/ui';
import { color, estilos } from '@/constants/theme';

type Arquivo = { uri: string; name: string; type: string };

export function AtestadosSection({
  atestados,
  podeEnviar,
  isAdmin,
  exibirColaborador = false,
  onAtualizar,
  onAprovar,
  onReprovar,
  onRemover,
}: {
  atestados: AtestadoResponse[];
  podeEnviar: boolean;
  isAdmin: boolean;
  exibirColaborador?: boolean;
  onAtualizar: () => Promise<void>;
  onAprovar: (id: number) => void;
  onReprovar: (id: number, motivo: string) => void;
  onRemover: (id: number) => void;
}) {
  const [aberto, setAberto] = useState(false);
  const [inicio, setInicio] = useState('');
  const [fim, setFim] = useState('');
  const [observacao, setObservacao] = useState('');
  const [arquivo, setArquivo] = useState<Arquivo | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [reprovandoId, setReprovandoId] = useState<number | null>(null);
  const [motivo, setMotivo] = useState('');

  function limparEFechar() {
    if (enviando) return;
    setAberto(false);
    setInicio('');
    setFim('');
    setObservacao('');
    setArquivo(null);
    setErro(null);
  }

  async function selecionarArquivo() {
    const resultado = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*'],
      copyToCacheDirectory: true,
    });
    if (!resultado.canceled && resultado.assets?.length) {
      const asset = resultado.assets[0];
      setArquivo({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? 'application/octet-stream',
      });
    }
  }

  async function enviar() {
    if (!inicio || !fim) {
      setErro('Selecione as datas de início e fim.');
      return;
    }
    if (fim < inicio) {
      setErro('A data de fim não pode ser anterior à data de início.');
      return;
    }
    if (!arquivo) {
      setErro('Anexe o arquivo do atestado.');
      return;
    }

    setEnviando(true);
    setErro(null);
    try {
      const form = new FormData();
      form.append('dataInicio', inicio);
      form.append('dataFim', fim);
      if (observacao.trim()) form.append('observacao', observacao.trim());
      form.append('file', arquivo as never);

      await api.post('/api/funcionarios/me/atestados', form, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      await onAtualizar();
      setAberto(false);
      setInicio('');
      setFim('');
      setObservacao('');
      setArquivo(null);
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível enviar o atestado.'));
    } finally {
      setEnviando(false);
    }
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>Atestados</Text>
          <Text style={styles.subtitle}>
            {isAdmin ? 'Atestados aguardando análise do RH' : 'Atestados médicos que você enviou'}
          </Text>
        </View>
        {podeEnviar ? <AddButton label="Enviar atestado" onPress={() => setAberto(true)} /> : null}
      </View>

      {atestados.length ? (
        <View style={ui.list}>
          {atestados.map((atestado) => (
            <View key={atestado.id} style={ui.rowStack}>
              <View style={styles.itemTop}>
                <View style={ui.rowText}>
                  {exibirColaborador ? (
                    <Text style={ui.rowTitle}>{atestado.funcionarioNome}</Text>
                  ) : null}
                  <Text style={exibirColaborador ? ui.rowBody : ui.rowTitle}>
                    {formatarData(atestado.dataInicio)} a {formatarData(atestado.dataFim)}
                    {' '}({atestado.diasCobertos} {atestado.diasCobertos === 1 ? 'dia' : 'dias'})
                  </Text>
                  <Text style={ui.rowMeta}>
                    {exibirColaborador
                      ? `${atestado.cargoNome ?? 'Cargo não informado'}, ${atestado.departamentoNome ?? 'sem departamento'}`
                      : atestado.observacao ?? 'Sem observação'}
                  </Text>
                  {exibirColaborador && atestado.observacao ? (
                    <Text style={ui.rowMeta}>{atestado.observacao}</Text>
                  ) : null}
                  {atestado.motivoReprovacao ? (
                    <Text style={styles.reason}>Motivo da recusa: {atestado.motivoReprovacao}</Text>
                  ) : null}
                </View>
                <Status status={atestado.status} />
              </View>
              <View style={ui.actionsRow}>
                <Pressable
                  style={ui.link}
                  onPress={() => baixarArquivo(`/api/atestados/${atestado.id}/download`, atestado.nomeArquivo)}
                  accessibilityRole="link"
                  accessibilityLabel={`Baixar ${atestado.nomeArquivo}`}
                >
                  <Download color={color.brand} size={15} strokeWidth={2.2} />
                  <Text style={ui.linkText} numberOfLines={1}>{atestado.nomeArquivo}</Text>
                </Pressable>
                <View style={styles.spacer} />
                {isAdmin && atestado.status === 'PENDENTE' ? (
                  <>
                    <Pressable style={[ui.btnSm, ui.btnPrimary]} onPress={() => onAprovar(atestado.id)} accessibilityRole="button">
                      <Text style={ui.btnTextSmOnColor}>Aprovar</Text>
                    </Pressable>
                    <Pressable style={[ui.btnSm, ui.btnSecondary]} onPress={() => setReprovandoId(atestado.id)} accessibilityRole="button">
                      <Text style={ui.btnTextDanger}>Recusar</Text>
                    </Pressable>
                  </>
                ) : null}
                {(isAdmin || podeEnviar) ? (
                  <Pressable style={[ui.btnSm, ui.btnQuiet]} onPress={() => onRemover(atestado.id)} accessibilityRole="button">
                    <Text style={ui.btnTextDanger}>Excluir</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          ))}
        </View>
      ) : (
        <Text style={styles.empty}>
          {isAdmin ? 'Nenhum atestado aguardando análise.' : 'Você ainda não enviou atestados.'}
        </Text>
      )}

      <Modal visible={aberto} transparent animationType="fade" onRequestClose={limparEFechar}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <View style={styles.modalHeader}>
              <View style={styles.headerText}>
                <Text style={styles.modalTitle}>Enviar atestado</Text>
                <Text style={styles.subtitle}>
                  O envio ficará pendente até a análise do RH.
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Fechar"
                style={styles.closeButton}
                onPress={limparEFechar}
              >
                <X color={color.muted} size={20} strokeWidth={2} />
              </Pressable>
            </View>

            {erro ? <Text style={styles.error}>{erro}</Text> : null}

            <View style={styles.dateRow}>
              <CalendarDateInput
                label="Início"
                required
                value={inicio}
                onChange={setInicio}
              />
              <CalendarDateInput
                label="Fim"
                required
                value={fim}
                onChange={setFim}
              />
            </View>
            <Campo label="Observação" value={observacao}
              placeholder="Opcional" onChangeText={setObservacao} />

            <View style={styles.field}>
              <Text style={styles.label}>
                Anexar arquivo<Text style={styles.required}> *</Text>
              </Text>
              <Pressable style={styles.fileButton} onPress={selecionarArquivo}>
                <Paperclip color={color.brand} size={17} strokeWidth={2.2} />
                <Text style={styles.fileButtonText}>
                  {arquivo?.name ?? 'Selecionar PDF ou imagem'}
                </Text>
              </Pressable>
            </View>

            <View style={styles.actions}>
              <Pressable style={styles.cancel} onPress={limparEFechar}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable
                disabled={enviando}
                style={[styles.send, enviando && styles.disabled]}
                onPress={enviar}
              >
                <Text style={styles.whiteText}>
                  {enviando ? 'Enviando...' : 'Enviar atestado'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={reprovandoId !== null} transparent animationType="fade"
        onRequestClose={() => setReprovandoId(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Recusar atestado</Text>
            <Text style={styles.subtitle}>O colaborador verá este motivo junto do atestado.</Text>
            <TextInput
              style={[styles.input, styles.reasonInput]}
              value={motivo}
              onChangeText={setMotivo}
              multiline
              maxLength={255}
              placeholder="Explique o que precisa ser corrigido"
              placeholderTextColor={color.placeholder}
            />
            <View style={styles.actions}>
              <Pressable style={styles.cancel} onPress={() => setReprovandoId(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={[ui.btn, ui.btnDanger]} onPress={() => {
                if (reprovandoId === null || !motivo.trim()) return;
                onReprovar(reprovandoId, motivo.trim());
                setReprovandoId(null);
                setMotivo('');
              }}>
                <Text style={styles.whiteText}>Recusar atestado</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function Campo({
  label,
  obrigatorio,
  value,
  placeholder,
  onChangeText,
}: {
  label: string;
  obrigatorio?: boolean;
  value: string;
  placeholder: string;
  onChangeText: (valor: string) => void;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}{obrigatorio ? <Text style={styles.required}> *</Text> : null}
      </Text>
      <TextInput
        style={styles.input}
        value={value}
        placeholder={placeholder}
        placeholderTextColor={color.placeholder}
        onChangeText={onChangeText}
      />
    </View>
  );
}

function Status({ status }: { status: StatusDocumento }) {
  const label = status === 'APROVADO' ? 'Aprovado' : status === 'REPROVADO' ? 'Recusado' : 'Em análise';
  return <Badge label={label} tom={status === 'APROVADO' ? 'ok' : status === 'REPROVADO' ? 'bad' : 'warn'} />;
}

function formatarData(valor: string): string {
  const [ano, mes, dia] = valor.split('-');
  return `${dia}/${mes}/${ano}`;
}

function mensagemErro(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    return (e.response?.data as ApiError | undefined)?.message ?? fallback;
  }
  return fallback;
}

const styles = estilos(() => ({
  section: ui.section,
  header: ui.header,
  headerText: ui.headerText,
  title: ui.title,
  subtitle: ui.subtitle,
  itemTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  spacer: { flex: 1 },
  reason: { color: color.danger, fontSize: 13, lineHeight: 19 },
  whiteText: ui.btnTextOnColor,
  empty: ui.empty,
  overlay: ui.overlay,
  modal: ui.modal,
  modalHeader: ui.modalHeader,
  modalTitle: ui.modalTitle,
  closeButton: ui.iconButton,
  dateRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  field: { ...ui.field, flex: 1 },
  label: ui.label,
  required: ui.required,
  input: ui.input,
  reasonInput: ui.textarea,
  fileButton: { minHeight: 48, borderWidth: 1, borderStyle: 'dashed', borderColor: color.lineStrong, borderRadius: 8, paddingHorizontal: 14, backgroundColor: color.canvas, flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileButtonText: { color: color.brand, fontSize: 15, fontWeight: '600' },
  actions: ui.modalActions,
  cancel: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  send: { ...ui.btn, ...ui.btnPrimary },
  disabled: ui.btnDisabled,
  error: ui.error,
}));
