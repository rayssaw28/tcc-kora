import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  type KeyboardTypeOptions,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as DocumentPicker from 'expo-document-picker';
import { isAxiosError } from 'axios';
import { Download, Paperclip } from 'lucide-react-native';

import { api } from '@/api/client';
import { baixarArquivo } from '@/api/download';
import {
  ApiError,
  DocumentoResponse,
  DocumentosPessoaisResponse,
  RequisitoDocumentoResponse,
  StatusDocumento,
} from '@/api/types';
import { Badge, ui } from '@/components/ui';
import { color, type } from '@/constants/theme';

type Arquivo = { uri: string; name: string; type: string; file?: File };

const UFS_BRASIL = new Set([
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO',
  'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI',
  'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO',
]);

export function DocumentosSection({
  funcionarioId,
  meuId,
  documentos,
  requisitos,
  podeEditar,
  isAdmin,
  onAtualizar,
  onAprovar,
  onReprovar,
  onRemover,
}: {
  funcionarioId: number | null;
  meuId: number | null;
  documentos: DocumentoResponse[];
  requisitos: RequisitoDocumentoResponse[];
  podeEditar: boolean;
  isAdmin: boolean;
  onAtualizar: () => Promise<void>;
  onAprovar: (id: number) => void;
  onReprovar: (id: number, motivo: string) => void;
  onRemover: (id: number) => void;
}) {
  const [dados, setDados] = useState<DocumentosPessoaisResponse | null>(null);
  const [editando, setEditando] = useState<RequisitoDocumentoResponse | null>(null);
  const [arquivo, setArquivo] = useState<Arquivo | null>(null);
  const [cpf, setCpf] = useState('');
  const [ctpsNumero, setCtpsNumero] = useState('');
  const [ctpsSerie, setCtpsSerie] = useState('');
  const [ctpsUf, setCtpsUf] = useState('');
  const [pis, setPis] = useState('');
  const [ctpsDigital, setCtpsDigital] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [reprovando, setReprovando] = useState<DocumentoResponse | null>(null);
  const [motivo, setMotivo] = useState('');

  const anexos = useMemo(() => {
    const mapa = new Map<number, DocumentoResponse>();
    documentos
      .filter((item) => item.requisitoId !== null)
      .sort((a, b) => new Date(a.criadoEm).getTime() - new Date(b.criadoEm).getTime())
      .forEach((item) => mapa.set(item.requisitoId!, item));
    return mapa;
  }, [documentos]);

  const carregarDados = useCallback(async () => {
    if (!funcionarioId || !meuId) return;
    setCarregando(true);
    try {
      const url = funcionarioId === meuId
        ? '/api/funcionarios/me/documentos-pessoais'
        : `/api/funcionarios/${funcionarioId}/documentos-pessoais`;
      const { data } = await api.get<DocumentosPessoaisResponse>(url);
      setDados(data);
      preencherDados(data);
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível carregar os documentos.'));
    } finally {
      setCarregando(false);
    }
  }, [funcionarioId, meuId]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

  function preencherDados(valor: DocumentosPessoaisResponse) {
    setCpf(valor.cpf ?? '');
    setCtpsNumero(valor.ctpsNumero ?? '');
    setCtpsSerie(valor.ctpsSerie ?? '');
    setCtpsUf(valor.ctpsUfEmissor ?? '');
    setPis(valor.pis ?? '');
    setCtpsDigital(Boolean(valor.ctpsDigital));
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
        file: asset.file,
      });
    }
  }

  function abrirEdicao(requisito: RequisitoDocumentoResponse) {
    if (dados) preencherDados(dados);
    setArquivo(null);
    setErro(null);
    setEditando(requisito);
  }

  async function salvar() {
    if (!editando || !funcionarioId || !meuId) return;
    if (!arquivo && !anexos.has(editando.id)) {
      setErro('Selecione o anexo.');
      return;
    }
    const cpfLimpo = somenteDigitos(cpf);
    const pisLimpo = somenteDigitos(pis);
    const ufNormalizada = normalizarUf(ctpsUf);

    if (editando.tipo === 'CPF' && cpfLimpo.length !== 11) {
      setErro('Informe um CPF com 11 dígitos.');
      return;
    }
    if (editando.tipo === 'CARTEIRA_TRABALHO') {
      if (!ctpsNumero.trim() || !ctpsSerie.trim()) {
        setErro('Informe número e série da Carteira de Trabalho.');
        return;
      }
      if (!UFS_BRASIL.has(ufNormalizada)) {
        setErro('Informe uma UF emissora válida com 2 letras. Exemplo: GO.');
        return;
      }
      if (pisLimpo.length !== 11) {
        setErro('Informe um PIS com 11 dígitos.');
        return;
      }
    }
    setSalvando(true);
    setErro(null);
    try {
      if (editando.tipo === 'CPF' || editando.tipo === 'CARTEIRA_TRABALHO') {
        const url = funcionarioId === meuId
          ? '/api/funcionarios/me/documentos-pessoais'
          : `/api/funcionarios/${funcionarioId}/documentos-pessoais`;
        const { data } = await api.put<DocumentosPessoaisResponse>(url, {
          cpf: cpfLimpo,
          ctpsNumero: ctpsNumero.trim(),
          ctpsSerie: ctpsSerie.trim(),
          ctpsUfEmissor: ufNormalizada,
          pis: pisLimpo,
          ctpsDigital,
        });
        setDados(data);
      }
      if (arquivo) {
        const form = new FormData();
        form.append('requisitoId', String(editando.id));
        if (arquivo.file) {
          form.append('file', arquivo.file, arquivo.name);
        } else {
          form.append('file', arquivo as never);
        }
        const url = funcionarioId === meuId
          ? '/api/funcionarios/me/documentos'
          : `/api/funcionarios/${funcionarioId}/documentos`;
        await api.post(url, form);
      }
      setEditando(null);
      setArquivo(null);
      await onAtualizar();
    } catch (e) {
      setErro(mensagemErro(e, 'Não foi possível salvar o documento.'));
    } finally {
      setSalvando(false);
    }
  }

  return (
    <View style={styles.section}>
      <View>
        <Text style={styles.title}>Documentos exigidos</Text>
        <Text style={styles.subtitle}>Envie cada documento; o RH confere e aprova.</Text>
      </View>
      {carregando ? <ActivityIndicator color={color.brand} /> : null}
      {erro ? <Text style={styles.error}>{erro}</Text> : null}
      {!carregando && !requisitos.length ? (
        <Text style={styles.empty}>O RH não definiu documentos para envio.</Text>
      ) : null}
      {requisitos.map((requisito) => {
        const documento = anexos.get(requisito.id);
        const emEdicao = editando?.id === requisito.id;
        return (
          <View key={requisito.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardText}>
                <View style={styles.cardTitleRow}>
                  <Text style={styles.cardTitle}>{requisito.titulo}</Text>
                  <Status status={documento?.status} />
                </View>
                {requisito.descricao ? <Text style={styles.subtitle}>{requisito.descricao}</Text> : null}
              </View>
              {podeEditar && !emEdicao ? (
                <Pressable
                  style={styles.edit}
                  onPress={() => abrirEdicao(requisito)}
                  accessibilityRole="button"
                  accessibilityLabel={`${documento ? 'Atualizar' : 'Enviar'} ${requisito.titulo}`}
                >
                  <Text style={styles.editText}>{documento ? 'Atualizar' : 'Enviar'}</Text>
                </Pressable>
              ) : null}
            </View>

            {emEdicao ? (
              <View style={styles.form}>
                {requisito.tipo === 'CPF' ? (
                  <Campo label="Número do CPF" value={formatarCpf(cpf)}
                    onChangeText={(valor) => setCpf(somenteDigitos(valor))} />
                ) : null}
                {requisito.tipo === 'CARTEIRA_TRABALHO' ? (
                  <>
                    <Campo label="Número" value={ctpsNumero} onChangeText={setCtpsNumero} />
                    <Campo label="Série" value={ctpsSerie} onChangeText={setCtpsSerie} />
                    <Campo
                      label="UF emissor"
                      value={ctpsUf}
                      onChangeText={(valor) => setCtpsUf(normalizarUf(valor).slice(0, 2))}
                      autoCapitalize="characters"
                      maxLength={2}
                    />
                    <Campo
                      label="PIS"
                      value={pis}
                      onChangeText={(valor) => setPis(somenteDigitos(valor).slice(0, 11))}
                      keyboardType="number-pad"
                      maxLength={14}
                    />
                    <Pressable style={styles.selector}
                      onPress={() => setCtpsDigital((valor) => !valor)}>
                      <Text style={styles.selectorText}>
                        CTPS digital: {ctpsDigital ? 'Sim' : 'Não'}
                      </Text>
                    </Pressable>
                  </>
                ) : null}
                <Pressable style={styles.file} onPress={selecionarArquivo}>
                  <Paperclip color={color.brand} size={17} strokeWidth={2.2} />
                  <Text style={styles.fileText}>{arquivo?.name ?? 'Selecionar arquivo (PDF ou imagem)'}</Text>
                </Pressable>
                <View style={styles.actions}>
                  <Pressable style={styles.cancel} onPress={() => setEditando(null)}>
                    <Text style={styles.cancelText}>Cancelar</Text>
                  </Pressable>
                  <Pressable style={styles.save} disabled={salvando} onPress={salvar}>
                    <Text style={styles.saveText}>{salvando ? 'Enviando…' : 'Salvar e enviar'}</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <View style={styles.attachment}>
                {requisito.tipo === 'CPF' ? (
                  <Text style={styles.meta}>Número: {formatarCpf(dados?.cpf ?? '') || 'Não informado'}</Text>
                ) : null}
                {requisito.tipo === 'CARTEIRA_TRABALHO' ? (
                  <Text style={styles.meta}>
                    CTPS {dados?.ctpsNumero ?? 'não informada'}, PIS {dados?.pis ?? 'não informado'}
                  </Text>
                ) : null}
                {documento ? (
                  <Pressable
                    style={styles.downloadLink}
                    onPress={() => baixarArquivo(`/api/documentos/${documento.id}/download`, documento.nomeArquivo)}
                    accessibilityRole="link"
                    accessibilityLabel={`Baixar ${documento.nomeArquivo}`}
                  >
                    <Download color={color.brand} size={14} strokeWidth={2.2} />
                    <Text style={styles.link} numberOfLines={1}>{documento.nomeArquivo}</Text>
                  </Pressable>
                ) : (
                  <Text style={styles.meta}>Nenhum arquivo enviado.</Text>
                )}
                {documento?.motivoReprovacao ? (
                  <Text style={styles.reason}>Motivo da recusa: {documento.motivoReprovacao}</Text>
                ) : null}
              </View>
            )}

            {isAdmin && documento && !emEdicao ? (
              <View style={styles.actions}>
                {documento.status === 'PENDENTE' ? (
                  <>
                    <Pressable style={styles.approve} onPress={() => onAprovar(documento.id)} accessibilityRole="button">
                      <Text style={ui.btnTextSmOnColor}>Aprovar</Text>
                    </Pressable>
                    <Pressable style={styles.reject} onPress={() => setReprovando(documento)} accessibilityRole="button">
                      <Text style={ui.btnTextDanger}>Recusar</Text>
                    </Pressable>
                  </>
                ) : null}
                <Pressable style={styles.delete} onPress={() => onRemover(documento.id)} accessibilityRole="button">
                  <Text style={styles.deleteText}>Excluir arquivo</Text>
                </Pressable>
              </View>
            ) : null}
          </View>
        );
      })}

      <Modal visible={Boolean(reprovando)} transparent animationType="fade"
        onRequestClose={() => setReprovando(null)}>
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Recusar documento</Text>
            <Text style={styles.subtitle}>O colaborador verá este motivo e poderá reenviar.</Text>
            <TextInput style={[styles.input, styles.textarea]} value={motivo}
              onChangeText={setMotivo} multiline maxLength={255}
              placeholder="Explique o que precisa ser corrigido"
              placeholderTextColor={color.placeholder} />
            <View style={styles.modalActions}>
              <Pressable style={styles.cancel} onPress={() => setReprovando(null)}>
                <Text style={styles.cancelText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.rejectModal} onPress={() => {
                if (!reprovando || !motivo.trim()) return;
                onReprovar(reprovando.id, motivo.trim());
                setReprovando(null);
                setMotivo('');
              }}>
                <Text style={styles.saveText}>Recusar documento</Text>
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
  value,
  onChangeText,
  keyboardType,
  autoCapitalize,
  maxLength,
}: {
  label: string;
  value: string;
  onChangeText: (valor: string) => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  maxLength?: number;
}) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        maxLength={maxLength}
      />
    </View>
  );
}

function Status({ status }: { status?: StatusDocumento }) {
  const label = status === 'APROVADO'
    ? 'Aprovado'
    : status === 'REPROVADO'
      ? 'Recusado'
      : status === 'PENDENTE'
        ? 'Em análise'
        : 'Não enviado';
  const tom = status === 'APROVADO' ? 'ok' : status === 'REPROVADO' ? 'bad' : status === 'PENDENTE' ? 'warn' : 'neutral';
  return <Badge label={label} tom={tom} />;
}

function somenteDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

function normalizarUf(valor: string): string {
  return valor.replace(/[^a-zA-Z]/g, '').toUpperCase();
}

function formatarCpf(valor: string): string {
  return somenteDigitos(valor).slice(0, 11)
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1-$2');
}

function mensagemErro(e: unknown, fallback: string): string {
  if (isAxiosError(e)) {
    const data = e.response?.data as ApiError | undefined;
    const campos = data?.fields?.map((item) => item.message).filter(Boolean).join(' ');
    if (e.response?.status === 401) {
      return 'Sua sessão expirou ou o login não foi reconhecido. Saia e entre novamente antes de enviar documentos.';
    }
    return campos || data?.message || fallback;
  }
  return fallback;
}

const styles = StyleSheet.create({
  section: ui.section,
  title: ui.title,
  subtitle: ui.subtitle,
  empty: ui.empty,
  error: ui.error,
  card: ui.rowStack,
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  cardText: { flex: 1, minWidth: 0, gap: 2 },
  cardTitleRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 },
  cardTitle: ui.rowTitle,
  edit: { ...ui.btnSm, ...ui.btnSecondary },
  editText: ui.btnTextSm,
  form: { gap: 12, paddingTop: 4, maxWidth: 520 },
  field: ui.field,
  label: ui.label,
  input: ui.input,
  textarea: ui.textarea,
  selector: ui.input,
  selectorText: { color: color.ink, ...type.body },
  file: { minHeight: 48, borderWidth: 1, borderStyle: 'dashed', borderColor: color.lineStrong, borderRadius: 8, paddingHorizontal: 14, backgroundColor: color.canvas, flexDirection: 'row', alignItems: 'center', gap: 8 },
  fileText: { color: color.brand, ...type.body, fontWeight: '600' },
  actions: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  modalActions: ui.modalActions,
  cancel: { ...ui.btn, ...ui.btnSecondary },
  cancelText: ui.btnText,
  save: { ...ui.btn, ...ui.btnPrimary },
  approve: { ...ui.btnSm, ...ui.btnPrimary },
  reject: { ...ui.btnSm, ...ui.btnSecondary },
  rejectModal: { ...ui.btn, ...ui.btnDanger },
  saveText: ui.btnTextOnColor,
  attachment: { gap: 2 },
  meta: ui.rowMeta,
  link: ui.linkText,
  downloadLink: ui.link,
  reason: { color: color.danger, ...type.small },
  delete: { ...ui.btnSm, ...ui.btnQuiet },
  deleteText: ui.btnTextDanger,
  spacer: { flex: 1 },
  overlay: ui.overlay,
  modal: { ...ui.modal, maxWidth: 480 },
  modalTitle: ui.modalTitle,
});
